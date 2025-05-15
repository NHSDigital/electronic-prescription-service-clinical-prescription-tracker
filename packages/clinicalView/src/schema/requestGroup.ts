/* eslint-disable max-len */
import {FromSchema, JSONSchema} from "json-schema-to-ts"
import {
  requestGroupCommonProperties,
  prescriptionStatusExtension,
  medicationRepeatInformationExtension,
  pendingCancellationExtension,
  prescriptionTypeExtension,
  medicationRequest,
  medicationDispense,
  practitionerRole,
  taskBusinessStatus
} from "@cpt-common/common-types/schema"
import {patient} from "./patient"

const referenceAction = {
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

const historyAction = {
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
          timingDateTime: {/* TODO: changed to timingDatetime, examples seemed to use timingTiming with days supply info in it */
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
                {/* TODO: is this the right format? */
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

export const requestGroup = {
  type: "object",
  description: "A FHIR RequestGroup representing a prescription",
  properties: {
    ...requestGroupCommonProperties,
    id: {
      type: "string",
      description: "Logical id of this artifact"
    },
    author: {
      type: "object",
      description: "The ODS code of the organization that authored the prescription.",
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
      }
    },
    extension: {
      type: "array",
      description: "Additional information related to the prescription.",
      items: {
        oneOf: [
          prescriptionStatusExtension,
          medicationRepeatInformationExtension,
          pendingCancellationExtension,
          prescriptionTypeExtension
        ]
      }
    },
    action: {
      type: "array",
      items: {
        oneOf: [
          historyAction
        ]
      }
    },
    contained: {
      type: "array",
      items: {
        oneOf: [
          patient,
          practitionerRole,
          medicationRequest,
          medicationDispense
        ]
      }
    }
  },
  required: [
    "resourceType",
    "id",
    "identifier",
    "intent",
    "author",
    "authoredOn",
    "subject",
    "action",
    "contained"
  ]
} as const satisfies JSONSchema
export type RequestGroupType = FromSchema<typeof requestGroup>
