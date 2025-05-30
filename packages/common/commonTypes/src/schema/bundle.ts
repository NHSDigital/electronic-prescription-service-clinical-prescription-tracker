import {JSONSchema} from "json-schema-to-ts"

export const searchsetBundleCommonProperties = {
  resourceType: {
    type: "string",
    description: "The resource type.",
    enum: ["Bundle"]
  },
  type: {
    type: "string",
    description: "Indicates the purpose of this bundle - how it is intended to be used.",
    enum: ["searchset"]
  },
  total: {
    type: "integer",
    description: "If search, the total number of matches."
  }
} as const satisfies Readonly<Record<string, JSONSchema>>

export const bundleEntryCommonProperties = {
  fullUrl: {
    type: "string"
  },
  search: {
    type: "object",
    properties: {
      mode: {
        type: "string"
      }
    },
    required: ["mode"]
  }
} as const satisfies Readonly<Record<string, JSONSchema>>
