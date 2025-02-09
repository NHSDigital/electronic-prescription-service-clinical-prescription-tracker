const expectedFhirResponse = {
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
          value: "0001"
        },
        identifier: [
          {
            system: "https://fhir.nhs.uk/Id/prescription-order-number",
            value: "9AD427-A83008-2E461K"
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
    }
  ]
}

export default expectedFhirResponse
