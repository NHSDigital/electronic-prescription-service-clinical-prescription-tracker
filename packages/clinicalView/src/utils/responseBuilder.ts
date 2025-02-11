import {
  Bundle,
  FhirResource,
  RequestGroup,
  MedicationRequest
} from "fhir/r4"
import {mapRequestGroup, mapMedicationRequest} from "./fhirMapper"
import {FhirResponseParams} from "./prescriptionExtractor"

// Builds a FHIR Bundle from the extracted prescription data
export function buildFhirResponse(extractedData: FhirResponseParams): Bundle<FhirResource> {
  // Map the extracted data to the RequestGroup
  const requestGroup = mapRequestGroup(extractedData) as RequestGroup

  // Map each product line item to a separate MedicationRequest
  const medicationRequests = mapMedicationRequest(extractedData) as Array<MedicationRequest>

  // Return the FHIR Bundle
  return {
    resourceType: "Bundle",
    type: "collection", // A collection of resources
    entry: [
      {resource: requestGroup}, // Add the RequestGroup resource
      ...medicationRequests.map(medRequest => ({resource: medRequest})) // Add all MedicationRequest resources
    ]
  }
}
