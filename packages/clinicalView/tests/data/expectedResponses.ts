export const expectedFhirResponse = {
  resourceType: "Bundle",
  type: "collection",
  entry: [
    {
      resource: {
        resourceType: "RequestGroup",
        intent: "proposal",
        status: "active",
        groupIdentifier: {
          system: "https://fhir.nhs.uk/Id/prescription-group",
          value: "9AD427-A83008-2E461K"
        },
        identifier: [
          {
            system: "https://fhir.nhs.uk/Id/prescription-order-number",
            value: "1"
          }
        ],
        code: {
          coding: [
            {
              system: "https://fhir.nhs.uk/CodeSystem/prescription-type",
              code: "0101",
              display: "Prescription Type"
            }
          ]
        }
      }
    },
    {
      resource: {
        resourceType: "MedicationRequest",
        id: "9AD427-A83008-2E461K",
        intent: "order",
        status: "completed",
        subject: {
          reference: "Patient12345"
        },
        medicationCodeableConcept: {
          coding: [
            {
              code: "Amoxicillin 250mg capsules",
              display: "Amoxicillin 250mg capsules",
              system: "https://fhir.nhs.uk/CodeSystem/medication"
            }
          ]
        },
        dispenseRequest: {
          quantity: {
            value: 20
          }
        },
        dosageInstruction: [
          {
            text: "2 times a day for 10 days"
          }
        ]
      }
    },
    {
      resource: {
        resourceType: "MedicationRequest",
        id: "9AD427-A83008-2E461K",
        intent: "order",
        status: "completed",
        subject: {
          reference: "Patient12345"
        },
        medicationCodeableConcept: {
          coding: [
            {
              code: "Co-codamol 30mg/500mg tablets",
              display: "Co-codamol 30mg/500mg tablets",
              system: "https://fhir.nhs.uk/CodeSystem/medication"
            }
          ]
        },
        dispenseRequest: {
          quantity: {
            value: 20
          }
        },
        dosageInstruction: [
          {
            text: "2 times a day for 10 days"
          }
        ]
      }
    },
    {
      resource: {
        resourceType: "MedicationRequest",
        id: "9AD427-A83008-2E461K",
        intent: "order",
        status: "completed",
        subject: {
          reference: "Patient12345"
        },
        medicationCodeableConcept: {
          coding: [
            {
              code: "Pseudoephedrine hydrochloride 60mg tablets",
              display: "Pseudoephedrine hydrochloride 60mg tablets",
              system: "https://fhir.nhs.uk/CodeSystem/medication"
            }
          ]
        },
        dispenseRequest: {
          quantity: {
            value: 30
          }
        },
        dosageInstruction: [
          {
            text: "3 times a day for 10 days"
          }
        ]
      }
    },
    {
      resource: {
        resourceType: "MedicationRequest",
        id: "9AD427-A83008-2E461K",
        intent: "order",
        status: "completed",
        subject: {
          reference: "Patient12345"
        },
        medicationCodeableConcept: {
          coding: [
            {
              code: "Azithromycin 250mg capsules",
              display: "Azithromycin 250mg capsules",
              system: "https://fhir.nhs.uk/CodeSystem/medication"
            }
          ]
        },
        dispenseRequest: {
          quantity: {
            value: 30
          }
        },
        dosageInstruction: [
          {
            text: "3 times a day for 10 days"
          }
        ]
      }
    },
    {
      resource: {
        resourceType: "Task",
        id: "9AD427-A83008-2E461K",
        status: "completed",
        intent: "order",
        authoredOn: "20240213105241",
        groupIdentifier: {
          system: "https://fhir.nhs.uk/Id/task-group",
          value: "Prescription upload successful"
        },
        businessStatus: {
          coding: [
            {
              code: "0001",
              display: "Task Status",
              system: "https://fhir.nhs.uk/CodeSystem/task-status"
            }
          ]
        },
        owner: {
          identifier: {
            system: "https://fhir.nhs.uk/Id/pharmacy",
            value: "A83008"
          }
        },
        output: [
          {
            type: {
              coding: [
                {
                  code: "medication-dispense",
                  system: "https://fhir.nhs.uk/CodeSystem/task-output",
                  display: "Medication Dispense Reference"
                }
              ]
            },
            valueReference: {
              reference: "MedicationDispense/9AD427-A83008-2E461K"
            }
          }
        ]
      }
    }
  ]
}

export const expectedPrescriptionNotFoundResponse = {
  headers: {
    "Content-Type": "application/fhir+json",
    "Cache-Control": "no-cache"
  },
  statusCode: 404,
  body: JSON.stringify({
    resourceType: "OperationOutcome",
    issue: [
      {
        severity: "error",
        code: "not-found",
        details: {
          coding: [
            {
              system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
              code: "RESOURCE_NOT_FOUND",
              display: "404: Prescription not found"
            }
          ]
        },
        diagnostics: "No prescription found in the Spine response."
      }]
  })
}
