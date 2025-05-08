import {JSONSchema, FromSchema} from "json-schema-to-ts"

export const patientCommonProperties = {
  resourceType: {
    type: "string",
    description: "The resource type.",
    enum: ["Patient"]
  },
  identifier: {
    type: "array",
    description: "An identifier for this patient.",
    items: {
      type: "object",
      description: "An identifier - identifies some entity uniquely and unambiguously.",
      properties: {
        system: {
          type: "string",
          enum: ["https://fhir.nhs.uk/Id/nhs-number"]
        },
        value: {
          type: "string",
          description: "The value that is unique."
        }
      },
      required: ["system", "value"]
    },
    minItems: 1,
    maxItems: 1
  },
  name: {
    type: "array",
    description: "A name associated with the patient.",
    items: {
      type: "object",
      description: "Name of a human - parts and usage.",
      properties: {
        prefix: {
          type: "array",
          items: {type: "string"},
          description: "Parts that come before the name."
        },
        suffix: {
          type: "array",
          items: {type: "string"},
          description: "Parts that come after the name."
        },
        given: {
          type: "array",
          items: {type: "string"},
          description: "Given names (not always 'first'). Includes middle names."
        },
        family: {
          type: "string",
          description: "Family name (often called 'Surname')."
        }
      }
    },
    minItems: 1,
    maxItems: 1
  }
} as const satisfies Readonly<Record<string, JSONSchema>>

export const gender = {
  type: "string",
  enum: ["male", "female", "other", "unknown"]
} as const satisfies JSONSchema
export type GenderType = FromSchema<typeof gender>
