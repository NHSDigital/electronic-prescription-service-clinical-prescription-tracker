import {Logger} from "@aws-lambda-powertools/logger"
import {IssueDetails, PatientDetailsSummary, PrescriptionDetailsSummary} from "@cpt-common/common-types/prescription"
import {PrescriptionStatusCoding} from "@cpt-common/common-types/schema"
import {ServiceError} from "@cpt-common/common-types/service"
import {
  SPINE_TIMESTAMP_FORMAT,
  SpineTreatmentTypeCode,
  SpineXmlError,
  SpineXmlResponse
} from "@cpt-common/common-types/spine"
import * as DateFns from "date-fns"
import {XMLParser} from "fast-xml-parser"
import {PerformerSiteTypeCoding, PrescriptionTypeCoding} from "./schema/extensions"
import {StatusReasonCoding} from "./schema/medicationRequest"
import {HistoryMessage} from "./schema/actions"
import {DispenseStatusCoding} from "./schema/elements"

// Constants
export const SPINE_DOB_FORMAT = "yyyymmdd" as const
export const FHIR_DATE_FORMAT = "yyyy-mm-dd"

// XML Types
type XmlStringValue = {
  "@_value": string
}

interface XmlLineItem {
  order: XmlStringValue
  ID: XmlStringValue
  status: XmlStringValue
}

interface XmlDispenseNotification {
  dispenseNotificationID: string
  dispNotifDocumentKey: string
  dispenseNotifDateTime: string
  statusPrescription: string
  [productLineItem: `productLineItem${string}`]: string
  [quantityLineItem: `quantityLineItem${string}`]: string
  [narrativeLineItem: `narrativeLineItem${string}`]: string
  [statusLineItem: `statusLineItem${string}`]: string
  [dosageLineItem: `dosageLineItem${string}`]: string
}

interface XmlHistoryEvent {
  SCN: string
  messageID: string
}

interface XmlHistoryEventLineItem {
  order: string
  id: string
  toStatus: string
  cancellationReason?: string
}

interface XmlFilteredHistoryEvent {
  SCN: string
  timestamp: string
  toStatus: string
  message: string
  agentPersonOrgCode: string
  cancellationReason?: string
  lineStatusChangeDict: {
    line: Array<XmlHistoryEventLineItem> | XmlHistoryEventLineItem
  }
}

interface XmlEpsRecord {
  patientNhsNumber: string
  patientBirthTime: string
  prescriptionID: string
  instanceNumber: string
  prescriptionStatus: string
  prescriptionTreatmentType: string
  prescriptionType: string
  prescriptionTime: string
  maxRepeats?: string
  daysSupply?: string
  prescribingOrganization: string
  nominatedPerformer?: string
  nominatedPerformerType?: string
  dispensingOrganization?: string
  parentPrescription: {
    prefix?: string
    suffix?: string
    given?: string
    family?: string
    administrativeGenderCode?: string
    addrLine1?: string
    addrLine2?: string
    addrLine3?: string
    postalCode?: string
    [productLineItem: `productLineItem${string}`]: string
    [quantityLineItem: `quantityLineItem${string}`]: string
    [narrativeLineItem: `narrativeLineItem${string}`]: string
    [dosageLineItem: `dosageLineItem${string}`]: string
  }
  lineItem: Array<XmlLineItem> | XmlLineItem
  dispenseNotification?: Array<XmlDispenseNotification> | XmlDispenseNotification
  history: Array<XmlHistoryEvent> | XmlHistoryEvent
  filteredHistory: Array<XmlFilteredHistoryEvent> | XmlFilteredHistoryEvent
}

interface SpineClinicalView {
  PORX_IN000006UK98: {
    ControlActEvent: {
      subject: {
        PrescriptionJsonQueryResponse: {
          epsRecord: XmlEpsRecord
        }
      }
    }
  }
  MCCI_IN010000UK13: never
}

interface SpineXmlClinicalViewResponse {
  prescriptionClinicalViewResponse: SpineClinicalView | SpineXmlError
}

// Parsed response types
export type SpineGenderCode = 1 | 2 | 3 | 4

interface PatientDetails extends PatientDetailsSummary {
  birthDate: string
  gender?: SpineGenderCode
  address: {
    line: Array<string>
    postalCode?: string
  }
}

interface LineItemDetailsSummary {
  lineItemNo: string
  lineItemId: string
  status: DispenseStatusCoding["code"]
  itemName: string
  quantity: number
  quantityForm: string
  dosageInstruction?: string
}

