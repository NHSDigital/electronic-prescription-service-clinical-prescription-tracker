/* eslint-disable max-len */
import {JSONSchema, FromSchema} from "json-schema-to-ts"

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

export const dispenseStatus = {
  type: "object",
  properties: {
    url: {
      type: "string",
      enum: ["dispenseStatus"]
    },
    valueCoding: {
      type: "object",
      properties: {
        system: {
          type: "string",
          enum: ["https://fhir.nhs.uk/CodeSystem/medicationdispense-type"]
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
            "0008"
          ]
        },
        display: {
          type: "string",
          enum: [
            "Item fully dispensed",
            "Item not dispensed",
            "Item dispensed - partial",
            "Item not dispensed - owing",
            "Item Cancelled",
            "Expired",
            "Item to be dispensed",
            "Item with dispenser"
          ]
        }
      },
      required: ["system", "code", "display"]
    }
  },
  required: ["url", "valueCoding"]
} as const satisfies JSONSchema
export type DispenseStatusCoding = FromSchema<typeof dispenseStatus>["valueCoding"]

export const id = {
  type: "string",
  description: "Logical id of this artifact"
} as const satisfies JSONSchema

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

export const statusReason = {
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

export const medicationCodeableConcept = {
  type: "object",
  properties: {
    text: {
      type: "string"
    }
  },
  required: ["text"]
} as const satisfies JSONSchema

export const dosageInstruction = {
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
} as const satisfies JSONSchema

export const quantity ={
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
} as const satisfies JSONSchema

export const daysSupply = {
  type: "object",
  properties: {
    value: {
      type: "integer"
    },
    unit: {
      type: "string",
      enum: ["days"]
    },
    system: {
      type: "string",
      enum: ["http://unitsofmeasure.org"]
    },
    code: {
      type: "string",
      enum: ["d"]
    }
  }
} as const satisfies JSONSchema
