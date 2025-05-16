import {subject} from "@cpt-common/common-types/schema"
import {FromSchema, JSONSchema} from "json-schema-to-ts"
import {
  daysSupply,
  dosageInstruction,
  id,
  identifier,
  medicationCodeableConcept,
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
    identifier,
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
    daysSupply, /* TODO: seemed to be missing added here */
    extension: {
      type: "array",
      items: taskBusinessStatusExtension
    }
  },
  required: [
    "resourceType",
    "id",
    "identifier",
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
