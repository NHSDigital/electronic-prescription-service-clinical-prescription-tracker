/* eslint-disable max-len */
import {JSONSchema, FromSchema} from "json-schema-to-ts"
import {intent, subject} from "./elements"

const status = {
  type: "string",
  description: "The current state of the request. For request groups, the status reflects the status of all the requests in the group.",
  enum: [
    "active",
    "cancelled",
    "completed",
    "stopped"
  ]
} as const satisfies JSONSchema
export type StatusType = FromSchema<typeof status>

const statusReason = {
  type: "object",
  properties: {
    coding: {
      type: "array",
      items: {
        type: "object",
        properties: {
          system: {
            type: "string",
            enum: ["https://fhir.nhs.uk/CodeSystem/medicationrequest-status-reason"]
          },
          code: {
            type: "string",
            enum: [
              "0001",
              "0002",
              "0003",
              "0004",
              "0005",
              "0006",
              "0007",
              "0008",
              "0009"
            ]
          },
          display: {
            type: "string",
            enum: [
              "Prescribing Error",
              "Clinical contra-indication",
              "Change to medication treatment regime",
              "Clinical grounds",
              "At the Patients request",
              "At the Pharmacists request",
              "Notification of Death",
              "Patient deducted - other reason",
              "Patient deducted - registered with new practice"
            ]
          }
        },
        required: ["system", "code", "display"]
      }
    }
  },
  required: ["coding"]
} as const satisfies JSONSchema
export type StatusReasonCoding = FromSchema<typeof statusReason>["coding"][0]

export const medicationRequest = {
  type: "object",
  properties: {
    resourceType: {
      type: "string",
      description: "The resource type.",
      enum: ["MedicationRequest"]
    },
    id: {
      type: "string",
      description: "Logical id of this artifact"
    },
    identifier: {
      type: "array",
      items: {
        type: "object",
        properties: {
          system: {
            type: "string",
            enum: ["https://fhir.nhs.uk/Id/prescription-order-item-number"]
          },
          value: {
            type: "string"
          }
        }
      }
    },
    subject,
    status,
    statusReason,
    intent,
    medicationCodeableConcept: {
      type: "object",
      properties: {
        text: {
          type: "string"
        }
      },
      required: ["text"]
    },
    dispenseRequest: {
      type: "object",
      properties: {
        quantity: {
          type: "object",
          properties: {
            value: {
              type: "integer"
            },
            unit: {
              type: "string"
            }
          },
          required: ["value", "unit"]
        },
        performer: {
          type: "object",
          properties: {
            identifier: {
              type: "array",
              items:{
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
            }
          },
          required: ["identifier"]
        }
      },
      required: ["quantity"]
    },
    dosageInstruction: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: {
            type: "string"
          }
        },
        required: ["text"]
      }
    }
  },
  required: [
    "resourceType",
    "id",
    "identifier",
    "status",
    "subject",
    "medicationCodeableConcept",
    "dispenseRequest"
  ]
} as const satisfies JSONSchema
export type MedicationRequestType = FromSchema<typeof medicationRequest>
