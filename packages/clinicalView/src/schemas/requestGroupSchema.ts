import {FromSchema, JSONSchema} from "json-schema-to-ts"
import {patientSchema} from "./patientSchema"
import {medicationRequestSchema} from "./medicationRequestSchema"
import {medicationDispenseSchema} from "./medicationDispenseSchema"

const actionCommonProperties = {
  participant: {
    type: "array",
    items: {
      type: "object",
      properties: {
        identifier: {
          type: "object",
          properties: {
            system: {type: "string", enum: ["https://fhir.nhs.uk/Id/ods-organization-code"]},
            value: {type: "string"}
          },
          required: ["system", "value"]
        }
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
  }
} as const satisfies Readonly<Record<string, JSONSchema>>

const requestGroupActionSchema = {
  oneOf: [
    {
      type: "object",
      properties: {
        title: {type: "string", enum: ["Prescription upload successful"]},
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
        ...actionCommonProperties,
        action: {
          type: "array",
          description: "References to the MedicationRequests created in this prescription.",
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
      required: ["title", "timingTiming", "participant", "code", "action"]
    },
    {
      type: "object",
      properties: {
        title: {type: "string"},
        timingDateTime: {type: "string", format: "date-time"},
        ...actionCommonProperties,
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
      required: ["title", "timingDateTime", "participant", "code"]
    }
  ]
} as const satisfies JSONSchema

export const requestGroupSchema = {
  type: "object",
  description: "A FHIR RequestGroup representing a prescription.",
  properties: {
    resourceType: {type: "string", enum: ["RequestGroup"]},
    id: {type: "string"},
    identifier: {
      description: "The short form prescription ID.",
      type: "array",
      items: {
        type: "object",
        properties: {
          system: {type: "string", enum: ["https://fhir.nhs.uk/Id/prescription-order-number"]},
          value: {type: "string"}
        },
        required: ["system", "value"]
      }
    },
    intent: {
      description: "Whether the prescription is an acute, repeat, or eRD.",
      type: "string"
    },
    extension: {
      type: "array",
      description: "Additional information related to the prescription.",
      items: {
        oneOf: [
          {
            type: "object",
            properties: {
              url: {type: "string", enum: ["https://fhir.nhs.uk/StructureDefinition/Extension-EPS-RepeatInformation"]},
              extension: {
                type: "array",
                items: {
                  oneOf: [
                    {
                      type: "object",
                      properties: {
                        url: {type: "string", enum: ["numberOfRepeatsAllowed"]},
                        valueInteger: {type: "integer"}
                      },
                      required: ["url", "valueInteger"]
                    },
                    {
                      type: "object",
                      properties: {
                        url: {type: "string", enum: ["numberOfRepeatsIssued"]},
                        valueInteger: {type: "integer"}
                      },
                      required: ["url", "valueInteger"]
                    }
                  ]
                }
              }
            },
            required: ["url", "extension"]
          },
          {
            type: "object",
            properties: {
              url: {
                type: "string",
                enum: ["https://fhir.nhs.uk/StructureDefinition/Extension-EPS-PendingCancellations"]
              },
              extension: {
                type: "array",
                items: {
                  oneOf: [
                    {
                      type: "object",
                      properties: {
                        url: {type: "string", enum: ["prescriptionPendingCancellation"]},
                        valueBoolean: {type: "boolean"}
                      },
                      required: ["url", "valueBoolean"]
                    },
                    {
                      type: "object",
                      properties: {
                        url: {type: "string", enum: ["lineItemPendingCancellation"]},
                        valueBoolean: {type: "boolean"}
                      },
                      required: ["url", "valueBoolean"]
                    }
                  ]
                }
              }
            },
            required: ["url", "extension"]
          },
          {
            type: "object",
            properties: {
              url: {
                type: "string",
                enum: ["https://fhir.nhs.uk/StructureDefinition/Extension-EPS-PrescriptionStatusHistory"]
              },
              extension: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    url: {type: "string", enum: ["status"]},
                    valueCoding: {
                      type: "object",
                      properties: {
                        system: {type: "string", enum: ["https://fhir.nhs.uk/CodeSystem/EPS-task-business-status"]},
                        code: {type: "string"},
                        display: {type: "string"}
                      },
                      required: ["system", "code", "display"]
                    }
                  },
                  required: ["url", "valueCoding"]
                }
              }
            },
            required: ["url", "extension"]
          },
          {
            type: "object",
            properties: {
              url: {type: "string", enum: ["https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionType"]},
              valueCoding: {
                type: "object",
                properties: {
                  system: {type: "string", enum: ["https://fhir.nhs.uk/CodeSystem/prescription-type"]},
                  code: {type: "string"},
                  display: {type: "string"}
                },
                required: ["system", "code", "display"]
              }
            },
            required: ["url", "valueCoding"]
          }
        ]
      }
    },
    author: {
      type: "object",
      description: "The ODS code of the organization that authored the prescription.",
      properties: {
        identifier: {
          type: "object",
          properties: {
            system: {type: "string", enum: ["https://fhir.nhs.uk/Id/ods-organization-code"]},
            value: {type: "string"}
          },
          required: ["system", "value"]
        }
      }
    },
    authoredOn: {
      description: "The date the prescription was created.",
      type: "string",
      format: "date-time"
    },
    subject: {
      type: "object",
      description: "A reference to the patient the prescription is for.",
      properties: {
        reference: {type: "string"}
      },
      required: ["reference"]
    },
    action: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {type: "string", enum: ["Prescription status transitions"]},
          action: {
            type: "array",
            items: requestGroupActionSchema
          }
        },
        required: ["title", "action"]
      }
    },
    contained: {
      type: "array",
      items: {
        oneOf: [
          patientSchema,
          medicationRequestSchema,
          medicationDispenseSchema
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
  ],
  additionalProperties: false
} as const satisfies JSONSchema

export type requestGroupType = FromSchema<typeof requestGroupSchema>
