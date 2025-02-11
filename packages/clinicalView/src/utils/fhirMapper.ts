import {RequestGroup, MedicationRequest} from "fhir/r4"
import {FhirResponseParams} from "./prescriptionExtractor"

export function mapRequestGroup(extractedData: FhirResponseParams): RequestGroup {
  return {
    resourceType: "RequestGroup",
    intent: "proposal", // Required field (Example value: 'proposal' | 'plan' | 'order')
    status: "active", // Required field (Example value: 'active' | 'draft' | 'completed')
    groupIdentifier: {
      system: "https://fhir.nhs.uk/Id/prescription-group",
      value: extractedData.prescriptionID
    },
    identifier: [
      {
        system: "https://fhir.nhs.uk/Id/prescription-order-number",
        value: extractedData.instanceNumber
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
    id: extractedData.prescriptionID,
    intent: "order", // Required field (Example value: 'proposal' | 'plan' | 'order')
    subject: {
      reference: "Patient12345"
    },
    status: extractedData.statusCode === "0002" ? "active" : "completed",
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
