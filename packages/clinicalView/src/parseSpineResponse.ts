import {Logger} from "@aws-lambda-powertools/logger"
import {IssueDetails, PatientDetailsSummary, PrescriptionDetailsSummary} from "@cpt-common/common-types/prescription"
import {CancellationReasonCoding, PrescriptionStatusCoding} from "@cpt-common/common-types/schema"
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
import {HistoryMessage} from "./schema/actions"
import {DispenseStatusCoding} from "./schema/elements"

export const SPINE_DOB_FORMAT = "yyyymmdd" as const
export const FHIR_DATE_FORMAT = "yyyy-mm-dd"

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
  nonDispensingReasonPrescription: string
  [productLineItem: `productLineItem${string}`]: string
  [quantityLineItem: `quantityLineItem${string}`]: string
  [narrativeLineItem: `narrativeLineItem${string}`]: string
  [statusLineItem: `statusLineItem${string}`]: string
  [dosageLineItem: `dosageLineItem${string}`]: string
  [nonDispensingReasonLineItem: `nonDispensingReasonLineItem${string}`]: string
  [componentsLineItem: `componentsLineItem${string}`]: string
}

interface XmlHistoryEventLineItem {
  order: string
  id: string
  toStatus: string
  cancellationReason?: string
}

interface XmlFilteredHistoryEvent {
  SCN: string
  internalId: string
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
  lastDispenseNotificationGuid?: string
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

export type SpineGenderCode = 1 | 2 | 3 | 4

interface spineComponentDetails {
  product: string
  quantity: string
  narrative: string
  dosage: string
}

interface PatientDetails extends PatientDetailsSummary {
  birthDate: string
  gender?: SpineGenderCode
  address: {
    line: Array<string>
    postalCode?: string
  }
}

interface ComponentDetails {
  itemName: string
  quantity: number
  quantityForm: string
  dosageInstruction?: string
}
interface LineItemDetailsSummary {
  lineItemNo: string
  lineItemId: string
  status: DispenseStatusCoding["code"]
}

interface LineItemDetails extends LineItemDetailsSummary, ComponentDetails {
  cancellationReason?: CancellationReasonCoding["display"]
  pendingCancellation: boolean
}

interface DispenseNotificationLineItemDetails extends LineItemDetailsSummary {
  nonDispensingReason?: string
  components: Array<Partial<ComponentDetails>>
}

interface DispenseNotificationDetails {
  dispenseNotificationId: string
  dispenseNotificationDocumentKey: string
  timestamp: string
  status: PrescriptionStatusCoding["code"]
  nonDispensingReason?: string
  isLastDispenseNotification: boolean
  lineItems: {
    [key: string]: DispenseNotificationLineItemDetails

  }
}

interface HistoryEventDetails {
  eventId: string
  internalId: string
  message: HistoryMessage
  timestamp: string
  org: string
  newStatus: PrescriptionStatusCoding["code"]
  cancellationReason?: CancellationReasonCoding["display"]
  isDispenseNotification: boolean
}

interface PrescriptionDetails extends PrescriptionDetailsSummary, IssueDetails {
  daysSupply?: number
  prescriptionType: PrescriptionTypeCoding["code"]
  prescriberOrg: string
  nominatedDispenserOrg?: string
  nominatedDisperserType: PerformerSiteTypeCoding["code"]
  dispenserOrg?: string
  lastDispenseNotification?: string
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
    ...(xmlEpsRecord.lastDispenseNotificationGuid ?
      {lastDispenseNotification: xmlEpsRecord.lastDispenseNotificationGuid}: {}),
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

    logger.debug("Parsing line item...", {lineItemNo})
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
    const dispenseNotificationDocumentKey = xmlDispenseNotification.dispNotifDocumentKey
    logger.debug("Parsing dispense notification...", {dispenseNotificationId})
    const dispenseNotification: DispenseNotificationDetails = {
      dispenseNotificationId,
      dispenseNotificationDocumentKey,
      timestamp: DateFns.parse(
        xmlDispenseNotification.dispenseNotifDateTime, SPINE_TIMESTAMP_FORMAT, new Date()).toISOString(),
      status: xmlDispenseNotification.statusPrescription as PrescriptionStatusCoding["code"],
      isLastDispenseNotification: dispenseNotificationId === prescriptionDetails.lastDispenseNotification,
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
        /* The JSON string in components gets mangled a bit in the xml response, need to first remove any line breaks
        and tabs from it to get it back to a valid format before being able to JSON parse it */
        const rawSpineComponents = xmlDispenseNotification[`componentsLineItem${lineItemNo}`]
        const spineComponents: Array<spineComponentDetails> = rawSpineComponents ?
          JSON.parse(rawSpineComponents.replace(/\r?\n\t*|\r/gm, "")) : []

        const lineItem: DispenseNotificationLineItemDetails = {
          lineItemNo,
          lineItemId: LineItemDetails.lineItemId,
          status,
          components: []
        }

        for (const component of spineComponents){
          lineItem.components.push({
            itemName: component.product,
            quantity: Number(component.quantity),
            quantityForm: component.narrative,
            dosageInstruction: component.dosage
          })
        }
        dispenseNotification.lineItems[lineItemNo] = lineItem
      }
    }
    prescriptionDetails.dispenseNotifications[dispenseNotificationDocumentKey] = dispenseNotification
  }

  let xmlFilteredHistory = xmlEpsRecord.filteredHistory
  if (!Array.isArray(xmlFilteredHistory)) {
    xmlFilteredHistory = [xmlFilteredHistory]
  }

  // Parse each event in the filtered history
  for (const [eventIndex, xmlFilteredHistoryEvent] of xmlFilteredHistory.entries()) {
    const finalEvent = eventIndex === xmlFilteredHistory.length - 1

    const eventId = xmlFilteredHistoryEvent.SCN
    const message = (xmlFilteredHistoryEvent.message).split(";")[0] // Remove unwanted additional information after the ";"

    logger.debug("Parsing history event...", {scn: eventId})
    // Determine if cancellation reason is pending, but remove from value to return
    let cancellationReason =
      xmlFilteredHistoryEvent.cancellationReason as CancellationReasonCoding["display"] | undefined
    let pendingCancellation = false
    if (cancellationReason?.startsWith("Pending: ")){
      pendingCancellation = true
      cancellationReason = cancellationReason.substring(9) as CancellationReasonCoding["display"]
    }

    if (finalEvent){
      prescriptionDetails.prescriptionPendingCancellation = pendingCancellation
    }

    const historyEvent: HistoryEventDetails = {
      eventId,
      internalId: xmlFilteredHistoryEvent.internalId, // This matches the DN doc key for relevant events.
      message: message as HistoryMessage,
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
      let itemCancellationReason =
        xmlEventLineItem.cancellationReason as CancellationReasonCoding["display"] | undefined
      let itemPendingCancellation = false
      if (itemCancellationReason?.startsWith("Pending: ")){
        itemPendingCancellation = true
        itemCancellationReason = itemCancellationReason?.substring(9) as CancellationReasonCoding["display"]
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
