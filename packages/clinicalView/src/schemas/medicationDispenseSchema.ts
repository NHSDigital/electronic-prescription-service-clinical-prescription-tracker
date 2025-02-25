import {JSONSchema} from "json-schema-to-ts"

export const medicationDispenseSchema = {
  type: "object",
  description: "The name of the medication item included in the Dispense Notification.",
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
      description: "The name of the medication item included in the Dispense Notification.",
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
        value: {
          description: "The quantity of medication that was actually dispensed.",
          type: "integer"
        }
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
      description: "The EPS status, as held within Spine, for items that do have recorded dispensing activity " +
        "against them. Does not include the statuses made available via the PSU API.",
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
      description: "Additional status information provided by the PSU API, if available",
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
