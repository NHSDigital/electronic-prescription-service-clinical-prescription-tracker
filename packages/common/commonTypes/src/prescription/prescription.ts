import {PrescriptionStatusCoding} from "../schema"
import {SpineTreatmentTypeCode} from "../spine"

export interface PatientDetailsSummary {
  nhsNumber: string
  prefix?: string
  suffix?: string
  given?: string
  family?: string
}

export interface PrescriptionDetailsSummary {
  prescriptionId: string
  issueDate: string
  treatmentType: SpineTreatmentTypeCode
  maxRepeats?: number
}

export interface IssueDetails {
  issueNumber: number
  status: PrescriptionStatusCoding["code"]
  prescriptionPendingCancellation: boolean
  // itemsPendingCancellation?: boolean // prescription search only
}
