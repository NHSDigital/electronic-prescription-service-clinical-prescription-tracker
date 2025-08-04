/* eslint-disable max-len */
import {JSONSchema, FromSchema} from "json-schema-to-ts"

// Patient subject
export const subject = {
  type: "object",
  description: "A reference to the patient the prescription is for.",
  properties: {
    reference: {
      type: "string"
    }
  },
  required: ["reference"]
} as const satisfies JSONSchema

export const intent = {
  type: "string",
  description: "Indicates the level of authority/intentionality associated with the request and where the request fits into the workflow chain.",
  enum: [
    "order",
    "instance-order",
    "reflex-order"
  ]
} as const satisfies JSONSchema
export type IntentType = FromSchema<typeof intent>

export const taskBusinessStatus = {
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
        "0000",
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
        "Awaiting Release Ready",
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
} as const satisfies JSONSchema
export type PrescriptionStatusCoding = FromSchema<typeof taskBusinessStatus>

export const cancellationReasonCoding = {
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
export type CancellationReasonCoding = FromSchema<typeof cancellationReasonCoding>["coding"][0]
