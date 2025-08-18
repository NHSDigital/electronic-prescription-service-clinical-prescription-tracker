import {FromSchema, JSONSchema} from "json-schema-to-ts"

const code = {
  type: "string",
  description: "Error or warning code.",
  enum:[
    "value",
    "forbidden",
    "not-found",
    "exception",
    "timeout"
  ]
} as const satisfies JSONSchema
export type OperationOutcomeIssueCode = FromSchema<typeof code>

const httpErrorCoding = {
  type: "object",
  properties: {
    system: {
      type: "string",
      description: "Identity of the terminology system.",
      enum: ["https://fhir.nhs.uk/CodeSystem/http-error-codes"]
    },
    code: {
      type: "string",
      description: "Symbol in syntax defined by the system.",
      enum: [
        "BAD_REQUEST",
        "UNAUTHORIZED",
        "FORBIDDEN",
        "NOT_FOUND",
        "REC_TIMEOUT",
        "SERVER_ERROR",
        "TIMEOUT"
      ]
    },
    display: {
      type: "string",
      description: "A representation of the meaning of the code in the system.",
      enum: [
        "400: The Server was unable to process the request.",
        "401: The Server deemed you unauthorized to make this request",
        "403: Failed to Authenticate with the Server.",
        "404: The Server was unable to find the specified resource.",
        "408: The server has timed out whilst processing the request.",
        "500: The Server has encountered an error processing the request."
      ]
    }
  },
  required: ["system", "code", "display"]
} as const satisfies JSONSchema
export type HttpErrorCoding = FromSchema<typeof httpErrorCoding>

export const operationOutcomeIssue = {
  type: "object",
  properties: {
    code,
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
          items: httpErrorCoding
        }
      },
      required: ["coding"]
    }
  },
  required: [
    "code",
    "severity",
    "details"
  ]
} as const satisfies JSONSchema
export type OperationOutcomeIssueType = FromSchema<typeof operationOutcomeIssue>

export const operationOutcome = {
  type: "object",
  description: "A collection of error, warning, or information messages that result from a system action.",
  properties: {
    resourceType: {
      type: "string",
      description: "The resource type.",
      enum: ["OperationOutcome"]
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
      items: operationOutcomeIssue
    }
  },
  required: ["resourceType", "issue"]
} as const satisfies JSONSchema
export type OperationOutcomeType = FromSchema<typeof operationOutcome>
