import {JSONSchema} from "json-schema-to-ts"

export const medicationDispenseSchema = {
  type: "object",
  properties: {
    resourceType: {type: "string", enum: ["MedicationDispense"]},
    id: {type: "string"},
    status: {type: "string"},
    authorizingPrescription: {
      type: "array",
      items: {
        type: "object",
        properties: {
          reference: {type: "string"}
        },
        required: ["reference"]
      }
    },
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
    quantity: {
      type: "object",
      properties: {
        value: {type: "integer"}
      },
      required: ["value"]
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
    type: {
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
    extension: {
      type: "array",
      items: {
        type: "object",
        properties: {
          url: {type: "string"},
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
  required: ["resourceType", "id"],
  additionalProperties: false
} as const satisfies JSONSchema
