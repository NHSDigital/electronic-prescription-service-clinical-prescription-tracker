import {
  Bundle,
  BundleEntry,
  Extension,
  RequestGroup,
  Patient,
  RequestGroupAction
} from "fhir/r4"
import {randomUUID} from "crypto"

import {PrescriptionSearchResults} from "./types"

// nhsNumber: string X
// prefix: string X
// suffix: string X
// given: string X
// family: string X
// prescriptionId: string X
// issueDate: string X
// treatmentType: string ?? what is the mapping
// maxRepeats: number | null ? proposed field does
// issueNumber: number ? is numberOfPrescriptionsIssued correct?
// status: string
// prescriptionPendingCancellation: boolean
// itemsPendingCancellation: boolean

export const generateFhirResponse = (prescriptionSearchResults: PrescriptionSearchResults) => {
  // Create the wrapping Bundle
  const responseBundle: Bundle = {
    resourceType: "Bundle",
    type: "searchset",
    total: prescriptionSearchResults.length,
    entry: []
  }

  // Generate UUID for Patient entry, so all prescriptions can reference
  const patientUuid = randomUUID()

  // For each prescription/issue generate a RequestGroup entry
  for (const prescription of prescriptionSearchResults){

    // Generate Patient entry when processing first prescription/issue
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

    // Create RequestGroup
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
        status: "", // ??
        intent: prescription.treatmentType === "" ? "proposal" : "order", // todo: find out actual mapping
        extension: [],
        action: []
      }
    }

    // Generate Status Extension
    const prescriptionStatus: Extension = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory", // is this the right one?
      extension: [{
        url: "status",
        valueCoding: {
          system: ""
        }
      }]
    }
    requestGroup.resource?.extension?.push(prescriptionStatus)

    // todo: Is this the correct extension and format?
    if (prescription.prescriptionType === "erd"){
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
      cardinalityBehavior: prescription.prescriptionType === "acute" ? "single" : "multiple", // todo: repeats?
      precheckBehavior: prescription.prescriptionType === "repeat" ? "yes" : "no", // todo: repeats?
      extension: []
    }

    // Generate Pending Cancellation extensions
    // todo: Are these correct? Separate instances of the same extension, or a single instance for both?
    if (prescription.prescriptionPendingCancellation){
      const pendingCancelation: Extension = {
        url: "",
        extension: [{
          url: "prescriptionPendingCancellation",
          valueBoolean: prescription.prescriptionPendingCancellation
        }]
      }
      action.extension?.push(pendingCancelation)
    }

    if (prescription.itemsPendingCancellation){
      const itemsPendingCancellation: Extension = {
        url: "",
        extension: [{
          url: "itemsPendingCancellation",
          valueBoolean: prescription.itemsPendingCancellation
        }]
      }
      action.extension?.push(itemsPendingCancellation)
    }
    requestGroup.resource?.action?.push(action)

    responseBundle.entry?.push(requestGroup)
  }
  return responseBundle
}
