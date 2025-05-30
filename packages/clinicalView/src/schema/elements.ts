/* eslint-disable max-len */
import {FromSchema, JSONSchema} from "json-schema-to-ts"

export const id = {
  type: "string",
  description: "Temporary id for this resource within the context of this request (not related to longer term identifiers such as short-form prescription id)"
} as const satisfies JSONSchema

// Line item ID
export const lineItemIdentifier = {
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
} as const satisfies JSONSchema

export const medicationCodeableConcept = {
  type: "object",
  properties: {
    text: {
      type: "string"
    }
  },
  required: ["text"]
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

export const dispenseStatusCoding = {
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
} as const satisfies JSONSchema
export type DispenseStatusCoding = FromSchema<typeof dispenseStatusCoding>
