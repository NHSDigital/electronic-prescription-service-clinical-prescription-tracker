import {bundleEntryCommonProperties, patientCommonProperties} from "@cpt-common/common-types/schema"
import {FromSchema, JSONSchema} from "json-schema-to-ts"

export const patient = {
  type: "object",
  properties: {
    ...patientCommonProperties
  },
  required: [
    "resourceType",
    "identifier"
  ]
} as const satisfies JSONSchema
export type PatientType = FromSchema<typeof patient>

export const patientBundleEntry = {
  type: "object",
  properties: {
    ...bundleEntryCommonProperties,
    resource: patient
  },
  required: ["fullUrl", "search", "resource"]
} as const satisfies JSONSchema
export type PatientBundleEntryType = FromSchema<typeof patientBundleEntry>
