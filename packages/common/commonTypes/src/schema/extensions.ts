import {FromSchema, JSONSchema} from "json-schema-to-ts"

export const prescriptionStatusExtension = {
  type: "object",
  description: "The prescription status.",
  properties: {
    url: {
      type: "string",
      description: "Source of the definition for the extension code - a logical name or a URL.",
      enum: ["https://fhir.nhs.uk/StructureDefinition/Extension-EPS-PrescriptionStatusHistory"]
    },
    extension: {
      type: "array",
      description: "Additional content defined by implementations.",
      items: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "Source of the definition for the extension code - a logical name or a URL.",
            enum: ["status"]
          },
          valueCoding: {
            type: "object",
            description: "A reference to a code defined by a terminology system.",
            properties: {
              system: {
                type: "string",
                description: "Identity of the terminology system.",
                enum: ["https://fhir.nhs.uk/CodeSystem/EPS-task-business-status"]
              },
              code: {
                type: "string",
                description: "Symbol in syntax defined by the system.",
                enum: [
                  "0000",
                  "0001",
                  "0002",
                  "0003",
                  "0004",
                  "0005",
                  "0006",
                  "0007",
                  "0008",
                  "0009",
                  "9000",
                  "9001",
                  "9005"
                ]
              },
              display: {
                type: "string",
                description: "Representation defined by the system.",
                enum: [
                  "Awaiting Release Ready",
                  "To be Dispensed",
                  "With Dispenser",
                  "With Dispenser - Active",
                  "Expired",
                  "Cancelled",
                  "Dispensed",
                  "Not Dispensed",
                  "Claimed",
                  "No-Claimed",
                  "Repeat Dispense future instance",
                  "Prescription future instance",
                  "Cancelled future instance"
                ]
              }
            },
            required: ["system", "code", "display"]
          }
        },
        required: ["url", "valueCoding"]
      }
    }
  },
  required: ["url", "extension"]
} as const satisfies JSONSchema
export type PrescriptionStatusExtensionType = FromSchema<typeof prescriptionStatusExtension>
export type PrescriptionStatusCoding = PrescriptionStatusExtensionType["extension"][0]["valueCoding"]

export const medicationRepeatInformationExtension = {
  type: "object",
  description: "Medication repeat information.",
  properties: {
    url: {
      type: "string",
      enum: ["https://fhir.nhs.uk/StructureDefinition/Extension-EPS-RepeatInformation"]
    },
    extension: {
      type: "array",
      items: {
        oneOf: [
          {
            type: "object",
            properties: {
              url: {
                type: "string",
                enum: ["numberOfRepeatsAllowed"]
              },
              valueInteger: {type: "integer"}
            },
            required: ["url", "valueInteger"]
          },
          {
            type: "object",
            properties: {
              url: {
                type: "string",
                enum: ["numberOfRepeatsIssued"]
              },
              valueInteger: {type: "integer"}
            },
            required: ["url", "valueInteger"]
          }
        ]
      }
    }
  },
  required: ["url", "extension"]
} as const satisfies JSONSchema
export type MedicationRepeatInformationExtensionType = FromSchema<typeof medicationRepeatInformationExtension>

export const pendingCancellationExtension = {
  type: "object",
  description: "Pending cancellation information",
  properties: {
    url: {
      type: "string",
      description: "Source of the definition for the extension code - a logical name or a URL.",
      enum: ["https://fhir.nhs.uk/StructureDefinition/Extension-PendingCancellation"]
    },
    extension: {
      type: "array",
      description: "Additional content defined by implementations.",
      items: {
        oneOf: [
          {
            type: "object",
            description: "Source of the definition for the extension code - a logical name or a URL.",
            properties: {
              url: {
                type: "string",
                enum: ["prescriptionPendingCancellation"]
              },
              valueBoolean: {
                type: "boolean",
                description: "Value of 'true' or 'false'."
              }
            },
            required: ["url", "valueBoolean"]
          },
          {
            type: "object",
            description: "Source of the definition for the extension code - a logical name or a URL.",
            properties: {
              url: {
                type: "string",
                enum: ["lineItemPendingCancellation"]
              },
              valueBoolean: {
                type: "boolean",
                description: "Value of 'true' or 'false'."
              }
            },
            required: ["url", "valueBoolean"]
          }
        ]
      }
    }
  },
  required: ["url", "extension"]
} as const satisfies JSONSchema
export type PendingCancellationExtensionType = FromSchema<typeof pendingCancellationExtension>

