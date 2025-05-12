import {FromSchema, JSONSchema} from "json-schema-to-ts"
import {
  requestGroupCommonProperties,
  prescriptionStatusExtension,
  medicationRepeatInformationExtension,
  pendingCancellationExtension,
  prescriptionTypeExtension,
  medicationRequest,
  medicationDispense,
  practitionerRole
} from "@cpt-common/common-types/schema"
import {patient} from "./patient"

export const requestGroup = {
  type: "object",
  description: "A FHIR RequestGroup representing a prescription",
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
    action: {},
    contained: {
      type: "array",
      items: {
        oneOf: [
          patient,
          practitionerRole,
          medicationRequest,
          medicationDispense
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
    "action",
    "contained"
  ]
} as const satisfies JSONSchema
export type RequestGroupType = FromSchema<typeof requestGroup>
