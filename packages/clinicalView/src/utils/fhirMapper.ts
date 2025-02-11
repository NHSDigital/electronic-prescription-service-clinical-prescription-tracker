import {RequestGroup, MedicationRequest} from "fhir/r4"

// Define the type for fhirResponseParams based on your data
export interface FhirResponseParams {
  acknowledgementTypeCode: string
  prescriptionId: string
  prescriptionType: string
  prescriptionStatus: string
  prescriptionTreatmentType: string
  productLineItems: Array<{
    product: string
    quantity: string
    dosage: string
  }>
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

export function mapMedicationRequest(extractedData: FhirResponseParams): MedicationRequest {
  return {
    resourceType: "MedicationRequest",
    id: extractedData.prescriptionId,
    intent: "order", // Required field (Example value: 'proposal' | 'plan' | 'order')
    subject: {
      reference: "Patient12345"
    },
    status: extractedData.prescriptionStatus === "0002" ? "active" : "completed",
    medicationCodeableConcept: {
      coding: extractedData.productLineItems.length > 0
        ? extractedData.productLineItems.map(item => ({
          system: "https://fhir.nhs.uk/CodeSystem/medication",
          code: item.product || "Unknown",
          display: item.product || "Unknown medication"
        }))
        : [{
          system: "https://fhir.nhs.uk/CodeSystem/medication",
          code: "Unknown",
          display: "Unknown medication"
        }] // Ensure it's always defined
    },
    dispenseRequest: extractedData.productLineItems.length > 0 ? {
      quantity: {
        value: extractedData.productLineItems.reduce(
          (total, item) => total + parseInt(item.quantity ?? "0", 10),
          0
        )
      }
    } : undefined,
    dosageInstruction: extractedData.productLineItems.length > 0
      ? extractedData.productLineItems.map(item => ({
        text: item.dosage || "Unknown dosage"
      }))
      : [{text: "Unknown dosage"}] // Ensure it's always defined
  }
}
