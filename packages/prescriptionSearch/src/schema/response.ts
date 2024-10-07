import {FromSchema, JSONSchema} from "json-schema-to-ts"

export const outcomeSchema = {
  "type": "object",
  "required": [
    "resourceType",
    "meta",
    "issue"
  ],
  "description": "Outcome details of the operation.",
  "properties": {
    "resourceType": {
      "type": "string",
      "description": "FHIR Resource Type.",
      "enum": [
        "OperationOutcome"
      ]
    },
    "meta": {
      "type": "object",
      "required": [
        "lastUpdated"
      ],
      "description": "Metadata regarding the request",
      "properties": {
        "lastUpdated": {
          "type": "string",
          "description": "Timestamp at which the response was generated"
        }
      }
    },
    "issue": {
      "type": "array",
      "description": "List of issues that have occurred.",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": [
          "severity",
          "code"
        ],
        "properties": {
          "severity": {
            "type": "string",
            "enum": [
              "fatal",
              "error",
              "warning",
              "information"
            ],
            "description": "Severity of the error."
          },
          "code": {
            "type": "string",
            "description": "FHIR error code.",
            "enum": [
              "business-rule",
              "code-invalid",
              "conflict",
              "deleted",
              "duplicate",
              "exception",
              "expired",
              "extension",
              "forbidden",
              "incomplete",
              "informational",
              "invalid",
              "invariant",
              "lock-error",
              "login",
              "multiple-matches",
              "no-store",
              "not-supported",
              "not-found",
              "processing",
              "required",
              "structure",
              "security",
              "suppressed",
              "throttled",
              "timeout",
              "too-costly",
              "too-long",
              "transient",
              "unknown",
              "value"
            ]
          },
          "expression": {
            "type": "string",
            "description": "FHIR Path of element(s) related to the error.",
            "examples": ["Patient.name.given"]
          },
          "diagnostics": {
            "type": "string",
            "description": "A description of the reasoning for including an OperationOutcome",
            "examples": ["Prescription ID is invalid."]
          }
        }
      }
    }
  }
} as const satisfies JSONSchema

const bundleEntrySchema = {
  "type": "object",
  "required": [
    "response"
  ],
  "properties": {
    "response": {
      "type": "object",
      "required": [
        "status",
        "outcome"
      ],
      "description": "Contains the response details for the transaction.",
      "properties": {
        "status": {
          "type": "string",
          "description": "HTTP status code and reason.",
          "examples": ["400 Bad Request"]
        },
        "location": {
          "type": "string",
          "description": "The virtual location of the resource within the bundle."
        },
        "outcome": outcomeSchema
      }
    },
    "fullUrl": {
      "type": "string",
      "description": "A URL or UUID that identifies the full location of the resource.",
      "examples": ["urn:uuid:3b2d36a9-3cff-45e4-93a7-d1f70f911496"]
    }
  }
} as const satisfies JSONSchema

export const bundleSchema = {
  "type": "object",
  "required": [
    "resourceType",
    "type",
    "entry"
  ],
  "description":
    "Outcome of an operation that does not result in a resource or bundle being returned." +
    "\nFor example - error, async/batch submission.\n",
  "properties": {
    "resourceType": {
      "type": "string",
      "enum": [
        "Bundle"
      ],
      "description": "The type of resource."
    },
    "type": {
      "type": "string",
      "enum": [
        "transaction-response"
      ],
      "description": "The type of bundle."
    },
    "entry": {
      "type": "array",
      "description":
        "An array of entry objects, " +
        "each representing a single response in the transaction-response bundle.",
      "items": bundleEntrySchema
    }
  }
} as const satisfies JSONSchema

export type outcomeType = FromSchema<typeof outcomeSchema>
export type bundleEntryType = FromSchema<typeof bundleEntrySchema>
export type bundleType = FromSchema<typeof bundleSchema>
