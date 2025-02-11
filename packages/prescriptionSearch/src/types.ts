type XmlStringValue = {
  "@_value": string
}

interface XmlIssueDetail {
  instanceNumber: XmlStringValue
  prescriptionStatus: XmlStringValue
  prescCancPending: XmlStringValue
  liCancPending: XmlStringValue
}

export interface XmlPrescription {
  id: XmlStringValue
  patientId: XmlStringValue
  prefix: XmlStringValue
  suffix: XmlStringValue
  given: XmlStringValue
  family: XmlStringValue
  issueDetail: XmlIssueDetail | Array<XmlIssueDetail>
  prescribedDate: XmlStringValue
  prescriptionTreatmentType: XmlStringValue
  maxRepeats: XmlStringValue
}

export interface PatientDetails {
  nhsNumber: string
  prefix: string
  suffix: string
  given: string
  family: string
}

export interface PrescriptionDetails {
  prescriptionId: string
  prescriptionType: "acute" | "repeat" | "erd"
  issueDate: string
  treatmentType: string
  maxRepeats: number | null
}

export interface IssueDetails {
  issueNumber: number
  status: string
  prescriptionPendingCancellation: boolean
  itemsPendingCancellation: boolean

}

export type Prescription = PatientDetails & PrescriptionDetails & IssueDetails

export type PrescriptionSearchResults = Array<Prescription>
