import {JSONSchema, FromSchema} from "json-schema-to-ts"
import {
  dosageInstruction,
  id,
  intent,
  medicationCodeableConcept,
  quantity,
  statusReason,
  subject
} from "./elements"
import {dispensingInformationExtension, pendingCancellationExtension} from "./extensions"

const status = {
  type: "string",
  enum: [
    "active",
    "cancelled",
    "completed",
    "stopped"
  ]
} as const satisfies JSONSchema
export type MedicationRequestStatusType = FromSchema<typeof status>

const courseOfTherapyType = {
  type: "object",
  properties: {
    coding: {
      type: "array",
      items: {
        type: "object",
        properties: {
          system: {
            type: "string",
            enum: ["http://terminology.hl7.org/CodeSystem/medicationrequest-course-of-therapy"]
          },
          code: {
            type: "string",
            enum: [
              "acute",
              "continuous",
              "continuous-repeat-dispensing"
            ]
          },
          display: {
            type: "string",
            enum: [
              "Short course (acute) therapy",
              "Continuous long term therapy",
              "Continuous long term (repeat dispensing)"
            ]
          }
        },
        required: ["system", "code", "display"]
      }
    }
  },
  required: ["coding"]
} as const satisfies JSONSchema
export type CourseOfTherapyTypeCoding = FromSchema<typeof courseOfTherapyType>["coding"][0]

export const medicationRequest = {
  type: "object",
  properties: {
    resourceType: {
      type: "string",
      description: "The resource type.",
      enum: ["MedicationRequest"]
    },
    id,
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
    requester: {
      type: "object",
      properties: {
        reference: {
          type: "string"
        }
      },
      required: ["reference"]
    },
    groupIdentifier: {
      type: "object",
      properties: {
        system: {
          type: "string",
          enum: ["https://fhir.nhs.uk/Id/prescription-order-number"]
        },
        value: {
          type: "string"
        }
      },
      required: ["system", "value"]
    },
    medicationCodeableConcept,
    courseOfTherapyType,
    dispenseRequest: {
      type: "object",
      properties: {
        quantity,
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
    dosageInstruction,
    substitution: {
      type: "object",
      properties: {
        allowedBoolean: {
          type: "boolean",
          enum: [false]
        }
      },
      required: ["allowedBoolean"]
    },
    extension: {
      type: "array",
      items: {
        oneOf: [
          dispensingInformationExtension,
          pendingCancellationExtension
        ]
      }
    }
  },
  required: [
    "resourceType",
    "id",
    "identifier",
    "subject",
    "status",
    "intent",
    "requester",
    "groupIdentifier",
    "medicationCodeableConcept",
    "courseOfTherapyType",
    "dispenseRequest",
    "dosageInstruction",
    "substitution",
    "extension"
  ]
} as const satisfies JSONSchema
export type MedicationRequestType = FromSchema<typeof medicationRequest>
