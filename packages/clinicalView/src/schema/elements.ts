import {JSONSchema} from "json-schema-to-ts"

export const id = {
  type: "string",
  description: "Logical id of this artifact"
} as const satisfies JSONSchema

// Line item ID
export const identifier = {
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
