/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import {FromSchema, JSONSchema} from "json-schema-to-ts"

export const operationOutcomeSchema = {
  type: "object",
  description: "A collection of error, warning, or information messages that result from a system action",
  properties: {
    resourceType: {
      type: "string",
      description: "The resource type.",
      const: "OperationOutcome"
    },
    meta: {
      type: "object",
      description: "Metadata about the resource.",
      properties: {
        lastUpdated: {
          type: "string",
          description: "When the resource version last changed."
        }
      }
    },
    issue: {
      type: "array",
      description: "An error, warning, or information message that results from a system action",
      minItems: 1,
      items: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description: "Error or warning code.",
            enum:[
              "value",
              "not-found",
              "exception",
              "timeout"
            ]
          },
          severity: {
            type: "string",
            description: "Indicates whether the issue indicates a variation from successful processing.",
            enum: [
              "error",
              "fatal",
              "warning",
              "information"
            ]
          },
          diagnostics: {
            type: "string",
            description: "Additional diagnostic information about the issue."
          },
          details:{
            type: "object",
            description: "Additional details about the error.",
            properties: {
              coding: {
                type: "array",
                description: "",
                items: {
                  type: "object",
                  properties: {
                    system: {
                      type: "string",
                      description: "Identity of the terminology system.",
                      const: "https://fhir.nhs.uk/CodeSystem/http-error-codes"
                    },
                    code: {
                      type: "string",
                      description: "Symbol in syntax defined by the system.",
                      enum: [
                        "BAD_REQUEST",
                        "NOT_FOUND",
                        "SERVER_ERROR",
                        "TIMEOUT"
                      ]
                    },
                    display: {
                      type: "string",
                      description: "A representation of the meaning of the code in the system.",
                      enum: [
                        "400: The Server was unable to process the request.",
                        "404: The Server was unable to find the specified resource.",
                        "500: The Server has encountered an error processing the request.",
                        "504: The server has timed out whilst processing the request."
                      ]
                    }
                  }
                }
              }
            }
          }
        },
        required: [
          "code",
          "severity"
        ]
      }
    }
  },
  required: ["resourceType", "issue"]
} satisfies JSONSchema

const patientBundleEntrySchema = {
  type: "object",
  description: "An Patient entry in a bundle resource.",
  properties: {
    fullUrl: {
      type: "string",
      description: "URI for the resource."
    },
    search: {
      type: "object",
      description: "Search related information.",
      properties: {
        mode: {
          type: "string",
          description: "Why this entry is in the result set.",
          const: "include"
        }
      }
    },
    resource: {
      type: "object",
      description: "A resource in the bundle.",
      properties: {
        resourceType: {
          type: "string",
          description: "The resource type.",
          const: "Patient"
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
                description: "A coded type for the identifier that can be used to determine which identifier to use for a specific purpose.",
                const: "https://fhir.nhs.uk/Id/nhs-number"
              },
              value: {
                type: "string",
                description: "The value that is unique."

              }
            }
          }
        },
        name: {
          type: "array",
          description: "A name associated with the patient.",
          items: {
            type: "object",
            description: "Name of a human - parts and usage.",
            properties: {
              prefix: {
                type: "string",
                description: "Parts that come before the name."
              },
              suffix: {
                type: "string",
                description: "Parts that come after the name."
              },
              given: {
                type: "string",
                description: "Given names (not always 'first'). Includes middle names."
              },
              family: {
                type: "string",
                description: "Family name (often called 'Surname')."
              }
            }
          }
        }
      }
    }
  }
} satisfies JSONSchema

// TODO: the request group extensions
const prescriptionStatusExtensionSchema = {
  type: "object"
} satisfies JSONSchema

const requestGroupBundleEntrySchema = {
  type: "object",
  description: "A group of related requests.",
  properties: {
    fullUrl: {
      type: "string",
      description: "URI for the resource."
    },
    search: {
      type: "object",
      description: "Search related information.",
      properties: {
        mode: {
          type: "string",
          description: "Why this entry is in the result set.",
          const: "match"
        }
      }
    },
    resource: {
      type: "object",
      description: "A resource in the bundle.",
      properties: {
        resourceType: {
          type: "string",
          description: "The resource type.",
          const: "RequestGroup"
        },
        identifier: {
          type: "array",
          description: "Business identifier.",
          items: {
            type: "object",
            description: "An identifier - identifies some entity uniquely and unambiguously.",
            properties: {
              system: {
                type: "string",
                description: "A coded type for the identifier that can be used to determine which identifier to use for a specific purpose.",
                const: "https://fhir.nhs.uk/Id/prescription-order-number"
              },
              value: {
                type: "string",
                description: "The value that is unique."

              }
            }
          }
        },
        subject: {
          type: "object",
          description: "Who the request group is about.",
          properties: {
            reference: {
              type: "string",
              description: "Type the reference refers to (e.g. 'Patient')."
            }
          }
        },
        status: {
          type: "string",
          description: "The current state of the request. For request groups, the status reflects the status of all the requests in the group.",
          const: "active"
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
          type: "string",
          description: "When the request group was authored."
        },
        extension: {
          type: "array",
          description: "Additional content defined by implementations.",
          items: {
            oneOf: [
              prescriptionStatusExtensionSchema
            ]
          }
        }
      },
      required: [
        "status",
        "intent"
      ]
    }
  }
} satisfies JSONSchema

// TODO: the bundle schema
export const requestGroupBundleSchema = {

} satisfies JSONSchema

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
        }
        // "outcome": outcomeSchema
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

export type outcomeType = FromSchema<typeof operationOutcomeSchema>
export type bundleEntryType = FromSchema<typeof bundleEntrySchema>
export type bundleType = FromSchema<typeof bundleSchema>
