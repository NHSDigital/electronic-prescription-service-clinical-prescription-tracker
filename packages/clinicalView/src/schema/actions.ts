/* eslint-disable max-len */
import {taskBusinessStatus} from "@cpt-common/common-types/schema"
import {FromSchema, JSONSchema} from "json-schema-to-ts"

export const referenceAction = {
  type: "object",
  properties: {
    resource: {
      type: "object",
      properties: {
        reference: {
          type: "string"
        }
      },
      required: ["reference"]
    }
  },
  required: ["resource"]
} as const satisfies JSONSchema
export type ReferenceAction = FromSchema<typeof referenceAction>

export const historyAction = {
  type: "object",
  properties: {
    id: {
      type: "string"
    },
    title: {
      type: "string",
      enum: ["Prescription status transitions"]
    },
    action: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string"
          },
          title: {
            type: "string"
          },
          timingDateTime: {
            type: "string"
          },
          code: {
            type: "array",
            items: {
              oneOf: [
                {
                  type: "object",
                  properties: {
                    coding: {
                      type: "array",
                      items: taskBusinessStatus
                    }
                  },
                  required: ["coding"]
                },
                {
                  type: "object",
                  properties: {
                    coding: {
                      type: "array",
                      items: {
                        properties: {
                          system: {
                            type: "string",
                            enum: ["https://tools.ietf.org/html/rfc4122"]
                          },
                          code: {
                            type: "string"
                          }
                        },
                        required: ["system", "code"]
                      }
                    }
                  },
                  required: ["coding"]
                }
              ]
            }
          },
          participant: {
            type: "array",
            items: {
              type: "object",
              properties: {
                extension: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      url: {
                        type: "string",
                        enum: ["http://hl7.org/fhir/5.0/StructureDefinition/extension-RequestOrchestration.action.participant.typeReference"]
                      },
                      valueReference: {
                        type: "object",
                        properties: {
                          identifier: {
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
                        },
                        required: ["identifier"]
                      }
                    },
                    required: ["url", "valueReference"]
                  }
                }
              },
              required: ["extension"]
            }
          },
          action: {
            type: "array"
          },
          items: referenceAction
        },
        required: [
          "id",
          "title",
          "timingDateTime",
          "code",
          "participant"
        ]
      }
    }
  },
  required: ["id", "title", "action"]
} as const satisfies JSONSchema
export type HistoryAction = FromSchema<typeof historyAction>
