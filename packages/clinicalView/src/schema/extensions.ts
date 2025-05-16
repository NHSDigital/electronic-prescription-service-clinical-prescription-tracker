import {taskBusinessStatus} from "@cpt-common/common-types/schema"
import {FromSchema, JSONSchema} from "json-schema-to-ts"
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

export const performerSiteTypeExtension = {
  type: "object",
  properties: {
    url: {
      type: "string",
      enum: ["https://fhir.nhs.uk/StructureDefinition/Extension-DM-PerformerSiteType"]
    },
    valueCoding: {
      type: "object",
      properties: {
        system: {
          type: "string",
          enum: ["https://fhir.nhs.uk/CodeSystem/dispensing-site-preference"]
        },
        code: {
          type: "string",
          enum: [
            "P1",
            "P2",
            "P3",
            "0004"
          ]
        },
        display: {
          type: "string",
          enum: [
            "Other (e.g. Community Pharmacy)",
            "Appliance Contractor",
            "Dispensing Doctor",
            "None"
          ]
        }
      },
      required: ["system", "code", "display"]
    }
  },
  required: ["url", "valueCoding"]
} as const satisfies JSONSchema
export type PerformerSiteTypeExtensionType = FromSchema<typeof performerSiteTypeExtension>
export type PerformerSiteTypeCoding = PerformerSiteTypeExtensionType["valueCoding"]

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
      items: dispenseStatus
    }
  },
  required: ["url", "extension"]
} as const satisfies JSONSchema
export type DispensingInformationExtensionType = FromSchema<typeof dispensingInformationExtension>

export const taskBusinessStatusExtension = {
  type: "object",
  description: "The prescription status.",
  properties: {
    url: {
      type: "string",
      enum: ["https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus"]
    },
    valueCoding: taskBusinessStatus
  }
} as const satisfies JSONSchema
export type TaskBusinessStatusExtensionType = FromSchema<typeof taskBusinessStatusExtension>
