import {
  bundleEntryCommonProperties,
  medicationRepeatInformationExtension,
  pendingCancellationExtension,
  prescriptionStatusExtension,
  requestGroupCommonProperties
} from "@cpt-common/common-types/schema"
import {FromSchema, JSONSchema} from "json-schema-to-ts"

export const requestGroup = {
  type: "object",
  description: "A FHIR RequestGroup representing a prescription",
  properties: {
    ...requestGroupCommonProperties,
    extension: {
      type: "array",
      description: "Additional information related to the prescription.",
      items: {
        oneOf: [
          prescriptionStatusExtension,
          medicationRepeatInformationExtension,
          pendingCancellationExtension
        ]
      }
    }
  },
  required: [
    "resourceType",
    "identifier",
    "subject",
    "status",
    "intent",
    "authoredOn",
    "extension"
  ]
} as const satisfies JSONSchema

export const requestGroupBundleEntry = {
  type: "object",
  properties: {
    ...bundleEntryCommonProperties,
    resource: requestGroup
  },
  required: ["fullUrl", "search", "resource"]
} as const satisfies JSONSchema
export type RequestGroupBundleEntryType = FromSchema<typeof requestGroupBundleEntry>
