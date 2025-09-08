import {bundleEntryCommonProperties, subject} from "@cpt-common/common-types/schema"
import {FromSchema, JSONSchema} from "json-schema-to-ts"
import {
  dispenseStatusCoding,
  dosageInstruction,
  id,
  lineItemIdentifier,
  medicationCodeableConcept,
  nonDispensingReasonCoding,
  quantity
} from "./elements"
import {taskBusinessStatusExtension} from "./extensions"

const status = {
  type: "string",
  enum: [
    "in-progress",
    "unknown"
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
    identifier: lineItemIdentifier,
    subject,
    status,
    statusReasonCodeableConcept: {
      type: "object",
      properties: {
        coding: {
          type: "array",
          items: nonDispensingReasonCoding
        }
      },
      required: ["coding"]
    },
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
    type: {
      type: "object",
      properties: {
        coding: {
          type: "array",
          items: dispenseStatusCoding
        }
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
    "identifier",
    "subject",
    "status",
    "performer",
    "type",
    "authorizingPrescription",
    "medicationCodeableConcept",
    "quantity",
    "extension"
  ]
} as const satisfies JSONSchema

export const medicationDispenseBundleEntry = {
  type: "object",
  properties: {
    ...bundleEntryCommonProperties,
    resource: medicationDispense
  },
  required: ["fullUrl", "search", "resource"]
} as const satisfies JSONSchema
export type MedicationDispenseBundleEntryType = FromSchema<typeof medicationDispenseBundleEntry>