interface LineItemDetails extends LineItemDetailsSummary {
  cancellationReason?: StatusReasonCoding["display"]
  pendingCancellation: boolean
}

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }
type DispenseNotificationLineItemDetails = WithRequired<Partial<LineItemDetailsSummary>, "lineItemNo" | "status">

interface DispenseNotificationDetails {
  dispenseNotificationId: string
  timestamp: string
  status: PrescriptionStatusCoding["code"]
  lineItems: {
    [key: string]: DispenseNotificationLineItemDetails

  }
}

interface HistoryEventDetails {
  eventId: string
  message: HistoryMessage
  messageId: string
  timestamp: string
  org: string
  newStatus: PrescriptionStatusCoding["code"]
  cancellationReason?: StatusReasonCoding["display"]
  isDispenseNotification: boolean
}

interface PrescriptionDetails extends PrescriptionDetailsSummary, IssueDetails {
  daysSupply?: number
  prescriptionType: PrescriptionTypeCoding["code"]
  prescriberOrg: string
  nominatedDispenserOrg?: string
  nominatedDisperserType: PerformerSiteTypeCoding["code"]
  dispenserOrg?: string
  lineItems: {
    [key: string]: LineItemDetails
  }
  dispenseNotifications: {
    [key: string]: DispenseNotificationDetails
  }
  history: {
    [key: string]: HistoryEventDetails
  }
}

export type Prescription = PatientDetails & PrescriptionDetails

export type ParsedSpineResponse = {prescription: Prescription} | { spineError: ServiceError}

