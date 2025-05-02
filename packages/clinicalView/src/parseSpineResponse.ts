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
  SPINE_TIMESTAMP_FORMAT,
  SpineXmlClinicalViewResponse,
  SpineXmlResponse
} from "@cpt-common/common-types"
import {parse} from "date-fns"
import {XMLParser} from "fast-xml-parser"

export interface ParsedSpineResponse {
  prescription?: Prescription | undefined
  spineError?: ServiceError | undefined
}

export const parseSpineResponse = (spineResponse: string, logger: Logger): ParsedSpineResponse => {
  const xmlParser = new XMLParser({ignoreAttributes: false, parseTagValue: false})
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

    const statusCode = error === "Prescription not found" ? "404" : "500"

    return {spineError: {status: statusCode, severity: "error", description: error}}
  }

  const xmlEpsRecord = xmlSoapBody.prescriptionClinicalViewResponse.PORX_IN000006UK98
    .ControlActEvent.subject.PrescriptionJsonQueryResponse.epsRecord

  // TODO: logs
  // TODO: put patient details under a patient key rather than root?
  const xmlParentPrescription = xmlEpsRecord.parentPrescription
  const patientDetails: PatientDetails = {
    nhsNumber: xmlEpsRecord.patientNhsNumber,
    ...(xmlParentPrescription.prefix ? {prefix: xmlParentPrescription.prefix}: {}),
    ...(xmlParentPrescription.suffix ? {suffix: xmlParentPrescription.suffix} : {}),
    ...(xmlParentPrescription.given ? {given: xmlParentPrescription.given} : {}),
    ...(xmlParentPrescription.family ? {family: xmlParentPrescription.family} : {}),
    birthDate: xmlEpsRecord.patientBirthTime,
    ...(xmlParentPrescription.administrativeGenderCode ?
      {gender: Number(xmlParentPrescription.administrativeGenderCode)} : {}),
    address: {
      line: [
        ...(xmlParentPrescription.addrLine1 ? [xmlParentPrescription.addrLine1]: []),
        ...(xmlParentPrescription.addrLine2 ? [xmlParentPrescription.addrLine2]: []),
        ...(xmlParentPrescription.addrLine3 ? [xmlParentPrescription.addrLine3]: [])
      ],
      ...(xmlParentPrescription.postalCode ? {postalCode: xmlParentPrescription.postalCode} : {})
    }
  }

  const prescriptionDetails: PrescriptionDetails = {
    prescriptionId: xmlEpsRecord.prescriptionID,
    issueDate: parse(xmlEpsRecord.prescriptionTime, SPINE_TIMESTAMP_FORMAT, new Date()).toISOString(),
    issueNumber: Number(xmlEpsRecord.instanceNumber),
    status: xmlEpsRecord.prescriptionStatus,
    treatmentType: xmlEpsRecord.prescriptionTreatmentType,
    prescriptionType: xmlEpsRecord.prescriptionType,
    ...(xmlEpsRecord.maxRepeats ? {maxRepeats: Number(xmlEpsRecord.maxRepeats)} : {}),
    ...(xmlEpsRecord.daysSupply ? {daysSupply: Number(xmlEpsRecord.daysSupply)} : {}),
    prescriptionPendingCancellation: false, //default to false but update when checking last history event
    itemsPendingCancellation: false, //default to false but update when checking last history events line items
    prescriberOrg: xmlEpsRecord.prescribingOrganization,
    ...(xmlEpsRecord.nominatedPerformer ? {nominatedDispenserOrg: xmlEpsRecord.nominatedPerformer} : {}),
    ...(xmlEpsRecord.dispensingOrganization ? {dispenserOrg: xmlEpsRecord.dispensingOrganization} : {}),
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
    xmlDispenseNotifications = [...(xmlDispenseNotifications ? [xmlDispenseNotifications]: [])]
  }

  for (const xmlDispenseNotification of xmlDispenseNotifications) {
    const dispenseNotificationId = xmlDispenseNotification.dispenseNotificationID
    const dispenseNotification: DispenseNotificationDetails = {
      dispenseNotificationId,
      timestamp: parse(xmlDispenseNotification.dispenseNotifDateTime, SPINE_TIMESTAMP_FORMAT, new Date()).toISOString(),
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
        ...(xmlDispenseNotification[`dosageLineItem${lineItemNo}`] ?
          {dosageInstruction: xmlDispenseNotification[`dosageLineItem${lineItemNo}`]} : {})
      }
      dispenseNotification.lineItems[lineItemNo] = lintItem
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

  for (const [eventIndex, xmlFilteredHistoryEvent] of xmlFilteredHistory.entries()){
    const finalEvent = eventIndex === xmlHistory.length - 1

    const eventId = xmlFilteredHistoryEvent.SCN
    const message = xmlFilteredHistoryEvent.message
    const xmlHistoryEvent = xmlHistory.find((event) => event.SCN === eventId)!

    const historyEvent: HistoryEventDetails = {
      eventId,
      message,
      messageId: xmlHistoryEvent.messageID.slice(1, -1), // This id matches the DN ID for relevant events. Strip unnecessary "" from value
      timestamp: parse(xmlFilteredHistoryEvent.timestamp, SPINE_TIMESTAMP_FORMAT, new Date()).toISOString(),
      org: xmlFilteredHistoryEvent.agentPersonOrgCode,
      newStatus: xmlFilteredHistoryEvent.toStatus,
      ...(xmlFilteredHistoryEvent.cancellationReason ?
        {cancellationReason: xmlFilteredHistoryEvent.cancellationReason} : {}),
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

      if (finalEvent && cancellationReason){
        if (cancellationReason?.includes("Pending")){
          prescriptionDetails.itemsPendingCancellation = true
          prescriptionDetails.lineItems[lineItemNo].pendingCancellation = true
        }
        prescriptionDetails.lineItems[lineItemNo].cancellationReason = cancellationReason
      }

      const lineItem: EventLineItem = {
        lineItemNo,
        newStatus: xmlEventLineItem.toStatus,
        ...(cancellationReason ? {cancellationReason} : {})
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
// TODO: would any of this benefit from some brief comments or some refactoring to break it up?
/* TODO: do all possible optionals as per spine template need to be covered even if in practice they should be populated?
  is it fine it it errors if they are missing? */
