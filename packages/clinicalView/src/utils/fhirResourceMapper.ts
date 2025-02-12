import {RequestGroup, MedicationRequest, Task} from "fhir/r4"
import {FhirResponseParams} from "./prescriptionDataParser"

/**
 * Maps the extracted data to the FHIR RequestGroup resource
 */
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

/**
 * Maps the extracted data to an array of MedicationRequest resources
 */
export function mapMedicationRequest(extractedData: FhirResponseParams): Array<MedicationRequest> {
  return extractedData.productLineItems.map(item => ({
    resourceType: "MedicationRequest",
    id: extractedData.prescriptionID, // Assuming the prescriptionID is the same for all medication requests
    intent: "order", // Required field (Example value: 'proposal' | 'plan' | 'order')
    subject: {
      reference: "Patient12345" // This can be dynamic if available in the data
    },
    status: extractedData.statusCode === "0002" ? "active" : "completed",
    medicationCodeableConcept: {
      coding: [{
        system: "https://fhir.nhs.uk/CodeSystem/medication",
        code: item.medicationName || "Unknown",
        display: item.medicationName || "Unknown medication"
      }]
    },
    dispenseRequest: {
      quantity: {
        value: parseInt(item.quantity, 10) // Parse quantity to integer and use it in dispenseRequest
      }
    },
    dosageInstruction: [
      {
        text: item.dosageInstructions || "Unknown dosage"
      }
    ]
  }))
}

/**
 * Maps the extracted data to the Task resource
 */
export function mapTask(extractedData: FhirResponseParams): Task {
  return {
    resourceType: "Task",
    id: extractedData.prescriptionID, // Map the prescriptionID as Task ID
    status: "completed", // Assume task is completed (can be updated based on your status logic)
    intent: "order", // Assuming order, adjust as necessary
    groupIdentifier: {
      system: "https://fhir.nhs.uk/Id/task-group",
      value: extractedData.message
    },
    authoredOn: extractedData.sentDateTime || "",
    owner: {
      identifier: {
        system: "https://fhir.nhs.uk/Id/pharmacy",
        value: extractedData.organizationName
      }
    },
    businessStatus: {
      coding: [
        {
          system: "https://fhir.nhs.uk/CodeSystem/task-status",
          code: extractedData.newStatusCode,
          display: "Task Status"
        }
      ]
    },
    output: [
      {
        type: {
          coding: [
            {
              system: "https://fhir.nhs.uk/CodeSystem/task-output",
              code: "medication-dispense",
              display: "Medication Dispense Reference"
            }
          ]
        },
        valueReference: {
          reference: `MedicationDispense/${extractedData.prescriptionID}` // Map to MedicationDispense resource
        }
      }
    ]
  }
}
