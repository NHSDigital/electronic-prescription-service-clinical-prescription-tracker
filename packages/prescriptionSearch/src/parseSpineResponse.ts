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
import {validatePrescriptionId} from "@cpt-common/common-utils"
import * as DateFns from "date-fns"
import {XMLParser} from "fast-xml-parser"
import {logger} from "./handler"

interface ResponseIssueDetail {
  instanceNumber: string
  prescriptionStatus: PrescriptionStatusCoding["code"]
  prescCancPending: string
  liCancPending: string
}
interface ResponsePrescription {
  prescriptionID: string
  patientID: string
  prefix?: string
  suffix?: string
  given?: string
  family?: string
  issueDetail: Array<ResponseIssueDetail>
  prescribedDate: string
  prescriptionTreatmentType: SpineTreatmentTypeCode
  maxRepeats?: string
  nextActivity: string
}
export interface SpineJsonResponse {
  Response:{
    prescriptions: Array<ResponsePrescription>
  }
}

interface PrescriptionSearchIssueDetails extends IssueDetails {
  itemsPendingCancellation: boolean
}

interface PatientSearchPrescriptionDetails extends PrescriptionDetailsSummary {
  deleted: boolean
}

export type Prescription = PatientDetailsSummary & PatientSearchPrescriptionDetails & PrescriptionSearchIssueDetails

export type ParsedSpineResponse = {prescriptions: Array<Prescription> } | { spineError: ServiceError }

export const parseSpineResponse = (
  spineResponse: SpineJsonResponse | string, logger: Logger): ParsedSpineResponse => {
  if (typeof spineResponse === "string"){
    logger.info("Spine response did not contain valid JSON, attempting to parse response as XML...")

    const error: string = parseErrorResponse(spineResponse, logger)
    if (error === "Prescription not found"){
      logger.info("No prescriptions found.")
      return {prescriptions: []}
    }

    return {spineError: {status: 500, severity: "error", description: error}}
  }

  const response = spineResponse.Response
  if (!response){
    logger.error("Failed to parse response, Spine response did not contain valid JSON.")
    return {spineError: {status: 500, severity: "error", description: "Unknown Error."}}
  }

  logger.info("Parsing prescriptions...")
  let parsedPrescriptions: Array<Prescription> = parsePrescriptions(response.prescriptions)
  return {prescriptions: parsedPrescriptions}
}

const parsePrescriptions = (responsePrescriptions: Array<ResponsePrescription>): Array<Prescription> => {
  let parsedPrescriptions: Array<Prescription> = []
  for (const responsePrescription of responsePrescriptions){
    const prescriptionId = responsePrescription.prescriptionID
    const validationErrors = validatePrescriptionId(prescriptionId, logger)
    if (validationErrors.length) {
      logger.warn(
        "Returned prescription ID is invalid, possible R1 prescription, removing from results", {prescriptionId})
      continue
    }

    const patientDetails: PatientDetailsSummary = {
      nhsNumber: responsePrescription.patientID,
      ...(responsePrescription.prefix ? {prefix: responsePrescription.prefix} : {}),
      ...(responsePrescription.suffix ? {suffix: responsePrescription.suffix} : {}),
      ...(responsePrescription.given ? {given: responsePrescription.given} : {}),
      ...(responsePrescription.family ? {family: responsePrescription.family} : {})
    }

    const prescriptionDetails: PatientSearchPrescriptionDetails = {
      prescriptionId,
      deleted: responsePrescription.nextActivity === "purge",
      issueDate: DateFns.parse(responsePrescription.prescribedDate, SPINE_TIMESTAMP_FORMAT, new Date()).toISOString(),
      treatmentType: responsePrescription.prescriptionTreatmentType,
      ...(responsePrescription.maxRepeats && responsePrescription.maxRepeats !== "None" ?
        {maxRepeats: Number(responsePrescription.maxRepeats)} : {})
      // maxRepeats: responsePrescription.maxRepeats === "None" ? undefined : Number(responsePrescription.maxRepeats)
    }

    for (const responseIssue of responsePrescription.issueDetail){
      const issueDetails: PrescriptionSearchIssueDetails = {
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

export interface SpineXmlPrescriptionSearchResponse {
  prescriptionSearchResponse: SpineXmlError
}

const parseErrorResponse = (spineResponse: string, logger: Logger): string => {
  const xmlParser = new XMLParser({ignoreAttributes: false})
  const xmlResponse = xmlParser.parse(spineResponse) as SpineXmlResponse<SpineXmlPrescriptionSearchResponse>

  const xmlSoapBody = xmlResponse["SOAP:Envelope"]?.["SOAP:Body"] || xmlResponse["SOAP-ENV:Envelope"]?.["SOAP-ENV:Body"]
  if (!xmlSoapBody){
    logger.error("Failed to parse response, Spine response did not contain valid XML.")
    return "Unknown Error."
  }

  const xmlError = xmlSoapBody.prescriptionSearchResponse
    .MCCI_IN010000UK13.acknowledgement.acknowledgementDetail.code

  return xmlError["@_displayName"]
}
