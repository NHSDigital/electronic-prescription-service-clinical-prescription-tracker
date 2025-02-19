import {randomUUID, UUID} from "crypto"

// Types
import {
  Bundle,
  BundleEntry,
  Extension,
  RequestGroup,
  Patient,
  RequestGroupAction,
  OperationOutcome
} from "fhir/r4"
import {
  ErrorMap,
  Prescription,
  SearchError,
  TreatmentType
} from "./types"

// TODO: logging
// TODO: Finalize FHIR

export const generateFhirResponse = (prescriptions: Array<Prescription>): Bundle => {
  // Create the Bundle wrapper
  const responseBundle: Bundle = {
    resourceType: "Bundle",
    type: "searchset",
    total: prescriptions.length, // TODO: if Patient bundle is ok, should this count include the Patient bundle?
    entry: []
  }

  // Generate UUID for Patient bundle entry for each RequestGroup to reference in subject
  const patientUuid: UUID = randomUUID()

  // For each prescription/issue generate a RequestGroup entry
  for (const prescription of prescriptions){

    // TODO: Can we have this referenced Patient Bundle?
    // Generate Patient bundle entry when processing first prescription/issue
    if (responseBundle.entry?.length === 0){
      const patient: BundleEntry<Patient> = {
        fullUrl: `urn:uuid:${patientUuid}`,
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
      resource: {
        resourceType: "RequestGroup",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-number",
          value: prescription.prescriptionId
        }],
        subject: {
          reference: `urn:uuid:${patientUuid}`
        },
        status: "active", //TODO: Is this status correct? should it maybe be complete?
        intent: "proposal", // TODO: How does treatmentType map to the allowed values for intent?
        extension: [],
        action: []
      }
    }

    // Generate Prescription Status Extension
    const prescriptionStatus: Extension = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory", // is this the right one?
      extension: [{
        url: "status",
        valueCoding : {
          //TODO: Should this have a system? if so which one?
          code: prescription.status
        }
      }]
    }
    requestGroup.resource?.extension?.push(prescriptionStatus)

    // TODO: Is this the correct extension? Where does max repeats go as proposed property appears to be retired?
    // TODO: Is this really only for erds? should a repeat also contain this extension?
    // Generate Medication Repeat Information for ERD issue details
    if (prescription.treatmentType === TreatmentType.ERD){
      const medicationRepeatInformation: Extension = {
        url: "https://fhir.hl7.org.uk/StructureDefinition/Extension-UKCore-MedicationRepeatInformation",
        extension: [{
          url: "numberOfPrescriptionsIssued",
          valueUnsignedInt: prescription.issueNumber
        }]
      }
      requestGroup.resource?.extension?.push(medicationRepeatInformation)
    }

    // Generate Action
    const action: RequestGroupAction = {
      timingDateTime: prescription.issueDate,
      cardinalityBehavior: prescription.treatmentType === TreatmentType.ACUTE ? "single" : "multiple",
      // TODO: what about acute? do we just not include the property? or does it use no like erd?
      precheckBehavior: prescription.treatmentType === TreatmentType.REPEAT ? "yes" : "no",
      extension: []
    }

    // TODO Is the format correct? Is it correct to have 2 instances of the extension attached to different elements?
    // Generate Pending Cancellation extensions
    const pendingCancellation: Extension = {
      url: "", // TODO: what is the reference url for this proposed extension?
      extension: [{
        url: "pendingCancellation", // TODO: Is this correct? would it be generic like this?
        valueBoolean: prescription.prescriptionPendingCancellation
      }]
    }
    requestGroup.resource?.extension?.push(pendingCancellation)

    const itemsPendingCancellation: Extension = {
      url: "", // TODO: what is the reference url for this proposed extension?
      extension: [{
        url: "pendingCancellation", // TODO: Is this correct? would it be generic like this?
        valueBoolean: prescription.itemsPendingCancellation
      }]
    }
    action.extension?.push(itemsPendingCancellation)

    requestGroup.resource?.action?.push(action)
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

export const generateFhirErrorResponse = (errors: Array<SearchError>): Bundle => {
  const responseBundle: Bundle ={
    resourceType: "Bundle",
    // TODO: what type? transaction-response doesnt feel right, searchset like the ok bundle? collection?
    type: "searchset",
    entry: []
  }

  for(const error of errors){
    const operationOutcome: BundleEntry<OperationOutcome> = {
      response: {
        status: errorMap[error.status].status,
        outcome: {
          resourceType: "OperationOutcome",
          meta: {
            lastUpdated: new Date().toISOString()
          },
          issue: [{
            code: errorMap[error.status].code,
            severity: error.severity,
            diagnostics: error.description,
            details: {
              coding: [{
              //TODO: do we also need to use/include SpineErrorOrWarningCode codes?
                system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
                code: errorMap[error.status].detailsCode,
                display: errorMap[error.status].detailsDisplay
              }]
            }
          }]
        }
      }
    }

    responseBundle.entry?.push(operationOutcome)
  }

  return responseBundle
}
