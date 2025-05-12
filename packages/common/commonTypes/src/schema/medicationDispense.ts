import {JSONSchema, FromSchema} from "json-schema-to-ts"
import {
  id,
  subject,
  medicationCodeableConcept,
  dosageInstruction,
  quantity
} from "./elements"
import {taskBusinessStatusExtension} from "./extensions"

const status = {
  type: "string",
  enum: [
    "in-progress",
    "cancelled",
    "completed",
    "stopped"
  ]
} as const satisfies JSONSchema
export type MedicationDispenseStatusType = FromSchema<typeof status>

export const medicationDispense = {
  type: "object",
  properties: {
    resourceType: {
      type: "string",
      description: "The resource type.",
      enum: ["MedicationDispense"]
    },
    id,
    subject,
    status,
    performer: {
      type: "array",
      items: {
        type: "object",
        properties: {
          actor: {
            type: "object",
            properties: {
              reference: {
                type: "string"
              }
            },
            required: ["reference"]
          }
        },
        required: ["actor"]
      }
    },
    authorizingPrescription: {
      type: "array",
      items:{
        type: "object",
        properties: {
          reference: {
            type: "string"
          }
        },
        required: ["reference"]
      }
    },
    medicationCodeableConcept,
    quantity,
    dosageInstruction,
    extension: {
      type: "array",
      items: taskBusinessStatusExtension
    }
  },
  required: [
    "resourceType",
    "id",
    "subject",
    "status",
    "performer",
    "authorizingPrescription",
    "medicationCodeableConcept",
    "quantity",
    "extension"
  ]
} as const satisfies JSONSchema
export type MedicationDispenseType = FromSchema<typeof medicationDispense>
