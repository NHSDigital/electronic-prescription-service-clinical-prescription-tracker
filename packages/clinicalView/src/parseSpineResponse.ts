import {Logger} from "@aws-lambda-powertools/logger"
import {
  DispenseNotificationDetails,
  EventLineItem,
  HistoryEventDetails,
  LineItemDetails,
  LineItemDetailsSummary,
  PatientDetails,
  Prescription,
  PrescriptionDetails,
  ServiceError,
  SpineXmlClinicalViewResponse,
  SpineXmlResponse
} from "@cpt-common/common-types"
import {XMLParser} from "fast-xml-parser"

export interface ParsedSpineResponse {
  prescription?: Prescription | undefined
  spineError?: ServiceError | undefined
}

export const parseSpineResponse = (spineResponse: string, logger: Logger): ParsedSpineResponse => {
  const xmlParser = new XMLParser({ignoreAttributes: false})
  const xmlResponse = xmlParser.parse(spineResponse) as SpineXmlResponse

  logger.info("Parsing XML SOAP body...")
  const xmlSoapBody = xmlResponse["SOAP:Envelope"]?.["SOAP:Body"] as SpineXmlClinicalViewResponse | undefined
  || xmlResponse["SOAP-ENV:Envelope"]?.["SOAP-ENV:Body"] as SpineXmlClinicalViewResponse | undefined

  if (!xmlSoapBody) {
    logger.error("Failed to parse response, Spine response did not contain valid XML")
    return {spineError: {status: "500", severity: "error", description: "Unknown Error."}}
  }

  if (xmlSoapBody?.prescriptionClinicalViewResponse?.MCCI_IN010000UK13){
    const error = xmlSoapBody?.prescriptionClinicalViewResponse?.MCCI_IN010000UK13
      ?.acknowledgement?.acknowledgementDetail?.code?.["@_displayName"] ?? "Unknown Error"

    return {spineError: {status: "500", severity: "error", description: error}}
  }

  const xmlEpsRecord = xmlSoapBody.prescriptionClinicalViewResponse.PORX_IN000006UK98
    .ControlActEvent.subject.PrescriptionJsonQueryResponse.epsRecord

  // TODO: logs
  const patientDetails: PatientDetails = {
    nhsNumber: xmlEpsRecord.patientNhsNumber,
    prefix: xmlEpsRecord.parentPrescription.prefix,
    suffix: xmlEpsRecord.parentPrescription.suffix,
    given: xmlEpsRecord.parentPrescription.given,
    family: xmlEpsRecord.parentPrescription.family,
    birthDate: xmlEpsRecord.patientBirthTime,
    gender: Number(xmlEpsRecord.parentPrescription.administrativeGenderCode),
    address: {
      line: [
        ...(xmlEpsRecord.parentPrescription.addrLine1 ? [xmlEpsRecord.parentPrescription.addrLine1]: []),
        ...(xmlEpsRecord.parentPrescription.addrLine2 ? [xmlEpsRecord.parentPrescription.addrLine2]: []),
        ...(xmlEpsRecord.parentPrescription.addrLine3 ? [xmlEpsRecord.parentPrescription.addrLine3]: [])
      ],
      postalCode: xmlEpsRecord.parentPrescription.postalCode
    }
  }

  const prescriptionDetails: PrescriptionDetails = {
    prescriptionId: xmlEpsRecord.prescriptionID,
    issueDate: xmlEpsRecord.prescriptionTime,
    issueNumber: Number(xmlEpsRecord.instanceNumber),
    status: xmlEpsRecord.prescriptionStatus,
    treatmentType: xmlEpsRecord.prescriptionTreatmentType,
    maxRepeats: Number(xmlEpsRecord.maxRepeats),
    daysSupply: Number(xmlEpsRecord.daysSupply),
    prescriptionPendingCancellation: false, //default to false but update when checking last history event
    itemsPendingCancellation: false, //default to false but update when checking last history events line items
    prescriberOrg: xmlEpsRecord.prescribingOrganization,
    nominatedDispenserOrg: xmlEpsRecord.nominatedPerformer,
    dispenserOrg: xmlEpsRecord?.dispensingOrganization,
    lineItems: {},
    dispenseNotifications: {},
    history: {}
  }

  let xmlLineItems = xmlEpsRecord.lineItem
  if(!Array.isArray(xmlLineItems)) {
    xmlLineItems = [xmlLineItems]
  }

  for (const xmlLineItem of xmlLineItems){
    const lineItemNo = xmlLineItem.order["@_value"]

    const lineItem: LineItemDetails = {
      lineItemNo,
      lineItemId: xmlLineItem.ID["@_value"],
      status: xmlLineItem.status["@_value"],
      itemName: xmlEpsRecord.parentPrescription[`productLineItem${lineItemNo}`],
      quantity: Number(xmlEpsRecord.parentPrescription[`quantityLineItem${lineItemNo}`]),
      quantityForm: xmlEpsRecord.parentPrescription[`narrativeLineItem${lineItemNo}`],
      dosageInstruction: xmlEpsRecord.parentPrescription[`dosageLineItem${lineItemNo}`],
      pendingCancellation: false //default to false but update when checking last history events line items
    }
    prescriptionDetails.lineItems[lineItemNo] = lineItem
  }

  let xmlDispenseNotifications = xmlEpsRecord.dispenseNotification
  if (!Array.isArray(xmlDispenseNotifications)) {
    xmlDispenseNotifications = [xmlDispenseNotifications]
  }

  for (const xmlDispenseNotification of xmlDispenseNotifications) {
    const dispenseNotificationId = xmlDispenseNotification.dispenseNotificationID
    const dispenseNotification: DispenseNotificationDetails = {
      dispenseNotificationId,
      timestamp: xmlDispenseNotification.dispenseNotifDateTime,
      status: xmlDispenseNotification.statusPrescription,
      lineItems: {}
    }

    for (const lineItemNo of Object.keys(prescriptionDetails.lineItems)){
      const quantity = Number(xmlDispenseNotification[`quantityLineItem${lineItemNo}`])
      if (quantity === 0) {
        continue
      }

      const lintItem: LineItemDetailsSummary = {
        lineItemNo,
        status: xmlDispenseNotification[`statusLineItem${lineItemNo}`],
        itemName: xmlDispenseNotification[`productLineItem${lineItemNo}`],
        quantity,
        quantityForm: xmlDispenseNotification[`narrativeLineItem${lineItemNo}`],
        dosageInstruction: xmlDispenseNotification[`dosageLineItem${lineItemNo}`]
      }
      dispenseNotification.lineItems[lineItemNo] = lintItem
    }

    prescriptionDetails.dispenseNotifications[dispenseNotificationId] = dispenseNotification
  }

  let xmlHistory = xmlEpsRecord.history
  if (!Array.isArray(xmlHistory)) {
    xmlHistory = [xmlHistory]
  }

  let xmlFilteredHistory = xmlEpsRecord.filteredHistory
  if (!Array.isArray(xmlFilteredHistory)) {
    xmlFilteredHistory = [xmlFilteredHistory]
  }

  for (const [eventIndex, xmlHistoryEvent] of xmlHistory.entries()){
    const finalEvent = eventIndex === xmlHistory.length - 1

    const eventId = xmlHistoryEvent.SCN
    const message = xmlHistoryEvent.message
    const xmlFilteredHistoryEvent = xmlFilteredHistory.find((event) => event.SCN === eventId)!

    const historyEvent: HistoryEventDetails = {
      eventId,
      message,
      messageId: xmlHistoryEvent.messageID, // this matches the DN ID for relevant events
      timestamp: xmlHistoryEvent.timestamp ?? xmlFilteredHistoryEvent.timestamp, //Timestamp in history could be empty
      org: xmlHistoryEvent.agentPersonOrgCode,
      newStatus: xmlHistoryEvent.status,
      cancellationReason: xmlFilteredHistoryEvent.cancellationReason,
      isDispenseNotification: message.includes("Dispense notification successful"),
      lineItems: {}
    }

    let xmlEventLineItems = xmlFilteredHistoryEvent.lineStatusChangeDict.line
    if (!Array.isArray(xmlEventLineItems)){
      xmlEventLineItems = [xmlEventLineItems]
    }
    for(const xmlEventLineItem of xmlEventLineItems){
      const lineItemNo = xmlEventLineItem.order
      const cancellationReason = xmlEventLineItem.cancellationReason

      if (finalEvent){
        if (cancellationReason?.includes("Pending")){
          prescriptionDetails.itemsPendingCancellation = true
          prescriptionDetails.lineItems[lineItemNo].pendingCancellation = true
        }
        prescriptionDetails.lineItems[lineItemNo].cancellationReason = cancellationReason
      }

      const lineItem: EventLineItem = {
        lineItemNo,
        newStatus: xmlEventLineItem.toStatus,
        cancellationReason
      }
      historyEvent.lineItems[lineItemNo] = lineItem
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
