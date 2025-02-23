import {FromSchema, JSONSchema} from "json-schema-to-ts"
import {patientSchema} from "./patientSchema"
import {medicationRequestSchema} from "./medicationRequestSchema"
import {medicationDispenseSchema} from "./medicationDispenseSchema"

export const requestGroupSchema = {
  type: "object",
  description: "A FHIR RequestGroup with associated contained resources.",
  properties: {
    resourceType: {type: "string", enum: ["RequestGroup"]},
    id: {type: "string"},
    identifier: {
      type: "array",
      items: {
        type: "object",
        properties: {
          system: {type: "string"},
          value: {type: "string"}
        },
        required: ["system", "value"]
      }
    },
    intent: {type: "string"},
    extension: {
      type: "array",
      items: {
        type: "object",
        properties: {
          url: {type: "string"},
          valueCoding: {
            type: "object",
            properties: {
              system: {type: "string"},
              code: {type: "string"},
              display: {type: "string"}
            },
            required: ["system", "code"]
          },
          valueInteger: {type: "integer"},
          valueBoolean: {type: "boolean"},
          extension: {
            type: "array",
            items: {
              type: "object",
              properties: {
                url: {type: "string"},
                valueInteger: {type: "integer"},
                valueBoolean: {type: "boolean"},
                valueCoding: {
                  type: "object",
                  properties: {
                    system: {type: "string"},
                    code: {type: "string"},
                    display: {type: "string"}
                  },
                  required: ["system", "code"]
                }
              },
              required: ["url"]
            }
          }
        },
        required: ["url"]
      }
    },
    author: {
      type: "object",
      properties: {
        identifier: {
          type: "object",
          properties: {
            system: {type: "string"},
            value: {type: "string"}
          },
          required: ["system", "value"]
        }
      }
    },
    authoredOn: {type: "string", format: "date-time"},
    subject: {
      type: "object",
      properties: {
        reference: {type: "string"}
      }
    },
    action: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {type: "string"},
          timingTiming: {
            type: "object",
            properties: {
              event: {type: "array", items: {type: "string", format: "date-time"}},
              repeat: {
                type: "object",
                properties: {
                  frequency: {type: "integer"},
                  period: {type: "integer"},
                  periodUnit: {type: "string"}
                },
                required: ["frequency", "period", "periodUnit"]
              }
            }
          },
          timingDateTime: {type: "string", format: "date-time"},
          participant: {
            type: "object",
            properties: {
              identifier: {
                type: "object",
                properties: {
                  system: {type: "string"},
                  value: {type: "string"}
                },
                required: ["system", "value"]
              }
            }
          },
          code: {
            type: "array",
            items: {
              type: "object",
              properties: {
                coding: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      system: {type: "string"},
                      code: {type: "string"},
                      display: {type: "string"}
                    },
                    required: ["system", "code"]
                  }
                }
              }
            }
          },
          action: {
            type: "array",
            items: {
              type: "object",
              properties: {
                resource: {
                  type: "object",
                  properties: {
                    reference: {type: "string"}
                  },
                  required: ["reference"]
                }
              }
            }
          }
        },
        required: ["title"]
      }
    },
    contained: {
      type: "array",
      items: {
        anyOf: [
          patientSchema,
          {
            type: "array",
            items: medicationRequestSchema,
            minItems: 1,
            maxItems: 5
          },
          {
            type: "array",
            items: medicationDispenseSchema,
            minItems: 0
          }
        ]
      },
      minItems: 2
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
  ],
  additionalProperties: false
} as const satisfies JSONSchema

export type requestGroupBundleType = FromSchema<typeof requestGroupSchema>
