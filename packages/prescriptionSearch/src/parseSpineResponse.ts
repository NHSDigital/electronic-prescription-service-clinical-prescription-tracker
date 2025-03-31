import {XMLParser} from "fast-xml-parser"
import {Logger} from "@aws-lambda-powertools/logger"
import {logger} from "./handler"

interface SpineXmlErrorResponse {
  "SOAP:Envelope": {
    "SOAP:Body": {
      prescriptionSearchResponse: {
        MCCI_IN010000UK13: {
          acknowledgement: {
            acknowledgementDetail: {
              code: {
                "@_codeSystem": string
                "@_code": string
                "@_displayName": string
              }
            }
          }
        }
      }
    }
  }
}
interface ResponseIssueDetail {
  instanceNumber: string
  prescriptionStatus: string
  prescCancPending: string
  liCancPending: string
}
interface ResponsePrescription {
  prescriptionID: string
  patientID: string
  prefix: string
  suffix: string
  given: string
  family: string
  issueDetail: Array<ResponseIssueDetail>
  prescribedDate: string
  prescriptionTreatmentType: string
  maxRepeats: string
}
interface SpineJsonResponse {
  prescriptions: Array<ResponsePrescription>
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
  let jsonResponse: SpineJsonResponse
  try{
    jsonResponse = JSON.parse(spineResponse).Response
  } catch(error){
    if (error instanceof SyntaxError){
      logger.info("Spine response did not contain valid JSON, attempting to parse response as XML...")
      const error: string = parseErrorResponse(spineResponse)
      if (error === "Prescription not found"){
        logger.info("No prescriptions found.")
        return {prescriptions: []}
      }

      return {searchError: {status: "500", severity: "error", description: error}}
    }

    logger.error("Unexpected error occurred whilst parsing response", {error: error})
    return {searchError: {status: "500", severity: "error", description: "Unknown Error."}}
  }

  logger.info("Parsing prescriptions...")
  let parsedPrescriptions: Array<Prescription> = parsePrescriptions(jsonResponse.prescriptions)
  return {prescriptions: parsedPrescriptions}
}

const parsePrescriptions = (responsePrescriptions: Array<ResponsePrescription>): Array<Prescription> => {
  let parsedPrescriptions: Array<Prescription> = []
  for (const responsePrescription of responsePrescriptions){
    const patientDetails: PatientDetails = {
      nhsNumber: responsePrescription.patientID,
      prefix: responsePrescription.prefix,
      suffix: responsePrescription.suffix,
      given: responsePrescription.given,
      family: responsePrescription.family
    }

    const prescriptionDetails: PrescriptionDetails = {
      prescriptionId: responsePrescription.prescriptionID,
      issueDate: responsePrescription.prescribedDate,
      treatmentType: responsePrescription.prescriptionTreatmentType,
      maxRepeats: responsePrescription.maxRepeats === "None" ? undefined : Number(responsePrescription.maxRepeats)
    }

    for (const responseIssue of responsePrescription.issueDetail){
      const issueDetails: IssueDetails = {
        issueNumber: Number(responseIssue.instanceNumber),
        status: responseIssue.prescriptionStatus,
        prescriptionPendingCancellation: convertStringBool(responseIssue.prescCancPending),
        itemsPendingCancellation: convertStringBool(responseIssue.liCancPending)
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

const convertStringBool = (value: string): boolean => {
  return value === "True" ? true : false
}

const parseErrorResponse = (spineResponse: string): string => {
  const xmlParser = new XMLParser({ignoreAttributes: false})
  const xmlResponse = xmlParser.parse(spineResponse) as SpineXmlErrorResponse

  const xmlSoapEnvBody = xmlResponse["SOAP:Envelope"]["SOAP:Body"]
  if (!xmlSoapEnvBody){
    logger.error("Response did not contain valid XML.")
    return "Unknown Error."
  }

  const xmlError = xmlSoapEnvBody.prescriptionSearchResponse
    .MCCI_IN010000UK13.acknowledgement.acknowledgementDetail.code

  return xmlError["@_displayName"]
}