export const prescriptionTypeExtension = {
  type: "object",
  properties: {
    url: {
      type: "string",
      enum: ["https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionType"]
    },
    valueCoding: {
      type: "object",
      properties: {
        system: {
          type: "string",
          enum: ["https://fhir.nhs.uk/CodeSystem/prescription-type"]
        },
        code: {
          type: "string",
          enum: [
            "0101",
            "0104",
            "0105",
            "0108",
            "0113",
            "0114",
            "0116",
            "0117",
            "0124",
            "0125",
            "1001",
            "1004",
            "1005",
            "1008",
            "1013",
            "1014",
            "1016",
            "1017",
            "1024",
            "1025",
            "0201",
            "0204",
            "0205",
            "0208",
            "0213",
            "0214",
            "0216",
            "0217",
            "0224",
            "0225",
            "2001",
            "2004",
            "2005",
            "2008",
            "2013",
            "2014",
            "2016",
            "2017",
            "2024",
            "2025",
            "0501",
            "0504",
            "0505",
            "0508",
            "0513",
            "0514",
            "0516",
            "0517",
            "0524",
            "0525",
            "5001",
            "5004",
            "5005",
            "5008",
            "5013",
            "5014",
            "5016",
            "5017",
            "5024",
            "5025"
          ]
        },
        display: {
          type: "string",
          enum: [
            "Primary Care Prescriber - Medical Prescriber",
            "Primary Care Prescriber - Nurse Independent/Supplementary prescriber",
            "Primary Care Prescriber - Community Practitioner Nurse prescriber",
            "Primary Care Prescriber - Pharmacist Independent/Supplementary prescriber",
            "Primary Care Prescriber - Optometrist Independent/Supplementary prescriber",
            "Primary Care Prescriber - Podiatrist/Chiropodist Independent/Supplementary prescriber",
            "Primary Care Prescriber - Radiographer Independent/Supplementary prescribe",
            "Primary Care Prescriber - Physiotherapist Independent/Supplementary prescriber",
            "Primary Care Prescriber - Dietician Supplementary prescriber",
            "Primary Care Prescriber - Paramedic Independent/Supplementary prescriber",
            "Outpatient Community Prescriber - Medical Prescriber",
            "Outpatient Community Prescriber - Nurse Independent/Supplementary prescribe",
            "Outpatient Community Prescriber - Community Practitioner Nurse prescriber",
            "Outpatient Community Prescriber - Pharmacist Independent/Supplementary prescribe",
            "Outpatient Community Prescriber - Optometrist Independent/Supplementary prescriber",
            "Outpatient Community Prescriber - Podiatrist/Chiropodist Independent/Supplementary",
            "Outpatient Community Prescriber - Radiographer Independent/Supplementary prescriber",
            "Outpatient Community Prescriber - Physiotherapist Independent/Supplementary prescriber",
            "Outpatient Community Prescriber - Dietician Supplementary prescriber",
            "Outpatient Community Prescriber - Paramedic Independent/Supplementary prescriber",
            "Primary Care Prescriber - Medical Prescriber (Wales)",
            "Primary Care Prescriber - Nurse Independent/Supplementary prescriber (Wales)",
            "Primary Care Prescriber - Community Practitioner Nurse prescriber (Wales)",
            "Primary Care Prescriber - Pharmacist Independent/Supplementary prescriber (Wales)",
            "Primary Care Prescriber - Optometrist Independent/Supplementary prescriber (Wales)",
            "Primary Care Prescriber - Podiatrist/Chiropodist Independent/Supplementary prescriber (Wales)",
            "Primary Care Prescriber - Radiographer Independent/Supplementary prescriber (Wales)",
            "Primary Care Prescriber - Physiotherapist Independent/Supplementary prescriber (Wales)",
            "Primary Care Prescriber - Dietician Supplementary prescriber (Wales)",
            "Primary Care Prescriber - Paramedic Independent/Supplementary prescriber (Wales)",
            "Outpatient Community Prescriber - Medical Prescriber (Wales)",
            "Outpatient Community Prescriber - Nurse Independent/Supplementary prescriber (Wales)",
            "Outpatient Community Prescriber - Community Practitioner Nurse prescriber (Wales)",
            "Outpatient Community Prescriber - Pharmacist Independent/Supplementary prescriber (Wales)",
            "Outpatient Community Prescriber - Optometrist Independent/Supplementary prescriber (Wales)",
            "Outpatient Community Prescriber - Podiatrist/Chiropodist Independent/Supplementary (Wales)",
            "Outpatient Community Prescriber - Radiographer Independent/Supplementary prescriber (Wales)",
            "Outpatient Community Prescriber - Physiotherapist Independent/Supplementary prescriber (Wales)",
            "Outpatient Community Prescriber - Dietician Supplementary prescriber (Wales)",
            "Outpatient Community Prescriber - Paramedic Independent/Supplementary prescriber (Wales)",
            "Primary Care Prescriber - Medical Prescriber (IOM)",
            "Primary Care Prescriber - Nurse Independent/Supplementary prescriber (IOM)",
            "Primary Care Prescriber - Community Practitioner Nurse prescriber (IOM)",
            "Primary Care Prescriber - Pharmacist Independent/Supplementary prescriber (IOM)",
            "Primary Care Prescriber - Optometrist Independent/Supplementary prescriber (IOM)",
            "Primary Care Prescriber - Podiatrist/Chiropodist Independent/Supplementary prescriber (IOM)",
            "Primary Care Prescriber - Radiographer Independent/Supplementary prescriber (IOM)",
            "Primary Care Prescriber - Physiotherapist Independent/Supplementary prescriber (IOM)",
            "Primary Care Prescriber - Dietician Supplementary prescriber (IOM)",
            "Primary Care Prescriber - Paramedic Independent/Supplementary prescriber (IOM)",
            "Outpatient Community Prescriber - Medical Prescriber (IOM)",
            "Outpatient Community Prescriber - Nurse Independent/Supplementary prescriber (IOM)",
            "Outpatient Community Prescriber - Community Practitioner Nurse prescriber (IOM)",
            "Outpatient Community Prescriber - Pharmacist Independent/Supplementary prescriber (IOM)",
            "Outpatient Community Prescriber - Optometrist Independent/Supplementary prescriber (IOM)",
            "Outpatient Community Prescriber - Podiatrist/Chiropodist Independent/Supplementary (IOM)",
            "Outpatient Community Prescriber - Radiographer Independent/Supplementary prescriber (IOM)",
            "Outpatient Community Prescriber - Physiotherapist Independent/Supplementary prescriber (IOM)",
            "Outpatient Community Prescriber - Dietician Supplementary prescriber (IOM)",
            "Outpatient Community Prescriber - Paramedic Independent/Supplementary prescriber (IOM)"
          ]
        }
      },
      required: ["system", "code", "display"]
    }
  },
  required: ["url", "valueCoding"]
} as const satisfies JSONSchema
export type PrescriptionTypeExtensionType = FromSchema<typeof prescriptionTypeExtension>
export type PrescriptionTypeCoding = PrescriptionTypeExtensionType["valueCoding"]

