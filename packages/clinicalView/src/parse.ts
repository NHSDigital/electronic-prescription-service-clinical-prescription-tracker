import {Logger} from "@aws-lambda-powertools/logger"
import {
  LineItemDetails,
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
    issueDate: "", // TODO tbc field to parse
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
    const dispenseNotification = {
    }
    /* TODO: what is the actual DN id?
    - do they always have props for all 4 items but they could be empty?
    - if so going to make sure if multiple they split items properly
    - how to tie DN to history, timestamp seems to be the only thing ive found that sort of carries across*/
  }

  return {
    ...patientDetails,
    ...prescriptionDetails
  }
}
