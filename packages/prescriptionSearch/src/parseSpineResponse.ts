import {XMLParser} from "fast-xml-parser"
import {Logger} from "@aws-lambda-powertools/logger"

export type XmlStringValue = {
  "@_value": string
}

export interface XmlIssueDetail {
  instanceNumber: XmlStringValue
  prescriptionStatus: XmlStringValue
  prescCancPending: XmlStringValue
  liCancPending: XmlStringValue
}

export interface XmlPrescription {
  id: XmlStringValue
  patientId: XmlStringValue
  prefix: XmlStringValue
  suffix: XmlStringValue
  given: XmlStringValue
  family: XmlStringValue
  issueDetail: XmlIssueDetail | Array<XmlIssueDetail>
  prescribedDate: XmlStringValue
  prescriptionTreatmentType: XmlStringValue
  maxRepeats: XmlStringValue
}

export interface XmlSearchResults {
  prescription: XmlPrescription | Array<XmlPrescription>
}

export interface XmlSoapBody {
  prescriptionSearchResponse: {
    PRESCRIPTIONSEARCHRESPONSE_SM01: {
      ControlActEvent: {
        subject: {
          searchResults: XmlSearchResults
        }
      }
    }
  }
}

interface XmlSoapEnvelope {
  "SOAP:Body": XmlSoapBody
}

export interface XmlError {
  "@_codeSystem": string
  "@_code": string
  "@_displayName": string
}

export interface XmlSoapEnvBody {
  prescriptionSearchResponse: {
    MCCI_IN010000UK13: {
      acknowledgement: {
        acknowledgementDetail: {
          code: XmlError
        }
      }
    }
  }
}
interface XmlSoapEnvEnvelope {
  "SOAP-ENV:Body": XmlSoapEnvBody
}

export interface XmlResponse {
  "SOAP:Envelope"?: XmlSoapEnvelope
  "SOAP-ENV:Envelope"?: XmlSoapEnvEnvelope
}

export interface PatientDetails {
  nhsNumber: string
  prefix: string
  suffix: string
  given: string
  family: string
}

export interface PrescriptionDetails {
  prescriptionId: string
  issueDate: string
  treatmentType: string
  maxRepeats: number | undefined
}

export interface IssueDetails {
  issueNumber: number
  status: string
  prescriptionPendingCancellation: boolean
  itemsPendingCancellation: boolean

}

export type Prescription = PatientDetails & PrescriptionDetails & IssueDetails

export interface SearchError {
  status: string
  severity: "error" | "fatal"
  description: string
}

export interface ParsedSpineResponse {
  prescriptions?: Array<Prescription> | undefined
  searchError?: SearchError | undefined
}

export const parseSpineResponse = (spineResponse: string, logger: Logger): ParsedSpineResponse => {
  const xmlParser = new XMLParser({ignoreAttributes: false})
  const xmlResponse = xmlParser.parse(spineResponse) as XmlResponse

  logger.info("Parsing XML SOAP body...")
  const xmlSoapBody: XmlSoapBody | undefined = xmlResponse["SOAP:Envelope"]?.["SOAP:Body"]
  if (!xmlSoapBody) {
    const error: string = parseErrorResponse(xmlResponse)
    if (error === "Prescription not found"){
      logger.info("No prescriptions found.")
      return {prescriptions: []}
    }
    return {searchError: {status: "500", severity: "error", description: error}}
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
  return {prescriptions: parsedPrescriptions}
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
