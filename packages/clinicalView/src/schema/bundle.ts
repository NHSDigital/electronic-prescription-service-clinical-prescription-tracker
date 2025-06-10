import {searchsetBundleCommonProperties} from "@cpt-common/common-types/schema"
import {FromSchema, JSONSchema} from "json-schema-to-ts"
import {patientBundleEntry} from "./patient"
import {medicationRequestBundleEntry} from "./medicationRequest"
import {medicationDispenseBundleEntry} from "./medicationDispense"
import {practitionerRoleBundleEntry} from "./practitionerRole"
import {requestGroupBundleEntry} from "./requestGroup"

export const bundle = {
  type: "object",
  description: "A container for a collection of resources.",
  properties: {
    ...searchsetBundleCommonProperties,
    entry: {
      type: "array",
      description: "Entry in the bundle - will have a resource or information.",
      items: {
        oneOf: [
          requestGroupBundleEntry,
          patientBundleEntry,
          medicationRequestBundleEntry,
          medicationDispenseBundleEntry,
          practitionerRoleBundleEntry
        ]
      }
    }
  },
  required: ["resourceType", "type", "total", "entry"]
} as const satisfies JSONSchema
export type BundleType = FromSchema<typeof bundle>