const dispenseStatus = {
  type: "object",
  properties: {
    url: {
      type: "string",
      enum: ["dispenseStatus"]
    },
    valueCoding: {
      type: "object",
      properties: {
        system: {
          type: "string",
          enum: ["https://fhir.nhs.uk/CodeSystem/medicationdispense-type"]
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
            "0008"
          ]
        },
        display: {
          type: "string",
          enum: [
            "Item fully dispensed",
            "Item not dispensed",
            "Item dispensed - partial",
            "Item not dispensed - owing",
            "Item Cancelled",
            "Expired",
            "Item to be dispensed",
            "Item with dispenser"
          ]
        }
      },
      required: ["system", "code", "display"]
    }
  },
  required: ["url", "valueCoding"]
} as const satisfies JSONSchema
export type DispenseStatusCoding = FromSchema<typeof dispenseStatus>["valueCoding"]

export const dispensingInformationExtension = {
  type: "object",
  properties: {
    url: {
      type: "string",
      enum: ["https://fhir.nhs.uk/StructureDefinition/Extension-EPS-DispensingInformation"]
    },
    extension: {
      type: "array",
      items: {
        oneOf: [
          dispenseStatus
        ]
      }
    }
  }
} as const satisfies JSONSchema
export type DispensingInformationExtensionType = FromSchema<typeof dispensingInformationExtension>