export const parseSpineResponse = (spineResponse: string, logger: Logger): ParsedSpineResponse => {
  const xmlParser = new XMLParser({ignoreAttributes: false, parseTagValue: false})
  const xmlResponse = xmlParser.parse(spineResponse) as SpineXmlResponse<SpineXmlClinicalViewResponse>

  logger.debug("Parsing XML SOAP body...")
  const xmlSoapBody = xmlResponse["SOAP:Envelope"]?.["SOAP:Body"] || xmlResponse["SOAP-ENV:Envelope"]?.["SOAP-ENV:Body"]

  if (!xmlSoapBody) {
    logger.error("Failed to parse response, Spine response did not contain valid XML")
    return {spineError: {status: 500, severity: "error", description: "Unknown Error."}}
  }

  if (xmlSoapBody.prescriptionClinicalViewResponse.MCCI_IN010000UK13) {
    const error = xmlSoapBody.prescriptionClinicalViewResponse.MCCI_IN010000UK13
      .acknowledgement.acknowledgementDetail.code?.["@_displayName"] ?? "Unknown Error"

    const statusCode = error === "Prescription not found" ? 404 : 500

    return {spineError: {status: statusCode, severity: "error", description: error}}
  }

  const xmlEpsRecord = xmlSoapBody.prescriptionClinicalViewResponse.PORX_IN000006UK98
    .ControlActEvent.subject.PrescriptionJsonQueryResponse.epsRecord

  logger.debug("Parsing patient details...")
  const xmlParentPrescription = xmlEpsRecord.parentPrescription
  const patientDetails: PatientDetails = {
    nhsNumber: xmlEpsRecord.patientNhsNumber,
    ...(xmlParentPrescription.prefix ? {prefix: xmlParentPrescription.prefix} : {}),
    ...(xmlParentPrescription.suffix ? {suffix: xmlParentPrescription.suffix} : {}),
    ...(xmlParentPrescription.given ? {given: xmlParentPrescription.given} : {}),
    ...(xmlParentPrescription.family ? {family: xmlParentPrescription.family} : {}),
    birthDate: DateFns.format(DateFns.parse(
      xmlEpsRecord.patientBirthTime, SPINE_DOB_FORMAT, new Date()), FHIR_DATE_FORMAT),
    ...(xmlParentPrescription.administrativeGenderCode ?
      {gender: Number(xmlParentPrescription.administrativeGenderCode) as SpineGenderCode} : {}),
    address: {
      line: [
        ...(xmlParentPrescription.addrLine1 ? [xmlParentPrescription.addrLine1] : []),
        ...(xmlParentPrescription.addrLine2 ? [xmlParentPrescription.addrLine2] : []),
        ...(xmlParentPrescription.addrLine3 ? [xmlParentPrescription.addrLine3] : [])
      ],
      ...(xmlParentPrescription.postalCode ? {postalCode: xmlParentPrescription.postalCode} : {})
    }
  }

  logger.debug("Parsing prescription details...")
  const prescriptionDetails: PrescriptionDetails = {
    prescriptionId: xmlEpsRecord.prescriptionID,
    issueDate: DateFns.parse(xmlEpsRecord.prescriptionTime, SPINE_TIMESTAMP_FORMAT, new Date()).toISOString(),
    issueNumber: Number(xmlEpsRecord.instanceNumber),
    status: xmlEpsRecord.prescriptionStatus as PrescriptionStatusCoding["code"],
    treatmentType: xmlEpsRecord.prescriptionTreatmentType as SpineTreatmentTypeCode,
    prescriptionType: xmlEpsRecord.prescriptionType as PrescriptionTypeCoding["code"],
    ...(xmlEpsRecord.maxRepeats ? {maxRepeats: Number(xmlEpsRecord.maxRepeats)} : {}),
    ...(xmlEpsRecord.daysSupply ? {daysSupply: Number(xmlEpsRecord.daysSupply)} : {}),
    prescriptionPendingCancellation: false, //default to false but update when checking last history event
    prescriberOrg: xmlEpsRecord.prescribingOrganization,
    ...(xmlEpsRecord.nominatedPerformer ? {nominatedDispenserOrg: xmlEpsRecord.nominatedPerformer} : {}),
    nominatedDisperserType: xmlEpsRecord.nominatedPerformerType ?
      xmlEpsRecord.nominatedPerformerType as PerformerSiteTypeCoding["code"] : "0004", // default to 0004 (None)
    ...(xmlEpsRecord.dispensingOrganization ? {dispenserOrg: xmlEpsRecord.dispensingOrganization} : {}),
    lineItems: {},
    dispenseNotifications: {},
    history: {}
  }

  let xmlLineItems = xmlEpsRecord.lineItem
  if (!Array.isArray(xmlLineItems)) {
    xmlLineItems = [xmlLineItems]
  }

  // Parse each line item
  for (const xmlLineItem of xmlLineItems) {
    const lineItemNo = xmlLineItem.order["@_value"]

    console.debug("Parsing line item...", {lineItemNo})
    const lineItem: LineItemDetails = {
      lineItemNo,
      lineItemId: xmlLineItem.ID["@_value"],
      status: xmlLineItem.status["@_value"] as DispenseStatusCoding["code"],
      itemName: xmlParentPrescription[`productLineItem${lineItemNo}`],
      quantity: Number(xmlParentPrescription[`quantityLineItem${lineItemNo}`]),
      quantityForm: xmlParentPrescription[`narrativeLineItem${lineItemNo}`],
      ...(xmlParentPrescription[`dosageLineItem${lineItemNo}`] ?
        {dosageInstruction: xmlParentPrescription[`dosageLineItem${lineItemNo}`]} : {}),
      pendingCancellation: false //default to false but update when checking last history events line items
    }
    prescriptionDetails.lineItems[lineItemNo] = lineItem
  }

  let xmlDispenseNotifications = xmlEpsRecord.dispenseNotification
  if (!Array.isArray(xmlDispenseNotifications)) {
    xmlDispenseNotifications = [...(xmlDispenseNotifications ? [xmlDispenseNotifications] : [])]
  }

  // Parse each dispense notification
  for (const xmlDispenseNotification of xmlDispenseNotifications) {
    const dispenseNotificationId = xmlDispenseNotification.dispenseNotificationID
    logger.debug("Parsing dispense notification...", {dispenseNotificationId})
    const dispenseNotification: DispenseNotificationDetails = {
      dispenseNotificationId,
      timestamp: DateFns.parse(
        xmlDispenseNotification.dispenseNotifDateTime, SPINE_TIMESTAMP_FORMAT, new Date()).toISOString(),
      status: xmlDispenseNotification.statusPrescription as PrescriptionStatusCoding["code"],
      lineItems: {}
    }

    // Parse each line item of the DN
    for (const [lineItemNo, LineItemDetails] of Object.entries(prescriptionDetails.lineItems)) {
      logger.debug("Parsing dispense notifications line item...", {dispenseNotificationId, lineItemNo})
      /* - Include empty and undefined values for partial DN's
         - Include 0 quantity items
      */
      const status = xmlDispenseNotification[`statusLineItem${lineItemNo}`] as DispenseStatusCoding["code"]
      if(status) {
        const lineItem: DispenseNotificationLineItemDetails = {
          lineItemNo,
          lineItemId: LineItemDetails.lineItemId,
          status,
          itemName: xmlDispenseNotification[`productLineItem${lineItemNo}`],
          quantity: Number(xmlDispenseNotification[`quantityLineItem${lineItemNo}`]),
          quantityForm: xmlDispenseNotification[`narrativeLineItem${lineItemNo}`],
          ...(xmlDispenseNotification[`dosageLineItem${lineItemNo}`] ?
            {dosageInstruction: xmlDispenseNotification[`dosageLineItem${lineItemNo}`]} : {})
        }
        dispenseNotification.lineItems[lineItemNo] = lineItem
      }
    }

    prescriptionDetails.dispenseNotifications[dispenseNotificationId] = dispenseNotification
  }

  let xmlFilteredHistory = xmlEpsRecord.filteredHistory
  if (!Array.isArray(xmlFilteredHistory)) {
    xmlFilteredHistory = [xmlFilteredHistory]
  }

  let xmlHistory = xmlEpsRecord.history
  if (!Array.isArray(xmlHistory)) {
    xmlHistory = [xmlHistory]
  }

  // Parse each event in the filtered history
  for (const [eventIndex, xmlFilteredHistoryEvent] of xmlFilteredHistory.entries()) {
    const finalEvent = eventIndex === xmlHistory.length - 1

    const eventId = xmlFilteredHistoryEvent.SCN
    const message = (xmlFilteredHistoryEvent.message).split(";")[0] // Remove unwanted additional information after the ";"

    // Need to find corresponding event from the full history to parse the events full details
    const xmlHistoryEvent = xmlHistory.find((event) => event.SCN === eventId)!

    logger.debug("Parsing history event...", {scn: eventId})
    // Determine if cancellation reason is pending, but remove from value to return
    let cancellationReason = xmlFilteredHistoryEvent.cancellationReason as StatusReasonCoding["display"] | undefined
    let pendingCancellation = false
    if (cancellationReason?.startsWith("Pending: ")){
      pendingCancellation = true
      cancellationReason = cancellationReason.substring(9) as StatusReasonCoding["display"]
    }

    if (finalEvent){
      prescriptionDetails.prescriptionPendingCancellation = pendingCancellation
    }

    const historyEvent: HistoryEventDetails = {
      eventId,
      message: message as HistoryMessage,
      messageId: xmlHistoryEvent.messageID.slice(1, -1), // This id matches the DN ID for relevant events. Strip unnecessary "" from value
      timestamp: DateFns.parse(xmlFilteredHistoryEvent.timestamp, SPINE_TIMESTAMP_FORMAT, new Date()).toISOString(),
      org: xmlFilteredHistoryEvent.agentPersonOrgCode,
      newStatus: xmlFilteredHistoryEvent.toStatus as PrescriptionStatusCoding["code"],
      ...(cancellationReason ? {cancellationReason} : {}),
      isDispenseNotification: message.includes("Dispense notification successful")
    }

    let xmlEventLineItems = xmlFilteredHistoryEvent.lineStatusChangeDict.line
    if (!Array.isArray(xmlEventLineItems)) {
      xmlEventLineItems = [xmlEventLineItems]
    }

    // Parse each line item of the event
    for (const xmlEventLineItem of xmlEventLineItems) {
      const lineItemNo = xmlEventLineItem.order

      // Determine if cancellation reason is pending, but remove from value to return
      let itemCancellationReason = xmlEventLineItem.cancellationReason as StatusReasonCoding["display"] | undefined
      let itemPendingCancellation = false
      if (itemCancellationReason?.startsWith("Pending: ")){
        itemPendingCancellation = true
        itemCancellationReason = itemCancellationReason?.substring(9) as StatusReasonCoding["display"]
      }

      logger.debug("Parsing history event line item...", {scn: eventId, lineItemNo})
      if (finalEvent && itemCancellationReason) {
        prescriptionDetails.lineItems[lineItemNo].pendingCancellation = itemPendingCancellation
        prescriptionDetails.lineItems[lineItemNo].cancellationReason = itemCancellationReason
      }
    }

    prescriptionDetails.history[eventId] = historyEvent
  }

  return {
    prescription: {
      ...patientDetails,
      ...prescriptionDetails
    }
  }
}
