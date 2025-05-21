import {patientCommonProperties} from "@cpt-common/common-types/schema"
import {FromSchema, JSONSchema} from "json-schema-to-ts"

export const gender = {
  type: "string",
  enum: ["male", "female", "other", "unknown"]
} as const satisfies JSONSchema
export type GenderType = FromSchema<typeof gender>

export const patient = {
  type: "object",
  properties: {
    ...patientCommonProperties,
    id: {
      type: "string"
    },
    gender,
    birthDate: {
      type: "string",
      format: "date"
    },
    address: {
      type: "array",
      items: {
        type: "object",
        properties: {
          line: {
            type: "array",
            items: {
              type: "string"
            }
          },
          city: {
            type: "string"
          },
          district: {
            type: "string"
          },
          postalCode: {
            type: "string"
          },
          text: {
            type: "string"
          },
          type: {
            type: "string",
            enum: ["both"]
          },
          use: {
            type: "string",
            enum: ["home"]
          }
        },
        required: ["text", "type", "use"]
      }
    }
  },
  required: [
    "resourceType",
    "id",
    "identifier",
    "gender",
    "birthDate"
  ]
} as const satisfies JSONSchema
export type PatientType = FromSchema<typeof patient>
