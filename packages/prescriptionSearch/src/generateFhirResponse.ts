import {randomUUID} from "crypto"
import {Logger} from "@aws-lambda-powertools/logger"
import {
  Bundle,
  BundleEntry,
  Extension,
  RequestGroup,
  Patient,
  OperationOutcome
} from "fhir/r4"
import {Prescription, SearchError} from "./parseSpineResponse"
import {
  BundleType,
  MedicationRepeatInformationExtensionType,
  OperationOutcomeType,
  PatientBundleEntryType,
  PendingCancellationExtensionType,
  PrescriptionStatusExtensionType,
  RequestGroupBundleEntryType
} from "./schema/response"

export interface IntentMap {
  [key: string]: RequestGroupBundleEntryType["resource"]["intent"]
}

/* TODO: use common version */
export enum TreatmentType {
  ACUTE = "0001",
  REPEAT = "0002",
  ERD = "0003"
}

/* TODO: use common version */
const intentMap: IntentMap = {
  [TreatmentType.ACUTE]: "order",
  [TreatmentType.REPEAT]: "instance-order",
  [TreatmentType.ERD] : "reflex-order"
}
/* TODO: use common version */
type PrescriptionStatusCoding = PrescriptionStatusExtensionType["extension"][0]["valueCoding"]

/* TODO: use common version */
const statusDisplayMap: Record<PrescriptionStatusCoding["code"], PrescriptionStatusCoding["display"]> = {
  "0001": "To be Dispensed",
  "0002": "With Dispenser",
  "0003": "With Dispenser - Active",
  "0004": "Expired",
  "0005": "Cancelled",
  "0006": "Dispensed",
  "0007": "Not Dispensed",
  "0008": "Claimed",
  "0009": "No-Claimed",
  "9000": "Repeat Dispense future instance",
  "9001": "Prescription future instance",
  "9005": "Cancelled future instance"
}

export const generateFhirResponse = (prescriptions: Array<Prescription>, logger: Logger): Bundle => {
  // Generate the Bundle wrapper
  logger.info("Generating the Bundle wrapper...")
  const responseBundle: Bundle & BundleType = {
    resourceType: "Bundle",
    type: "searchset",
    total: prescriptions.length,
    entry: []
  }

  // Generate UUID for the Patient bundle entry for each RequestGroup to reference in subject
  const patientUuid = randomUUID()
  if (prescriptions.length > 0){
    // Generate the Patient bundle entry if there are prescriptions to process
    logger.info("Generating the Patient bundle entry...")
    if (responseBundle.entry?.length === 0){
      const patient: BundleEntry<Patient> & PatientBundleEntryType = {
        fullUrl: `urn:uuid:${patientUuid}`,
        search: {
          mode: "include"
        },
        resource: {
          resourceType: "Patient",
          identifier: [{
            system: "https://fhir.nhs.uk/Id/nhs-number",
            value: prescriptions[0].nhsNumber
          }],
          name: [{
            prefix: [prescriptions[0].prefix],
            suffix: [prescriptions[0].suffix],
            given: [prescriptions[0].given],
            family: prescriptions[0].family
          }]
        }
      }
      responseBundle.entry?.push(patient)
    }
  }

  // For each prescription/issue generate a RequestGroup bundle entry
  for (const prescription of prescriptions){
    // Generate the RequestGroup bundle entry for the prescription/issue
    logger.info("Generating the RequestGroup bundle entry...", {prescriptionId: prescription.prescriptionId})
    const requestGroup:BundleEntry<RequestGroup> & RequestGroupBundleEntryType = {
      fullUrl: `urn:uuid:${randomUUID()}`,
      search: {
        mode: "match"
      },
      resource: {
        resourceType: "RequestGroup",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-number",
          value: prescription.prescriptionId
        }],
        subject: {
          reference: `urn:uuid:${patientUuid}`
        },
        status: "active",
        intent: intentMap[prescription.treatmentType],
        authoredOn: prescription.issueDate,
        extension: []
      }
    }

    // Generate the PrescriptionStatus extension
    logger.info("Generating the PrescriptionStatus extension...",
      {prescriptionId: prescription.prescriptionId})
    const prescriptionStatus: Extension & PrescriptionStatusExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory",
      extension: [{
        url: "status",
        valueCoding : {
          system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
          code: prescription.status,
          display: statusDisplayMap[prescription.status]
        }
      }]
    }
    requestGroup.resource?.extension?.push(prescriptionStatus)

    // Generate the RepeatInformation extension for non acute prescriptions/issues
    if (prescription.treatmentType !== TreatmentType.ACUTE){
      logger.info("Generating the RepeatInformation extension for non acute prescription...",
        {prescriptionId: prescription.prescriptionId})
      const medicationRepeatInformation: Extension & MedicationRepeatInformationExtensionType = {
        url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-RepeatInformation",
        extension: [
          {
            url: "numberOfRepeatsIssued",
            valueInteger: prescription.issueNumber
          }
        ]
      }
      if (prescription.maxRepeats){
        medicationRepeatInformation.extension?.push({
          url: "numberOfRepeatsAllowed",
          valueInteger: prescription.maxRepeats
        })
      }
      requestGroup.resource?.extension?.push(medicationRepeatInformation)
    }

    // Generate the PendingCancellation extension
    logger.info("Generating the PendingCancellation extension...", {prescriptionId: prescription.prescriptionId})
    const pendingCancellation: Extension & PendingCancellationExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PendingCancellation",
      extension: [
        {
          url: "prescriptionPendingCancellation",
          valueBoolean: prescription.prescriptionPendingCancellation
        },
        {
          url: "lineItemPendingCancellation",
          valueBoolean: prescription.itemsPendingCancellation
        }]
    }
    requestGroup.resource?.extension?.push(pendingCancellation)
    responseBundle.entry?.push(requestGroup)
  }

  return responseBundle
}

