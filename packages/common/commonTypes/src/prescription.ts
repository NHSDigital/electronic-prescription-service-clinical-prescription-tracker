export interface PatientDetailsSummary {
  nhsNumber: string
  prefix?: string
  suffix?: string
  given?: string
  family?: string
}

export interface PatientDetails extends PatientDetailsSummary {
  birthDate: string
  gender: number
  address: {
    line: Array<string>
    postalCode?: string
  }
}

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

export interface LineItemDetailsSummary {
  lineItemNo: string
  status: string
  itemName: string
  quantity: number
  quantityForm: string
  dosageInstruction: string
}

export interface LineItemDetails extends LineItemDetailsSummary {
  lineItemId: string
  cancellationReason?: string
  pendingCancellation: boolean
}

export interface DispenseNotificationDetails {
  dispenseNotificationId: string
  timestamp: string
  status: string
  lineItems: {
    [key: string]: LineItemDetailsSummary
  }
}

export interface EventLineItem {
  lineItemNo: string
  newStatus: string
  cancellationReason?: string
}

export interface HistoryEventDetails {
  eventId: string
  message: string
  messageId: string
  timestamp: string
  org: string
  newStatus: string
  cancellationReason?: string
  isDispenseNotification: boolean,
  lineItems: {
    [key: string]: EventLineItem
  }
}

export interface PrescriptionDetails extends PrescriptionDetailsSummary, IssueDetails {
  daysSupply?: number
  prescriberOrg: string
  nominatedDispenserOrg?: string
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
