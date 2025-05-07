/* eslint-disable max-len */
import {FromSchema, JSONSchema} from "json-schema-to-ts"
import {
  prescriptionStatusExtension,
  medicationRepeatInformationExtension,
  pendingCancellationExtension,
  prescriptionTypeExtension
} from "./extensions"

export const requestGroupCommonProperties ={
  resourceType: {
    type: "string",
    description: "The resource type.",
    enum: ["RequestGroup"]
  },
  identifier: {
    type: "array",
    description: "The short form prescription ID.",
    items: {
      type: "object",
      description: "An identifier - identifies some entity uniquely and unambiguously.",
      properties: {
        system: {
          type: "string",
          description: "A coded type for the identifier that can be used to determine which identifier to use for a specific purpose.",
          enum: ["https://fhir.nhs.uk/Id/prescription-order-number"]
        },
        value: {
          type: "string",
          description: "The value that is unique."
        }
      },
      required: ["system", "value"]
    }
  },
  subject: {
    type: "object",
    description: "A reference to the patient the prescription is for.",
    properties: {
      reference: {
        type: "string"
      }
    },
    required: ["reference"]
  },
  status: {
    type: "string",
    description: "The current state of the request. For request groups, the status reflects the status of all the requests in the group.",
    enum: ["active"]
  },
  intent: {
    type: "string",
    description: "Indicates the level of authority/intentionality associated with the request and where the request fits into the workflow chain.",
    enum: [
      "order",
      "instance-order",
      "reflex-order"
    ]
  },
  authoredOn: {
    description: "The date the prescription was created.",
    type: "string",
    format: "date-time"
  }
} as const satisfies Readonly<Record<string, JSONSchema>>

export const clinicalViewRequestGroup = {
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
export type ClinicalViewRequestGroupType = FromSchema<typeof clinicalViewRequestGroup>
