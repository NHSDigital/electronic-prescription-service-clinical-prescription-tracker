import {JSONSchema} from "json-schema-to-ts"

export const patientSchema = {
  type: "object",
  properties: {
    resourceType: {type: "string", enum: ["Patient"]},
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
    name: {
      type: "array",
      items: {
        type: "object",
        properties: {
          prefix: {type: "array", items: {type: "string"}},
          suffix: {type: "array", items: {type: "string"}},
          given: {type: "array", items: {type: "string"}},
          family: {type: "string"}
        }
      }
    },
    gender: {
      type: "string",
      enum: ["male", "female", "other", "unknown"]
    },
    birthDate: {type: "string", format: "date"},
    address: {
      type: "array",
      items: {
        type: "object",
        properties: {
          line: {type: "array", items: {type: "string"}},
          city: {type: "string"},
          district: {type: "string"},
          postalCode: {type: "string"},
          text: {type: "string"},
          type: {type: "string"},
          use: {
            type: "string",
            enum: ["home", "work", "temp", "old", "billing"]
          }
        }
      }
    }
  },
  required: ["resourceType", "id", "identifier", "name", "gender", "birthDate"],
  additionalProperties: false
} as const satisfies JSONSchema
