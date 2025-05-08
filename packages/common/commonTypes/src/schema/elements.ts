/* eslint-disable max-len */
import {JSONSchema, FromSchema} from "json-schema-to-ts"

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
