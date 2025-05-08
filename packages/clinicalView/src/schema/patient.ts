import {FromSchema, JSONSchema} from "json-schema-to-ts"
import {gender, patientCommonProperties} from "@cpt-common/common-types/schema"

export const patientSchema = {
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
        required: ["line", "text", "type", "use"]
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
export type PatientType = FromSchema<typeof patientSchema>
