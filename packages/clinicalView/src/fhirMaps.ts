import {TreatmentType} from "@cpt-common/common-types/fhir"
import {SpineTreatmentTypeCode} from "@cpt-common/common-types/spine"
import {SpineGenderCode} from "./parseSpineResponse"
import {PerformerSiteTypeCoding, PrescriptionTypeCoding} from "./schema/extensions"
import {CourseOfTherapyTypeCoding, MedicationRequestStatusType, StatusReasonCoding} from "./schema/medicationRequest"
import {GenderType} from "./schema/patient"
import {DispenseStatusCoding} from "./schema/elements"

export const GENDER_MAP: Record<SpineGenderCode, GenderType> = {
  1 : "male",
  2 : "female",
  3 : "other",
  4 : "unknown"
} as const

export const PRESCRIPTION_TYPE_MAP: Record<PrescriptionTypeCoding["code"], PrescriptionTypeCoding["display"]>= {
  "0101": "Primary Care Prescriber - Medical Prescriber",
  "0104": "Primary Care Prescriber - Nurse Independent/Supplementary prescriber",
  "0105": "Primary Care Prescriber - Community Practitioner Nurse prescriber",
  "0108": "Primary Care Prescriber - Pharmacist Independent/Supplementary prescriber",
  "0113": "Primary Care Prescriber - Optometrist Independent/Supplementary prescriber",
  "0114": "Primary Care Prescriber - Podiatrist/Chiropodist Independent/Supplementary prescriber",
  "0116": "Primary Care Prescriber - Radiographer Independent/Supplementary prescribe",
  "0117": "Primary Care Prescriber - Physiotherapist Independent/Supplementary prescriber",
  "0124": "Primary Care Prescriber - Dietician Supplementary prescriber",
  "0125": "Primary Care Prescriber - Paramedic Independent/Supplementary prescriber",
  "1001": "Outpatient Community Prescriber - Medical Prescriber",
  "1004": "Outpatient Community Prescriber - Nurse Independent/Supplementary prescribe",
  "1005": "Outpatient Community Prescriber - Community Practitioner Nurse prescriber",
  "1008": "Outpatient Community Prescriber - Pharmacist Independent/Supplementary prescribe",
  "1013": "Outpatient Community Prescriber - Optometrist Independent/Supplementary prescriber",
  "1014": "Outpatient Community Prescriber - Podiatrist/Chiropodist Independent/Supplementary",
  "1016": "Outpatient Community Prescriber - Radiographer Independent/Supplementary prescriber",
  "1017": "Outpatient Community Prescriber - Physiotherapist Independent/Supplementary prescriber",
  "1024": "Outpatient Community Prescriber - Dietician Supplementary prescriber",
  "1025": "Outpatient Community Prescriber - Paramedic Independent/Supplementary prescriber",
  "0201": "Primary Care Prescriber - Medical Prescriber (Wales)",
  "0204": "Primary Care Prescriber - Nurse Independent/Supplementary prescriber (Wales)",
  "0205": "Primary Care Prescriber - Community Practitioner Nurse prescriber (Wales)",
  "0208": "Primary Care Prescriber - Pharmacist Independent/Supplementary prescriber (Wales)",
  "0213": "Primary Care Prescriber - Optometrist Independent/Supplementary prescriber (Wales)",
  "0214": "Primary Care Prescriber - Podiatrist/Chiropodist Independent/Supplementary prescriber (Wales)",
  "0216": "Primary Care Prescriber - Radiographer Independent/Supplementary prescriber (Wales)",
  "0217": "Primary Care Prescriber - Physiotherapist Independent/Supplementary prescriber (Wales)",
  "0224": "Primary Care Prescriber - Dietician Supplementary prescriber (Wales)",
  "0225": "Primary Care Prescriber - Paramedic Independent/Supplementary prescriber (Wales)",
  "2001": "Outpatient Community Prescriber - Medical Prescriber (Wales)",
  "2004": "Outpatient Community Prescriber - Nurse Independent/Supplementary prescriber (Wales)",
  "2005": "Outpatient Community Prescriber - Community Practitioner Nurse prescriber (Wales)",
  "2008": "Outpatient Community Prescriber - Pharmacist Independent/Supplementary prescriber (Wales)",
  "2013": "Outpatient Community Prescriber - Optometrist Independent/Supplementary prescriber (Wales)",
  "2014": "Outpatient Community Prescriber - Podiatrist/Chiropodist Independent/Supplementary (Wales)",
  "2016": "Outpatient Community Prescriber - Radiographer Independent/Supplementary prescriber (Wales)",
  "2017": "Outpatient Community Prescriber - Physiotherapist Independent/Supplementary prescriber (Wales)",
  "2024": "Outpatient Community Prescriber - Dietician Supplementary prescriber (Wales)",
  "2025": "Outpatient Community Prescriber - Paramedic Independent/Supplementary prescriber (Wales)",
  "0501": "Primary Care Prescriber - Medical Prescriber (IOM)",
  "0504": "Primary Care Prescriber - Nurse Independent/Supplementary prescriber (IOM)",
  "0505": "Primary Care Prescriber - Community Practitioner Nurse prescriber (IOM)",
  "0508": "Primary Care Prescriber - Pharmacist Independent/Supplementary prescriber (IOM)",
  "0513": "Primary Care Prescriber - Optometrist Independent/Supplementary prescriber (IOM)",
  "0514": "Primary Care Prescriber - Podiatrist/Chiropodist Independent/Supplementary prescriber (IOM)",
  "0516": "Primary Care Prescriber - Radiographer Independent/Supplementary prescriber (IOM)",
  "0517": "Primary Care Prescriber - Physiotherapist Independent/Supplementary prescriber (IOM)",
  "0524": "Primary Care Prescriber - Dietician Supplementary prescriber (IOM)",
  "0525": "Primary Care Prescriber - Paramedic Independent/Supplementary prescriber (IOM)",
  "5001": "Outpatient Community Prescriber - Medical Prescriber (IOM)",
  "5004": "Outpatient Community Prescriber - Nurse Independent/Supplementary prescriber (IOM)",
  "5005": "Outpatient Community Prescriber - Community Practitioner Nurse prescriber (IOM)",
  "5008": "Outpatient Community Prescriber - Pharmacist Independent/Supplementary prescriber (IOM)",
  "5013": "Outpatient Community Prescriber - Optometrist Independent/Supplementary prescriber (IOM)",
  "5014": "Outpatient Community Prescriber - Podiatrist/Chiropodist Independent/Supplementary (IOM)",
  "5016": "Outpatient Community Prescriber - Radiographer Independent/Supplementary prescriber (IOM)",
  "5017": "Outpatient Community Prescriber - Physiotherapist Independent/Supplementary prescriber (IOM)",
  "5024": "Outpatient Community Prescriber - Dietician Supplementary prescriber (IOM)",
  "5025": "Outpatient Community Prescriber - Paramedic Independent/Supplementary prescriber (IOM)"
}

