import {
  bundleEntryCommonProperties,
  medicationRepeatInformationExtension,
  pendingCancellationExtension,
  prescriptionStatusExtension,
  requestGroupCommonProperties
} from "@cpt-common/common-types/schema"
import {FromSchema, JSONSchema} from "json-schema-to-ts"
import {historyAction, prescriptionLineItemsAction} from "./actions"
import {prescriptionTypeExtension} from "./extensions"

export const requestGroup = {
  type: "object",
  description: "A FHIR RequestGroup representing a prescription.",
  properties: {
    ...requestGroupCommonProperties,
    id: {
      type: "string",
      description: "Logical id of this artifact"
    },
    author: {
      type: "object",
      description: "The ODS code of the organization that authored the prescription.",
      properties: {
        identifier: {
          type: "object",
          properties: {
            system: {
              type: "string",
              enum: ["https://fhir.nhs.uk/Id/ods-organization-code"]
            },
            value: {
              type: "string"
            }
          },
          required: ["system", "value"]
        }
      }
    },
    extension: {
      type: "array",
      description: "Additional information related to the prescription.",
      items: {
        oneOf: [
          prescriptionStatusExtension,
          medicationRepeatInformationExtension,
          pendingCancellationExtension,
          prescriptionTypeExtension
        ]
      }
    },
    action: {
      type: "array",
      items: {
        oneOf: [
          prescriptionLineItemsAction,
          historyAction
        ]
      }
    }
  },
  required: [
    "resourceType",
    "id",
    "identifier",
    "intent",
    "author",
    "authoredOn",
    "subject",
    "action"
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
