import {Logger} from "@aws-lambda-powertools/logger"
import {
  DispenseNotificationDetails,
  LineItemDetails,
  LineItemDetailsSummary,
  PatientDetails,
  PrescriptionDetails,
  SpineXmlClinicalViewResponse,
  SpineXmlResponse
} from "@cpt-common/common-types"
import {XMLParser} from "fast-xml-parser"

// TODO: add return type
export const parseSpineResponse = (spineResponse: string, logger: Logger) => {
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
  // TODO: structure checking?
  // TODO: add ? for defaults

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
        xmlEpsRecord.parentPrescription.addrLine1,
        xmlEpsRecord.parentPrescription.addrLine2,
        xmlEpsRecord.parentPrescription.addrLine3
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
    prescriptionPendingCancellation: false, //default to false but update when checking line items
    itemsPendingCancellation: false, //default to false but update when checking line items
    prescriberOrg: xmlEpsRecord.prescribingOrganization,
    nominatedDispenserOrg: xmlEpsRecord.nominatedPerformer,
    dispenserOrg: xmlEpsRecord?.dispensingOrganization,
    lineItems: {},
    dispenseNotifications: {}, // TODO
    history: [] //TODO / do we just need the split out DN's?
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
      dosageInstruction: xmlEpsRecord.parentPrescription[`dosageLineItem${lineItemNo}`]
    }
    prescriptionDetails.lineItems[lineItemNo] = lineItem
  }

  let xmlDispenseNotifications = xmlEpsRecord.dispenseNotification
  if (!Array.isArray(xmlDispenseNotifications)) {
    xmlDispenseNotifications = [xmlDispenseNotifications]
  }

  for (const xmlDispenseNotification of xmlDispenseNotifications) {
    /* Use the first 14 characters of the DN's document key as an id as this matches the timestamp of the
    relevant event in the history and can be used to tie them together */
    const dispenseNotificationId = xmlDispenseNotification.dispNotifDocumentKey.substring(0, 14)

    let lineItems: {[key: string]: LineItemDetailsSummary} = {}
    for (const lineItemNo of Object.keys(prescriptionDetails.lineItems)){
      const lintItem: LineItemDetailsSummary = {
        lineItemNo,
        status: xmlDispenseNotification[`statusLineItem${lineItemNo}`],
        itemName: xmlDispenseNotification[`productLineItem${lineItemNo}`],
        quantity: Number(xmlDispenseNotification[`quantityLineItem${lineItemNo}`]),
        quantityForm: xmlDispenseNotification[`narrativeLineItem${lineItemNo}`],
        dosageInstruction: xmlDispenseNotification[`dosageLineItem${lineItemNo}`]
      }
      lineItems[lineItemNo] = lintItem
    }

    // TODO: status reasons?
    const dispenseNotification: DispenseNotificationDetails = {
      dispenseNotificationId,
      timestamp: xmlDispenseNotification.dispenseNotifDateTime,
      status: xmlDispenseNotification.statusPrescription,
      lineItems
    }
    prescriptionDetails.dispenseNotifications[dispenseNotificationId] = dispenseNotification
  }

  let xmlDispenseHistory = xmlEpsRecord.dispenseNotification
  if (!Array.isArray(xmlDispenseHistory)) {
    xmlDispenseHistory = [xmlDispenseHistory]
  }
  // for (const xmlHistoryEvent of xmlDispenseHistory){
  //   //
  // }

  return {
    ...patientDetails,
    ...prescriptionDetails
  }
}
