import {JSONSchema, FromSchema} from "json-schema-to-ts"

export const patientSchema = {
  type: "object",
  properties: {
    resourceType: {type: "string", enum: ["Patient"]},
    id: {type: "string"},
    identifier: {
      type: "array",
      description: "An identifier for this patient.",
      items: {
        type: "object",
        properties: {
          system: {type: "string", enum: ["https://fhir.nhs.uk/Id/nhs-number"]},
          value: {type: "string"}
        },
        required: ["system", "value"]
      },
      minItems: 1,
      maxItems: 1
    },
    name: {
      type: "array",
      description: "A name associated with the patient.",
      items: {
        type: "object",
        description: "Name of a human - parts and usage.",
        properties: {
          prefix: {type: "array", items: {type: "string"}},
          suffix: {type: "array", items: {type: "string"}},
          given: {type: "array", items: {type: "string"}},
          family: {type: "string"}
        }
      },
      minItems: 1,
      maxItems: 1
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
          type: {type: "string", enum: ["both"]},
          use: {type: "string", enum: ["home"]}
        },
        required: ["line", "text", "type", "use"]
      }
    }
  },
  required: ["resourceType", "id", "identifier", "name", "gender", "birthDate"],
  additionalProperties: false
} as const satisfies JSONSchema

export type PatientType = FromSchema<typeof patientSchema>
