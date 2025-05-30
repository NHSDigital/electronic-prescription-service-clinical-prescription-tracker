import {FromSchema, JSONSchema} from "json-schema-to-ts"
import {taskBusinessStatus} from "./elements"

export const prescriptionStatusExtension = {
  type: "object",
  description: "The prescription status.",
  properties: {
    url: {
      type: "string",
      description: "Source of the definition for the extension code - a logical name or a URL.",
      enum: ["https://fhir.nhs.uk/StructureDefinition/Extension-EPS-PrescriptionStatusHistory"]
    },
    extension: {
      type: "array",
      description: "Additional content defined by implementations.",
      items: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "Source of the definition for the extension code - a logical name or a URL.",
            enum: ["status"]
          },
          valueCoding: taskBusinessStatus
        },
        required: ["url", "valueCoding"]
      }
    }
  },
  required: ["url", "extension"]
} as const satisfies JSONSchema
export type PrescriptionStatusExtensionType = FromSchema<typeof prescriptionStatusExtension>

export const medicationRepeatInformationExtension = {
  type: "object",
  description: "Medication repeat information.",
  properties: {
    url: {
      type: "string",
      enum: ["https://fhir.nhs.uk/StructureDefinition/Extension-EPS-RepeatInformation"]
    },
    extension: {
      type: "array",
      items: {
        oneOf: [
          {
            type: "object",
            properties: {
              url: {
                type: "string",
                enum: ["numberOfRepeatsAllowed"]
              },
              valueInteger: {type: "integer"}
            },
            required: ["url", "valueInteger"]
          },
          {
            type: "object",
            properties: {
              url: {
                type: "string",
                enum: ["numberOfRepeatsIssued"]
              },
              valueInteger: {type: "integer"}
            },
            required: ["url", "valueInteger"]
          }
        ]
      }
    }
  },
  required: ["url", "extension"]
} as const satisfies JSONSchema
export type MedicationRepeatInformationExtensionType = FromSchema<typeof medicationRepeatInformationExtension>

export const pendingCancellationExtension = {
  type: "object",
  description: "Pending cancellation information",
  properties: {
    url: {
      type: "string",
      description: "Source of the definition for the extension code - a logical name or a URL.",
      enum: ["https://fhir.nhs.uk/StructureDefinition/Extension-PendingCancellation"]
    },
    extension: {
      type: "array",
      description: "Additional content defined by implementations.",
      items: {
        oneOf: [
          {
            type: "object",
            description: "Source of the definition for the extension code - a logical name or a URL.",
            properties: {
              url: {
                type: "string",
                enum: ["prescriptionPendingCancellation"]
              },
              valueBoolean: {
                type: "boolean",
                description: "Value of 'true' or 'false'."
              }
            },
            required: ["url", "valueBoolean"]
          },
          {
            type: "object",
            description: "Source of the definition for the extension code - a logical name or a URL.",
            properties: {
              url: {
                type: "string",
                enum: ["lineItemPendingCancellation"]
              },
              valueBoolean: {
                type: "boolean",
                description: "Value of 'true' or 'false'."
              }
            },
            required: ["url", "valueBoolean"]
          }
        ]
      }
    }
  },
  required: ["url", "extension"]
} as const satisfies JSONSchema
export type PendingCancellationExtensionType = FromSchema<typeof pendingCancellationExtension>
