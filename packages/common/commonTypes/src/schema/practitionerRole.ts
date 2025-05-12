import {JSONSchema, FromSchema} from "json-schema-to-ts"

export const practitionerRole = {
  type: "object",
  properties: {
    resourceType: {
      type: "string",
      description: "The resource type.",
      enum: ["PractitionerRole"]
    },
    id: {
      type: "string"
    },
    organization: {
      type: "object",
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
      },
      required: ["identifier"]
    }
  },
  required: ["resourceType", "id", "organization"]
} as const satisfies JSONSchema
export type PractitionerRoleType = FromSchema<typeof practitionerRole>
