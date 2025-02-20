import {randomUUID, UUID} from "crypto"

// Types
import {
  Bundle,
  BundleEntry,
  Extension,
  RequestGroup,
  Patient,
  OperationOutcome,
  OperationOutcomeIssue
} from "fhir/r4"
import {
  ErrorMap,
  IntentMap,
  Prescription,
  SearchError,
  StatusDisplayMap,
  TreatmentType
} from "./types"

// TODO: logging
// TODO: Finalize FHIR

const intentMap: IntentMap = {
  [TreatmentType.ACUTE]: "order",
  [TreatmentType.REPEAT]: "instance-order",
  [TreatmentType.ERD] : "reflex-order"
}

const statusDisplayMap: StatusDisplayMap = {
  "0001": "To be Dispensed",
  "0002": "With Dispenser",
  "0003": "With Dispenser - Active",
  "0004": "Expired",
  "0005": "Cancelled",
  "0006": "Dispensed",
  "0007": "Not Dispensed"
}

export const generateFhirResponse = (prescriptions: Array<Prescription>): Bundle => {
  // Create the Bundle wrapper
  const responseBundle: Bundle = {
    resourceType: "Bundle",
    type: "searchset",
    total: prescriptions.length,
    entry: []
  }

  // Generate UUID for Patient bundle entry for each RequestGroup to reference in subject
  const patientUuid: UUID = randomUUID()

  // For each prescription/issue generate a RequestGroup entry
  for (const prescription of prescriptions){

    // Generate Patient bundle entry when processing first prescription/issue
    if (responseBundle.entry?.length === 0){
      const patient: BundleEntry<Patient> = {
        fullUrl: `urn:uuid:${patientUuid}`,
        search: {
          mode: "include"
        },
        resource: {
          resourceType: "Patient",
          identifier: [{
            system: "https://fhir.nhs.uk/Id/nhs-number",
            value: prescription.nhsNumber
          }],
          name: [{
            prefix: [prescription.prefix],
            suffix: [prescription.suffix],
            given: [prescription.given],
            family: prescription.family
          }]
        }
      }
      responseBundle.entry?.push(patient)
    }

    // Generate RequestGroup bundle entry for the prescription/issue
    const requestGroup:BundleEntry<RequestGroup> = {
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

    // Generate Prescription Status Extension
    const prescriptionStatus: Extension = {
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

    // Generate Medication Repeat Information for non acute issue details
    if (prescription.treatmentType !== TreatmentType.ACUTE){
      const medicationRepeatInformation: Extension = {
        url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-RepeatInformation",
        extension: [
          {
            url: "numberOfRepeatsAllowed",
            valueInteger: prescription.maxRepeats
          },
          {
            url: "numberOfRepeatsIssued",
            valueInteger: prescription.issueNumber
          }
        ]
      }
      requestGroup.resource?.extension?.push(medicationRepeatInformation)
    }

    // Generate Pending Cancellation extensions
    const pendingCancellation: Extension = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PendingCancellation",
      extension: [
        {
          url: "pendingCancellation",
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

export const generateFhirErrorResponse = (errors: Array<SearchError>): OperationOutcome => {
  const operationOutcome: OperationOutcome = {
    resourceType: "OperationOutcome",
    meta: {
      lastUpdated: new Date().toISOString()
    },
    issue: []
  }

  for(const error of errors){
    const issue: OperationOutcomeIssue = {
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
    }

    operationOutcome.issue.push(issue)
  }

  return operationOutcome
}
