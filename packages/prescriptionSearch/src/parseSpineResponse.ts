import {XMLParser} from "fast-xml-parser"

// Types
import {Logger} from "@aws-lambda-powertools/logger"
import {
  XmlResponse,
  XmlSoapBody,
  XmlSearchResults,
  XmlPrescription,
  XmlIssueDetail,
  PatientDetails,
  PrescriptionDetails,
  IssueDetails,
  Prescription,
  XmlSoapEnvBody,
  XmlError,
  ParsedSpineResponse
} from "./types"

export const parseSpineResponse = (spineResponse: string, logger: Logger): ParsedSpineResponse => {
  const xmlParser: XMLParser = new XMLParser({ignoreAttributes: false})
  const xmlResponse = xmlParser.parse(spineResponse) as XmlResponse

  logger.info("Parsing XML SOAP body...")
  const xmlSoapBody: XmlSoapBody | undefined = xmlResponse["SOAP:Envelope"]?.["SOAP:Body"]
  if (!xmlSoapBody) {
    const error: string = parseErrorResponse(xmlResponse)
    if (error === "Prescription not found"){
      logger.info("No prescriptions found.")
      return [undefined, undefined] // TODO: Should no results be an error response, or an empty results response? - empty response
    }
    return [undefined, {status: "500", severity: "error", description: error}]
  }

  logger.info("Parsing search results...")
  const xmlSearchResults: XmlSearchResults = xmlSoapBody.prescriptionSearchResponse
    .PRESCRIPTIONSEARCHRESPONSE_SM01.ControlActEvent.subject.searchResults
  let xmlPrescriptions: XmlPrescription | Array<XmlPrescription> = xmlSearchResults.prescription
  if (!Array.isArray(xmlPrescriptions)) {
    xmlPrescriptions = [xmlPrescriptions]
  }

  logger.info("Parsing prescriptions...")
  let parsedPrescriptions: Array<Prescription> = parsePrescriptions(xmlPrescriptions)
  return [parsedPrescriptions, undefined]
}

const parsePrescriptions = (xmlPrescriptions: Array<XmlPrescription>): Array<Prescription> => {
  let parsedPrescriptions: Array<Prescription> = []

  for (const xmlPrescription of xmlPrescriptions) {
    const patientDetails: PatientDetails = {
      nhsNumber: xmlPrescription.patientId["@_value"],
      prefix: xmlPrescription.prefix["@_value"],
      suffix: xmlPrescription.suffix["@_value"],
      given: xmlPrescription.given["@_value"],
      family: xmlPrescription.family["@_value"]
    }

    const prescriptionDetails: PrescriptionDetails = {
      prescriptionId: xmlPrescription.id["@_value"],
      issueDate: xmlPrescription.prescribedDate["@_value"],
      treatmentType: xmlPrescription.prescriptionTreatmentType["@_value"],
      maxRepeats: xmlPrescription.maxRepeats["@_value"] === "None" ?
        undefined : Number(xmlPrescription.maxRepeats["@_value"])
    }

    let xmlIssues: XmlIssueDetail | Array<XmlIssueDetail> = xmlPrescription.issueDetail
    if (!Array.isArray(xmlIssues)) {
      xmlIssues = [xmlIssues]
    }

    for (const xmlIssue of xmlIssues) {
      const issueDetails: IssueDetails = {
        issueNumber: Number(xmlIssue.instanceNumber["@_value"]),
        status: xmlIssue.prescriptionStatus["@_value"],
        prescriptionPendingCancellation: convertXmlBool(xmlIssue.prescCancPending["@_value"]),
        itemsPendingCancellation: convertXmlBool(xmlIssue.liCancPending["@_value"])
      }
      const parsedPrescription: Prescription = {
        ...patientDetails,
        ...prescriptionDetails,
        ...issueDetails
      }
      parsedPrescriptions.push(parsedPrescription)
    }
  }
  return parsedPrescriptions
}

const convertXmlBool = (value: string): boolean => {
  return value === "True" ? true : false
}

const parseErrorResponse = (responseXml: XmlResponse): string => {
  const xmlSoapEnvBody: XmlSoapEnvBody | undefined = responseXml["SOAP-ENV:Envelope"]?.["SOAP-ENV:Body"]
  if (!xmlSoapEnvBody){
    return "Unknown Error."
  }

  const xmlError: XmlError = xmlSoapEnvBody.prescriptionSearchResponse
    .MCCI_IN010000UK13.acknowledgement.acknowledgementDetail.code

  return xmlError["@_displayName"]
}
