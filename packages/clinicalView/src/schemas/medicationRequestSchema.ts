import {JSONSchema} from "json-schema-to-ts"

export const medicationRequestSchema = {
  type: "object",
  properties: {
    resourceType: {type: "string", enum: ["MedicationRequest"]},
    id: {type: "string"},
    status: {type: "string"},
    medicationCodeableConcept: {
      type: "object",
      properties: {
        coding: {
          type: "array",
          items: {
            type: "object",
            properties: {
              system: {type: "string"},
              code: {type: "string"},
              display: {type: "string"}
            },
            required: ["system", "code"]
          }
        }
      }
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
      }
    },
    dosageInstruction: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: {type: "string"}
        }
      }
    },
    extension: {
      type: "array",
      items: {
        type: "object",
        properties: {
          url: {type: "string"},
          extension: {
            type: "array",
            items: {
              type: "object",
              properties: {
                url: {type: "string"},
                valueBoolean: {type: "boolean"},
                valueCoding: {
                  type: "object",
                  properties: {
                    system: {type: "string"},
                    code: {type: "string"},
                    display: {type: "string"}
                  },
                  required: ["system", "code"]
                }
              },
              required: ["url"]
            }
          }
        },
        required: ["url"]
      }
    }
  },
  required: ["resourceType", "id", "status"],
  additionalProperties: false
} as const satisfies JSONSchema
