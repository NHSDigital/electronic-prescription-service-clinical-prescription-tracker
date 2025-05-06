import {FromSchema, JSONSchema} from "json-schema-to-ts"

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
          valueCoding: {
            type: "object",
            description: "A reference to a code defined by a terminology system.",
            properties: {
              system: {
                type: "string",
                description: "Identity of the terminology system.",
                enum: ["https://fhir.nhs.uk/CodeSystem/EPS-task-business-status"]
              },
              code: {
                type: "string",
                description: "Symbol in syntax defined by the system.",
                enum: [
                  "0001",
                  "0002",
                  "0003",
                  "0004",
                  "0005",
                  "0006",
                  "0007",
                  "0008",
                  "0009",
                  "9000",
                  "9001",
                  "9005"
                ]
              },
              display: {
                type: "string",
                description: "Representation defined by the system.",
                enum: [
                  "To be Dispensed",
                  "With Dispenser",
                  "With Dispenser - Active",
                  "Expired",
                  "Cancelled",
                  "Dispensed",
                  "Not Dispensed",
                  "Claimed",
                  "No-Claimed",
                  "Repeat Dispense future instance",
                  "Prescription future instance",
                  "Cancelled future instance"
                ]
              }
            },
            required: ["system", "code", "display"]
          }
        },
        required: ["url", "valueCoding"]
      }
    }
  },
  required: ["url", "extension"]
} as const satisfies JSONSchema
export type PrescriptionStatusExtensionType = FromSchema<typeof prescriptionStatusExtension>
export type PrescriptionStatusCoding = PrescriptionStatusExtensionType["extension"][0]["valueCoding"]

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