export const LINE_ITEM_STATUS_MAP: Record<DispenseStatusCoding["code"], DispenseStatusCoding["display"]> = {
  "0001": "Item fully dispensed",
  "0002": "Item not dispensed",
  "0003": "Item dispensed - partial",
  "0004": "Item not dispensed - owing",
  "0005": "Item Cancelled",
  "0006": "Expired",
  "0007": "Item to be dispensed",
  "0008": "Item with dispenser"
} as const

export const LINE_ITEM_STATUS_REASON_MAP:Record<StatusReasonCoding["display"], StatusReasonCoding["code"]> = {
  "Prescribing Error": "0001",
  "Clinical contra-indication": "0002",
  "Change to medication treatment regime": "0003",
  "Clinical grounds": "0004",
  "At the Patients request": "0005",
  "At the Pharmacists request": "0006",
  "Notification of Death": "0007",
  "Patient deducted - other reason": "0008",
  "Patient deducted - registered with new practice": "0009"
} as const

export const MEDICATION_REQUEST_STATUS_MAP: Record<DispenseStatusCoding["code"], MedicationRequestStatusType> = {
  "0001": "completed",
  "0002": "stopped",
  "0003": "active",
  "0004": "active",
  "0005": "cancelled",
  "0006": "stopped",
  "0007": "active",
  "0008": "active"
}

export const COURSE_OF_THERAPY_TYPE_MAP: Record<SpineTreatmentTypeCode,
  {code: CourseOfTherapyTypeCoding["code"], display: CourseOfTherapyTypeCoding["display"]}> = {
    [TreatmentType.ACUTE]: {code: "acute", display: "Short course (acute) therapy"},
    [TreatmentType.REPEAT]: {code: "continuous", display: "Continuous long term therapy"},
    [TreatmentType.ERD]: {code: "continuous-repeat-dispensing", display: "Continuous long term (repeat dispensing)"}
  }

export const PERFORMER_SITE_TYPE_MAP: Record<PerformerSiteTypeCoding["code"], PerformerSiteTypeCoding["display"]> = {
  "P1": "Other (e.g. Community Pharmacy)",
  "P2": "Appliance Contractor",
  "P3": "Dispensing Doctor",
  "0004": "None"
}
