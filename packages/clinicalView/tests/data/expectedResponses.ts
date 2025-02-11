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
