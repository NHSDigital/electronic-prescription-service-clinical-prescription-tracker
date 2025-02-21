import {
  Bundle,
  FhirResource,
  Patient,
  RequestGroup,
  MedicationRequest,
  Task
} from "fhir/r4"
import {
  mapPatient,
  mapRequestGroup,
  mapMedicationRequest,
  mapTask
} from "./fhirResourceMapper"
import {FhirResponseParams} from "./prescriptionDataParser"

/**
 * Builds a FHIR Bundle from the extracted prescription data
 */
export function buildFhirResponse(extractedData: FhirResponseParams): Bundle<FhirResource> {
  // Map the extracted data to the Patient resource
  const patient = mapPatient(extractedData) as Patient

  // Map the extracted data to the RequestGroup resource
  const requestGroup = mapRequestGroup(extractedData) as RequestGroup

  // Map each product line item to a separate MedicationRequest resource
  const medicationRequests = mapMedicationRequest(extractedData) as Array<MedicationRequest>

  // Map the extracted data to the Task resource
  const task = mapTask(extractedData) as Task

  // Return the FHIR Bundle
  return {
    resourceType: "Bundle",
    type: "collection", // A collection of resources
    entry: [
      {resource: patient}, // Add the Patient resource
      {resource: requestGroup}, // Add the RequestGroup resource
      ...medicationRequests.map(medRequest => ({resource: medRequest})), // Add all MedicationRequest resources
      {resource: task} // Add the Task resource
    ]
  }
}
