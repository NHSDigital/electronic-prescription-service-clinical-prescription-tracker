import {FromSchema, JSONSchema} from "json-schema-to-ts"

// Reusable schemas
export const quantitySchema = {
  "type": "object",
  "properties": {
    "value": {
      "type": "integer",
      "description": "The quantity value."
    },
    "unit": {
      "type": "string",
      "description": "The unit of measurement (e.g., tablet, mg)."
    }
  },
  "required": ["value", "unit"],
  "additionalProperties": false
} as const satisfies JSONSchema

export const periodSchema = {
  "type": "object",
  "properties": {
    "start": {
      "type": "string",
      "format": "date-time",
      "description": "The start date of the period."
    },
    "end": {
      "type": "string",
      "format": "date-time",
      "description": "The end date of the period."
    }
  },
  "required": ["start", "end"],
  "additionalProperties": false
} as const satisfies JSONSchema

export const durationSchema = {
  "type": "object",
  "properties": {
    "value": {
      "type": "integer",
      "description": "The value of the duration."
    },
    "unit": {
      "type": "string",
      "enum": ["days"],
      "description": "The unit of duration (e.g., days)."
    }
  },
  "required": ["value", "unit"],
  "additionalProperties": false
} as const satisfies JSONSchema

export const codingSchema = {
  "type": "object",
  "properties": {
    "system": {
      "type": "string",
      "description": "The coding system (e.g., SNOMED, ICD)."
    },
    "code": {
      "type": "string",
      "description": "The code of the concept."
    },
    "display": {
      "type": "string",
      "description": "The human-readable display of the code."
    }
  },
  "required": ["system", "code"],
  "additionalProperties": false
} as const satisfies JSONSchema

export const codeableConceptSchema = {
  "type": "object",
  "properties": {
    "coding": {
      "type": "array",
      "items": codingSchema
    }
  },
  "required": ["coding"],
  "additionalProperties": false
} as const satisfies JSONSchema

export const referenceSchema = {
  "type": "object",
  "properties": {
    "reference": {
      "type": "string",
      "description": "A reference to another resource."
    }
  },
  "required": ["reference"],
  "additionalProperties": false
} as const satisfies JSONSchema

export const timingRepeatSchema = {
  "type": "object",
  "properties": {
    "frequency": {
      "type": "integer",
      "description": "The number of times the dosage is repeated."
    },
    "period": {
      "type": "integer",
      "description": "The period between dosages."
    },
    "periodUnit": {
      "type": "string",
      "enum": ["d", "h"],
      "description": "The unit of the period (days or hours)."
    }
  },
  "required": ["frequency", "period", "periodUnit"],
  "additionalProperties": false
} as const satisfies JSONSchema

export const timingSchema = {
  "type": "object",
  "properties": {
    "repeat": timingRepeatSchema
  },
  "required": ["repeat"],
  "additionalProperties": false
} as const satisfies JSONSchema

export const dosageInstructionSchema = {
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "description": "The dosage instructions text."
    },
    "timing": timingSchema,
    "doseQuantity": quantitySchema
  },
  "required": ["text", "timing", "doseQuantity"],
  "additionalProperties": false
} as const satisfies JSONSchema

export const medicationRequestSchema = {
  "type": "object",
  "properties": {
    "resourceType": {
      "type": "string",
      "enum": ["MedicationRequest"],
      "description": "FHIR Resource Type for MedicationRequest."
    },
    "id": {
      "type": "string",
      "description": "The unique identifier for the MedicationRequest."
    },
    "identifier": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "system": {
            "type": "string",
            "description": "The identifier system (e.g., FHIR URI, SNOMED)."
          },
          "value": {
            "type": "string",
            "description": "The identifier value."
          }
        },
        "required": ["system", "value"],
        "additionalProperties": false
      },
      "description": "A set of identifiers assigned to this medication request."
    },
    "status": {
      "type": "string",
      "enum": ["active", "completed", "entered-in-error", "on-hold"],
      "description": "The status of the MedicationRequest."
    },
    "intent": {
      "type": "string",
      "enum": ["order", "plan", "filler-order", "reflex-order"],
      "description": "The intent of the medication request."
    },
    "medicationCodeableConcept": codeableConceptSchema,
    "subject": referenceSchema,
    "authoredOn": {
      "type": "string",
      "format": "date-time",
      "description": "The date the MedicationRequest was authored."
    },
    "requester": referenceSchema,
    "dosageInstruction": {
      "type": "array",
      "items": dosageInstructionSchema
    },
    "dispenseRequest": {
      "type": "object",
      "properties": {
        "validityPeriod": periodSchema,
        "quantity": quantitySchema,
        "expectedSupplyDuration": durationSchema
      },
      "required": ["validityPeriod", "quantity", "expectedSupplyDuration"],
      "additionalProperties": false
    }
  },
  "required": ["resourceType", "status", "intent", "medicationCodeableConcept", "subject"],
  "additionalProperties": false
} as const satisfies JSONSchema

export const requestGroupSchema = {
  "type": "object",
  "properties": {
    "resourceType": {
      "type": "string",
      "enum": ["RequestGroup"],
      "description": "FHIR Resource Type for RequestGroup."
    },
    "id": {
      "type": "string",
      "description": "The unique identifier for the RequestGroup."
    },
    "identifier": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "system": {
            "type": "string",
            "description": "The identifier system (e.g., FHIR URI, SNOMED)."
          },
          "value": {
            "type": "string",
            "description": "The identifier value."
          }
        },
        "required": ["system", "value"],
        "additionalProperties": false
      },
      "description": "A set of identifiers assigned to this request group."
    },
    "status": {
      "type": "string",
      "enum": ["draft", "active", "completed", "entered-in-error"],
      "description": "The status of the request group."
    },
    "intent": {
      "type": "string",
      "enum": ["order", "plan", "filler-order", "reflex-order"],
      "description": "The intent of the request group."
    }
  },
  "required": ["resourceType", "id", "status", "intent"],
  "additionalProperties": false
} as const satisfies JSONSchema

export const bundleEntrySchema = {
  "type": "object",
  "properties": {
    "resource": {
      "oneOf": [
        requestGroupSchema,
        medicationRequestSchema
      ]
    }
  },
  "required": ["resource"],
  "additionalProperties": false
} as const satisfies JSONSchema

export const requestGroupBundleSchema = {
  "type": "object",
  "properties": {
    "resourceType": {
      "type": "string",
      "enum": ["Bundle"],
      "description": "The type of FHIR resource."
    },
    "type": {
      "type": "string",
      "enum": ["collection"],
      "description": "The type of the Bundle."
    },
    "entry": {
      "type": "array",
      "items": bundleEntrySchema,
      "description": "An array of entries in the bundle."
    }
  },
  "required": ["resourceType", "type", "entry"],
  "additionalProperties": false
} as const satisfies JSONSchema

export type requestGroupBundleType = FromSchema<typeof requestGroupBundleSchema>
