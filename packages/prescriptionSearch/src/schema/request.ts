import {FromSchema, JSONSchema} from "json-schema-to-ts"

export const bundleEntrySchema = {
  "type": "object",
  "required": [
    "fullUrl",
    "resource",
    "request"
  ],
  "description": "A FHIR collection Bundle.",
  "properties": {
    "fullUrl": {
      "type": "string",
      "examples": ["urn:uuid:4d70678c-81e4-4ff4-8c67-17596fd0aa46"]
    }
  }
} as const satisfies JSONSchema

export const bundleSchema = {
  "type": "object",
  "required": [
    "entry",
    "resourceType",
    "type"
  ],
  "description": "A FHIR transaction Bundle.",
  "properties": {
    "resourceType": {
      "type": "string",
      "description": "FHIR resource type.",
      "enum": [
        "Bundle"
      ]
    },
    "type": {
      "type": "string",
      "description": "Denotes that the bundle is a list of status updates to be performed as one transaction.",
      "enum": [
        "transaction"
      ]
    },
    "entry": {
      "type": "array",
      "description": "A collection of resources contained within the Bundle.\n",
      "items": bundleEntrySchema
    }
  }
} as const satisfies JSONSchema

export const eventSchema = {
  type: "object",
  required: ["body", "headers"],
  properties: {
    body: bundleSchema,
    headers: {
      type: "object"
    }
  }
} as const satisfies JSONSchema

export type bundleEntryType = FromSchema<typeof bundleEntrySchema>
export type bundleType = FromSchema<typeof bundleSchema>
