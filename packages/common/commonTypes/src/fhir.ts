import {Patient, RequestGroup} from "fhir/r4"

interface IntentMap {
  [key: string]: RequestGroup["intent"]
}

enum TreatmentType {
  ACUTE = "0001",
  REPEAT = "0002",
  ERD = "0003"
}

export const INTENT_MAP: IntentMap = {
  [TreatmentType.ACUTE]: "order",
  [TreatmentType.REPEAT]: "instance-order",
  [TreatmentType.ERD] : "reflex-order"
} as const

// TODO: should this live in spine types?
export interface GenderMap {
  [key: string]: Patient["gender"]
}
export const GENDER_MAP: GenderMap = {
  1 : "male",
  2 : "female",
  3 : "other",
  4 : "unknown"
} as const
