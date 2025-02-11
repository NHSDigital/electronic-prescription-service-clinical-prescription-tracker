import {
  Bundle,
  FhirResource,
  RequestGroup,
  MedicationRequest
} from "fhir/r4"
import {FhirResponseParams, mapRequestGroup, mapMedicationRequest} from "./fhirMapper"

export function buildFhirResponse(extractedData: FhirResponseParams): Bundle<FhirResource> {
  return {
    resourceType: "Bundle",
    type: "collection",
    entry: [
      {resource: mapRequestGroup(extractedData) as RequestGroup},
      {resource: mapMedicationRequest(extractedData) as MedicationRequest}
    ]
  }
}
