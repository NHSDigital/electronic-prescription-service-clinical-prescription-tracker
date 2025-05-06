type XmlStringValue = {
  "@_value": string
}

interface SpineXmlError {
  MCCI_IN010000UK13: {
    acknowledgement: {
      acknowledgementDetail: {
        code: {
          "@_codeSystem": string
          "@_code": string
          "@_displayName": string
        }
      }
    }
  }
  PORX_IN000006UK98: never
}

interface XmlLineItem {
  order: XmlStringValue
  ID: XmlStringValue
  status: XmlStringValue
}

interface XmlDispenseNotification {
  dispenseNotificationID: string
  dispNotifDocumentKey: string
  dispenseNotifDateTime: string
  statusPrescription: string
  [productLineItem: `productLineItem${string}`]: string
  [quantityLineItem: `quantityLineItem${string}`]: string
  [narrativeLineItem: `narrativeLineItem${string}`]: string
  [statusLineItem: `statusLineItem${string}`]: string
  [dosageLineItem: `dosageLineItem${string}`]: string
}

interface XmlHistoryEvent {
  SCN: string
  messageID: string
}

interface XmlHistoryEventLineItem{
  order: string
  id: string
  toStatus: string
  cancellationReason?: string
}

interface XmlFilteredHistoryEvent {
  SCN: string
  timestamp: string
  toStatus: string
  message: string
  agentPersonOrgCode: string
  cancellationReason?: string
  lineStatusChangeDict: {
    line: Array<XmlHistoryEventLineItem> | XmlHistoryEventLineItem
  }
}

interface XmlEpsRecord {
  patientNhsNumber: string
  patientBirthTime: string
  prescriptionID: string
  instanceNumber: string
  prescriptionStatus: string
  prescriptionTreatmentType: string
  prescriptionType: string
  prescriptionTime: string
  maxRepeats?: string
  daysSupply?: string
  prescribingOrganization: string
  nominatedPerformer?: string
  dispensingOrganization?: string
  parentPrescription: {
    prefix?: string
    suffix?: string
    given?: string
    family?: string
    administrativeGenderCode?: string
    addrLine1?: string
    addrLine2?: string
    addrLine3?: string
    postalCode?: string
    [productLineItem: `productLineItem${string}`]: string
    [quantityLineItem: `quantityLineItem${string}`]: string
    [narrativeLineItem: `narrativeLineItem${string}`]: string
    [dosageLineItem: `dosageLineItem${string}`]: string
  }
  lineItem: Array<XmlLineItem> | XmlLineItem
  dispenseNotification?:Array<XmlDispenseNotification> | XmlDispenseNotification
  history: Array<XmlHistoryEvent> | XmlHistoryEvent
  filteredHistory: Array<XmlFilteredHistoryEvent> | XmlFilteredHistoryEvent
}

interface SpineClinicalView {
  PORX_IN000006UK98: {
    ControlActEvent: {
      subject: {
        PrescriptionJsonQueryResponse: {
          epsRecord: XmlEpsRecord
        }
      }
    }
  }
  MCCI_IN010000UK13: never
}

export interface SpineXmlPrescriptionSearchResponse {
  prescriptionSearchResponse: SpineXmlError
}

export interface SpineXmlClinicalViewResponse {
  prescriptionClinicalViewResponse: SpineClinicalView | SpineXmlError
}

interface SpineSoapEnvelope {
  "SOAP:Envelope": {
    "SOAP:Body": SpineXmlPrescriptionSearchResponse | SpineXmlClinicalViewResponse
  }
  "SOAP-ENV:Envelope": never
}

interface SpineSoapEnvEnvelope {
  "SOAP-ENV:Envelope": {
    "SOAP-ENV:Body": SpineXmlPrescriptionSearchResponse | SpineXmlClinicalViewResponse
  }
  "SOAP:Envelope": never
}

export type SpineXmlResponse = SpineSoapEnvelope | SpineSoapEnvEnvelope

export const SPINE_TIMESTAMP_FORMAT = "yyyyMMddHHmmss" as const
export type SpineGenderCode = 1 | 2 | 3 | 4
