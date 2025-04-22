export interface PatientDetailsSummary {
  nhsNumber: string
  prefix: string
  suffix: string
  given: string
  family: string
}

export interface PatientDetails extends PatientDetailsSummary {
  birthDate: string
  gender: number
  address: {
    line: Array<string>
    postalCode: string
  }
}

/// ----------------------------------------------------
export interface PrescriptionDetailsSummary {
  prescriptionId: string
  issueDate: string
  treatmentType: string
  maxRepeats?: number
}

export interface IssueDetails {
  issueNumber: number
  status: string
  prescriptionPendingCancellation: boolean
  itemsPendingCancellation: boolean
}

export interface LineItemDetails {
  lineItemNo: string
  lineItemId: string
  status: string
  itemName: string
  quantity: number
  quantityForm: string
  dosageInstruction: string
  statusReason?: string
}

export interface HistoryEventDetails {
  eventId: string
  time: string
  org: string
  newStatus: string
  dispenseNotificationId: string
}

export interface PrescriptionDetails extends PrescriptionDetailsSummary, IssueDetails {
  daysSupply: number
  prescriberOrg: string
  nominatedDispenserOrg: string
  dispenserOrg?: string
  lineItems: {
    [key: string]: LineItemDetails
  }
  dispenseNotifications: {
    [key: string]: LineItemDetails
  }
  history: Array<HistoryEventDetails>
}