export interface FhirErrorDetails {
  status: string
  code: OperationOutcomeType["issue"][0]["code"]
  detailsCode: OperationOutcomeType["issue"][0]["details"]["coding"][0]["code"]
  detailsDisplay: OperationOutcomeType["issue"][0]["details"]["coding"][0]["display"]
}

export interface ErrorMap {
  [key: string]: FhirErrorDetails
}

const errorMap: ErrorMap = {
  400: {
    status: "400 Bad Request",
    code: "value",
    detailsCode: "BAD_REQUEST",
    detailsDisplay: "400: The Server was unable to process the request."
  },
  404: {
    status: "404 Not Found",
    code: "not-found",
    detailsCode: "NOT_FOUND",
    detailsDisplay: "404: The Server was unable to find the specified resource."
  },
  500: {
    status: "500 Internal Server Error",
    code: "exception",
    detailsCode: "SERVER_ERROR",
    detailsDisplay: "500: The Server has encountered an error processing the request."
  },
  504: {
    status: "504 Gateway Timeout",
    code: "timeout",
    detailsCode: "TIMEOUT",
    detailsDisplay: "504: The server has timed out whilst processing the request."
  }
}

/* Use the common version */
export const generateFhirErrorResponse = (errors: Array<SearchError>, logger: Logger): OperationOutcome => {
  logger.info("Generating the OperationOutcome wrapper...")
  // Generate the OperationOutcome wrapper
  const operationOutcome: OperationOutcome & OperationOutcomeType = {
    resourceType: "OperationOutcome",
    meta: {
      lastUpdated: new Date().toISOString()
    },
    issue: errors.map((error) => ({
      code: errorMap[error.status].code,
      severity: error.severity,
      diagnostics: error.description,
      details: {
        coding: [{
          system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
          code: errorMap[error.status].detailsCode,
          display: errorMap[error.status].detailsDisplay
        }]
      }
    }))
  }

  return operationOutcome
}
