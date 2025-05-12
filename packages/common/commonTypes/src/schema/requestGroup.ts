/* eslint-disable max-len */
import {JSONSchema} from "json-schema-to-ts"
import {subject, intent} from "./elements"

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
  subject,
  status: {
    type: "string",
    description: "The current state of the request. For request groups, the status reflects the status of all the requests in the group.",
    enum: ["active"]
  },
  intent,
  authoredOn: {
    description: "The date the prescription was created.",
    type: "string",
    format: "date-time"
  }
} as const satisfies Readonly<Record<string, JSONSchema>>
