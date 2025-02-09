import {RequestGroup} from "fhir/r4"

// Define the type for fhirResponseParams based on your data
export interface FhirResponseParams {
  acknowledgementTypeCode: string
  prescriptionId: string
  prescriptionType: string
  prescriptionStatus: string
  prescriptionTreatmentType: string
}

export function mapRequestGroup(extractedData: FhirResponseParams): RequestGroup {
  return {
    resourceType: "RequestGroup",
    intent: "proposal", // Required field (Example value: 'proposal' | 'plan' | 'order')
    status: "active", // Required field (Example value: 'active' | 'draft' | 'completed')
    groupIdentifier: {
      system: "https://fhir.nhs.uk/Id/prescription-group",
      value: extractedData.prescriptionTreatmentType
    },
    identifier: [
      {
        system: "https://fhir.nhs.uk/Id/prescription-order-number",
        value: extractedData.prescriptionId
      }
    ],
    code: {
      coding: [
        {
          system: "https://fhir.nhs.uk/CodeSystem/prescription-type",
          code: extractedData.prescriptionType,
          display: "Prescription Type"
        }
      ]
    }
  }
}
