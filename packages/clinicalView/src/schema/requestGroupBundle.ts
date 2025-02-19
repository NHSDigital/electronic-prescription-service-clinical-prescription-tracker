import {FromSchema, JSONSchema} from "json-schema-to-ts"

// Reusable schemas
export const quantitySchema = {
  type: "object",
  description: "Represents a quantity with a value and unit of measurement.",
  properties: {
    value: {
      type: "integer",
      description: "The numeric value of the quantity."
    },
    unit: {
      type: "string",
      description: "The unit of measurement (e.g., tablet, mg)."
    }
  },
  required: ["value", "unit"],
  additionalProperties: false
} as const satisfies JSONSchema

export const referenceSchema = {
  type: "object",
  description: "A reference to another FHIR resource.",
  properties: {
    reference: {
      type: "string",
      description: "A reference to the ID of another FHIR resource."
    }
  },
  required: ["reference"],
  additionalProperties: false
} as const satisfies JSONSchema

export const codingSchema = {
  type: "object",
  description: "A coding system used to identify medical concepts.",
  properties: {
    system: {
      type: "string",
      description: "The coding system (e.g., SNOMED, ICD)."
    },
    code: {
      type: "string",
      description: "The code that represents a concept within the system."
    },
    display: {
      type: "string",
      description: "A human-readable display of the code."
    }
  },
  required: ["system", "code"],
  additionalProperties: false
} as const satisfies JSONSchema

export const codeableConceptSchema = {
  type: "object",
  description: "A concept that is represented by a set of coded values.",
  properties: {
    coding: {
      type: "array",
      description: "An array of coding elements representing the concept.",
      items: codingSchema
    }
  },
  required: ["coding"],
  additionalProperties: false
} as const satisfies JSONSchema

export const dosageInstructionSchema = {
  type: "object",
  description: "Instructions on how a medication should be taken by the patient.",
  properties: {
    text: {
      type: "string",
      description: "A free-text representation of the dosage instructions."
    }
  },
  required: ["text"],
  additionalProperties: false
} as const satisfies JSONSchema

export const medicationRequestSchema = {
  type: "object",
  description: "A request for a patient to be given a medication.",
  properties: {
    resourceType: {
      type: "string",
      enum: ["MedicationRequest"],
      description: "Indicates that this resource is a MedicationRequest."
    },
    id: {
      type: "string",
      description: "The unique identifier for this MedicationRequest."
    },
    intent: {
      type: "string",
      enum: ["order", "plan"],
      description: "The intent of the medication request (e.g., order or plan)."
    },
    status: {
      type: "string",
      enum: ["active", "completed"],
      description: "The current status of the medication request."
    },
    subject: referenceSchema,
    medicationCodeableConcept: codeableConceptSchema,
    dispenseRequest: {
      type: "object",
      description: "Details about the medication dispense request.",
      properties: {
        quantity: quantitySchema
      },
      required: ["quantity"],
      additionalProperties: false
    },
    dosageInstruction: {
      type: "array",
      description: "An array of dosage instructions for the medication.",
      items: dosageInstructionSchema
    }
  },
  required: ["resourceType", "intent", "status", "subject", "medicationCodeableConcept"],
  additionalProperties: false
} as const satisfies JSONSchema

export const requestGroupSchema = {
  type: "object",
  description: "A group of related requests intended to be acted upon together.",
  properties: {
    resourceType: {
      type: "string",
      enum: ["RequestGroup"],
      description: "Indicates that this resource is a RequestGroup."
    },
    id: {
      type: "string",
      description: "The unique identifier for this RequestGroup."
    },
    status: {
      type: "string",
      enum: ["active", "completed"],
      description: "The current status of the request group."
    },
    intent: {
      type: "string",
      enum: ["proposal"],
      description: "The intent of the request group (e.g., proposal)."
    },
    groupIdentifier: {
      type: "object",
      description: "An identifier that groups related requests together.",
      properties: {
        system: {
          type: "string",
          description: "The system that defines the identifier (e.g., FHIR URI)."
        },
        value: {
          type: "string",
          description: "The actual identifier value."
        }
      },
      required: ["system", "value"],
      additionalProperties: false
    },
    extension: {
      type: "array",
      description: "Contains additional information that is not part of the basic definition of the RequestGroup.",
      items: {
        type: "object",
        description: "An extension representing additional information.",
        properties: {
          url: {
            type: "string",
            description: "The URL that defines the extension."
          },
          valueString: {
            type: "string",
            description: "The status of the prescription."
          }
        }
      }
    }
  },
  required: ["resourceType", "status", "intent"],
  additionalProperties: false
} as const satisfies JSONSchema

export const taskSchema = {
  type: "object",
  description: "A task that represents a workflow step in fulfilling a request.",
  properties: {
    resourceType: {
      type: "string",
      enum: ["Task"],
      description: "Indicates that this resource is a Task."
    },
    id: {
      type: "string",
      description: "The unique identifier for this Task."
    },
    status: {
      type: "string",
      enum: ["completed"],
      description: "The current status of the Task."
    },
    intent: {
      type: "string",
      enum: ["order"],
      description: "The intent of the task (e.g., order)."
    },
    groupIdentifier: {
      type: "object",
      description: "An identifier that groups related tasks together.",
      properties: {
        system: {
          type: "string",
          description: "The system that defines the identifier."
        },
        value: {
          type: "string",
          description: "The actual identifier value."
        }
      },
      required: ["system", "value"],
      additionalProperties: false
    },
    authoredOn: {
      type: "string",
      format: "date-time",
      description: "The date and time the Task was authored."
    }
  },
  required: ["resourceType", "status", "intent"],
  additionalProperties: false
} as const satisfies JSONSchema

export const bundleEntrySchema = {
  type: "object",
  description: "Represents an entry in a FHIR bundle, containing one of the specified resource types.",
  properties: {
    RequestGroup: requestGroupSchema,
    MedicationRequest: medicationRequestSchema,
    Task: taskSchema
  },
  required: ["RequestGroup", "MedicationRequest", "Task"],
  additionalProperties: false
} as const satisfies JSONSchema

export const requestGroupBundleSchema = {
  type: "object",
  description: "A FHIR Bundle containing a RequestGroup and associated MedicationRequest resources.",
  properties: {
    resourceType: {
      type: "string",
      enum: ["Bundle"],
      description: "Indicates that this resource is a Bundle."
    },
    type: {
      type: "string",
      enum: ["collection"],
      description: "The type of FHIR Bundle (collection)."
    },
    entry: {
      type: "array",
      description: "An array of entries in the bundle, each containing a FHIR resource.",
      items: bundleEntrySchema
    }
  },
  required: ["resourceType", "type", "entry"],
  additionalProperties: false
} as const satisfies JSONSchema

export type requestGroupBundleType = FromSchema<typeof requestGroupBundleSchema>
