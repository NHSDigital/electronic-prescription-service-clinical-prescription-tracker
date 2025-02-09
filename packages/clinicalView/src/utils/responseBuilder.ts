import {Bundle, FhirResource, RequestGroup} from "fhir/r4"
import {mapRequestGroup} from "./fhirMapper"
import {FhirResponseParams} from "./fhirMapper"

export function buildFhirResponse(extractedData: FhirResponseParams): Bundle<FhirResource> {
  return {
    resourceType: "Bundle",
    type: "collection",
    entry: [
      {resource: mapRequestGroup(extractedData) as RequestGroup}
      // TODO: Add more resources to the entry array as needed
      // { resource: mapMedicationRequest(extractedData) as MedicationRequest }
    ]
  }
}
