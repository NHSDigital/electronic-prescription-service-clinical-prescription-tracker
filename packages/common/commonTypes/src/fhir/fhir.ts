import {ClinicalViewPatientType, ClinicalViewRequestGroupType, PrescriptionStatusCoding} from "../schema"
import {SpineGenderCode} from "../spine"

type TreatmentTypeCode = "0001" | "0002" | "0003" // TODO: move to spine?

enum TreatmentType {
  ACUTE = "0001",
  REPEAT = "0002",
  ERD = "0003"
}

export const INTENT_MAP: Record<TreatmentTypeCode, ClinicalViewRequestGroupType["intent"]> = {
  [TreatmentType.ACUTE]: "order",
  [TreatmentType.REPEAT]: "instance-order",
  [TreatmentType.ERD] : "reflex-order"
} as const

export const GENDER_MAP: Record<SpineGenderCode, ClinicalViewPatientType["gender"]> = {
  1 : "male",
  2 : "female",
  3 : "other",
  4 : "unknown"
} as const

export const PRESCRIPTION_STATUS_MAP: Record<PrescriptionStatusCoding["code"], PrescriptionStatusCoding["display"]> = {
  "0001": "To be Dispensed",
  "0002": "With Dispenser",
  "0003": "With Dispenser - Active",
  "0004": "Expired",
  "0005": "Cancelled",
  "0006": "Dispensed",
  "0007": "Not Dispensed",
  "0008": "Claimed",
  "0009": "No-Claimed",
  "9000": "Repeat Dispense future instance",
  "9001": "Prescription future instance",
  "9005": "Cancelled future instance"
} as const
