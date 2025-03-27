import {JSONSchema, FromSchema} from "json-schema-to-ts"

export const medicationRequestSchema = {
  type: "object",
  properties: {
    resourceType: {type: "string", enum: ["MedicationRequest"]},
    id: {type: "string"},
    status: {type: "string"},
    subject: {
      type: "object",
      properties: {
        reference: {type: "string"}
      },
      required: ["reference"]
    },
    medicationCodeableConcept: {
      type: "object",
      properties: {
        coding: {
          type: "array",
          items: {
            type: "object",
            properties: {
              system: {type: "string", enum: ["http://snomed.info/sct"]},
              code: {type: "string"},
              display: {type: "string"}
            },
            required: ["system", "code", "display"]
          },
          minItems: 1,
          maxItems: 1
        }
      },
      required: ["coding"]
    },
    dispenseRequest: {
      type: "object",
      properties: {
        quantity: {
          type: "object",
          properties: {
            value: {type: "integer"}
          },
          required: ["value"]
        }
      },
      required: ["quantity"]
    },
    dosageInstruction: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: {type: "string"}
        },
        required: ["text"]
      },
      minItems: 1,
      maxItems: 1
    },
    extension: {
      type: "array",
      items: {
        oneOf: [
          {
            type: "object",
            properties: {
              url: {
                type: "string",
                enum: ["https://fhir.nhs.uk/StructureDefinition/Extension-EPS-DispensingInformation"]
              },
              extension: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    url: {type: "string", enum: ["dispenseStatus"]},
                    valueCoding: {
                      type: "object",
                      properties: {
                        system: {type: "string", enum: ["https://fhir.nhs.uk/CodeSystem/medicationdispense-type"]},
                        code: {type: "string"},
                        display: {type: "string"}
                      },
                      required: ["system", "code", "display"]
                    }
                  },
                  required: ["url", "valueCoding"]
                }
              }
            },
            required: ["url", "extension"]
          },
          {
            type: "object",
            properties: {
              url: {
                type: "string",
                enum: ["https://fhir.nhs.uk/StructureDefinition/Extension-EPS-PendingCancellations"]
              },
              extension: {
                type: "array",
                items: {
                  oneOf: [
                    {
                      type: "object",
                      properties: {
                        url: {type: "string", enum: ["lineItemPendingCancellation"]},
                        valueBoolean: {type: "boolean"}
                      },
                      required: ["url", "valueBoolean"]
                    },
                    {
                      type: "object",
                      properties: {
                        url: {type: "string", enum: ["cancellationReason"]},
                        valueCoding: {
                          type: "object",
                          properties: {
                            system: {
                              type: "string",
                              enum: ["https://fhir.nhs.uk/CodeSystem/medicationrequest-status-reason"]
                            },
                            code: {type: "string"},
                            display: {type: "string"}
                          },
                          required: ["system", "code", "display"]
                        }
                      },
                      required: ["url", "valueCoding"]
                    }
                  ]
                }
              }
            },
            required: ["url", "extension"]
          }
        ]
      }
    }
  },
  required: [
    "resourceType",
    "id", "status",
    "subject",
    "medicationCodeableConcept",
    "dispenseRequest",
    "dosageInstruction"
  ],
  additionalProperties: false
} as const satisfies JSONSchema

export type MedicationRequestType = FromSchema<typeof medicationRequestSchema>
