import {
  DispenseStatusCoding,
  PerformerSiteTypeCoding,
  PrescriptionStatusCoding,
  PrescriptionTypeCoding,
  StatusReasonCoding
} from "../schema"
import {SpineGenderCode, SpineTreatmentTypeCode} from "../spine"

export interface PatientDetailsSummary {
  nhsNumber: string
  prefix?: string
  suffix?: string
  given?: string
  family?: string
}

export interface PatientDetails extends PatientDetailsSummary {
  birthDate: string
  gender?: SpineGenderCode
  address: {
    line: Array<string>
    postalCode?: string
  }
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
  itemsPendingCancellation?: boolean // TODO: Only needed for prescription search?
}

export interface LineItemDetailsSummary {
  lineItemNo: string
  status: DispenseStatusCoding["code"]
  itemName: string
  quantity: number
  quantityForm: string
  dosageInstruction?: string
}

export interface LineItemDetails extends LineItemDetailsSummary {
  lineItemId: string
  cancellationReason?: StatusReasonCoding["display"]
  pendingCancellation: boolean
}

export interface DispenseNotificationDetails {
  dispenseNotificationId: string
  timestamp: string
  status: PrescriptionStatusCoding["code"]
  lineItems: {
    [key: string]: LineItemDetailsSummary
  }
}

export interface EventLineItem {
  lineItemNo: string
  newStatus: string
  cancellationReason?: StatusReasonCoding["display"]
}

export interface HistoryEventDetails {
  eventId: string
  message: string
  messageId: string
  timestamp: string
  org: string
  newStatus: string
  cancellationReason?: StatusReasonCoding["display"]
  isDispenseNotification: boolean,
  lineItems: {
    [key: string]: EventLineItem
  }
}

export interface PrescriptionDetails extends PrescriptionDetailsSummary, IssueDetails {
  daysSupply?: number
  prescriptionType: PrescriptionTypeCoding["code"]
  prescriberOrg: string
  nominatedDispenserOrg?: string
  nominatedDisperserType?: PerformerSiteTypeCoding["code"]
  dispenserOrg?: string
  lineItems: {
    [key: string]: LineItemDetails
  }
  dispenseNotifications: {
    [key: string]: DispenseNotificationDetails
  }
  history: {
    [key: string]: HistoryEventDetails
  }
}

export type Prescription = PatientDetails & PrescriptionDetails
