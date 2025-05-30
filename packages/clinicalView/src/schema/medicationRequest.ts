import {
  bundleEntryCommonProperties,
  intent,
  pendingCancellationExtension,
  subject
} from "@cpt-common/common-types/schema"
import {FromSchema, JSONSchema} from "json-schema-to-ts"
import {
  dosageInstruction,
  id,
  lineItemIdentifier,
  medicationCodeableConcept,
  quantity
} from "./elements"
import {dispensingInformationExtension, performerSiteTypeExtension} from "./extensions"

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
    identifier: lineItemIdentifier,
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
        },
        extension: {
          type: "array",
          items: performerSiteTypeExtension
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

export const medicationRequestBundleEntry = {
  type: "object",
  properties: {
    ...bundleEntryCommonProperties,
    resource: medicationRequest
  },
  required: ["fullUrl", "search", "resource"]
} as const satisfies JSONSchema
export type MedicationRequestBundleEntryType = FromSchema<typeof medicationRequestBundleEntry>
