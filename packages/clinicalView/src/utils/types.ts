export interface ParsedSpineResponse {
  patientDetails?: PatientDetails
  prescriptionDetails?: PrescriptionDetails
  productLineItems?: Array<ProductLineItemDetails>
  filteredHistory?: Array<FilteredHistoryDetails>
  error?: string // Error message if parsing fails
}

export interface PatientDetails {
  nhsNumber: string
  prefix: string
  given: string
  family: string
  suffix: string
  birthDate?: string
  gender?: number
  address?: Array<{
    line?: Array<string>
    city?: string
    district?: string
    postalCode?: string
    text?: string
    type?: "postal" | "physical" | "both"
    use?: "home" | "work" | "temp" | "old" | "billing"
  }>
}

export interface PrescriptionDetails {
  prescriptionId: string
  prescriptionType: string
  statusCode: string
  instanceNumber: number
  maxRepeats?: number
  daysSupply: number
  nominatedPerformer: string
  organizationSummaryObjective: string
}

export interface ProductLineItemDetails {
  medicationName: string
  quantity: string
  dosageInstructions: string
}

export interface FilteredHistoryDetails {
  SCN: number
  sentDateTime: string
  fromStatus: string
  toStatus: string
  message: string
  organizationName: string
}

// XML Response Types
export interface XmlResponse {
  "SOAP:Envelope"?: {
    "SOAP:Body"?: XmlSoapBody
  }
}

export interface XmlSoapBody {
  prescriptionClinicalViewResponse: {
    PORX_IN000006UK98: {
      ControlActEvent: {
        subject: {
          PrescriptionJsonQueryResponse: {
            epsRecord: XmlPrescription
          }
        }
      }
    },
    MCCI_IN010000UK13?: {
      acknowledgement: {
        acknowledgementDetail: {
          code: XmlError
        }
      }
    }
  }
}

export interface XmlPrescription {
  releaseRequestMsgRef: string
  prescriptionStatus: string
  nominatedDownloadDate: string
  downloadDate: number
  completionDate: string
  expiryDate: number

  dispenseWindow: {
    low: XmlStringValue
    high: XmlStringValue
  }

  instanceNumber: number
  prescriptionID: string
  prescriptionType: string
  prescriptionTime: number
  prescriptionMsgRef: string
  prescribingOrganization: string
  daysSupply: number
  maxRepeats: number | null
  eventID: string
  lowerAgeLimit: number
  higherAgeLimit: number
  patientNhsNumber: number
  patientBirthTime: number
  nominatedPerformer: string
  nominatedPerformerType: string
  dispensingOrganization: string

  lineItem: Array<{
    order: XmlStringValue
    ID: XmlStringValue
    previousStatus: XmlStringValue
    status: XmlStringValue
  }>

  history: Array<{
    SCN: number
    instance: number
    interactionID: string
    status: number
    instanceStatus: number
    agentPerson: number
    agentSystem: number
    agentPersonOrgCode: string
    message: string
    messageID: string
    timestamp: string
    toASID: string
    fromASID: string
  }>

  filteredHistory: XmlFilteredHistory | Array<XmlFilteredHistory>

  parentPrescription?: {
    birthTime: number
    administrativeGenderCode: number
    prefix: string
    given: string
    family: string
    suffix: string

    addrLine1?: string
    addrLine2?: string
    addrLine3?: string
    postalCode?: string

    city?: string
    district?: string

    productLineItem1?: string
    quantityLineItem1?: number
    dosageLineItem1?: string

    productLineItem2?: string
    quantityLineItem2?: number
    dosageLineItem2?: string

    productLineItem3?: string
    quantityLineItem3?: number
    dosageLineItem3?: string

    productLineItem4?: string
    quantityLineItem4?: number
    dosageLineItem4?: string
  }
}

export interface XmlProductLineItem {
  "@_value": string
}

export interface XmlFilteredHistory {
  SCN: number
  timestamp: number
  fromStatus: string
  toStatus: string
  agentPerson: number
  agentRoleProfileCodeId: number
  message: string
  orgASID: number
  agentPersonOrgCode: string

  lineStatusChangeDict: {
    line: Array<{
      order: number
      id: string
      status?: string
      fromStatus: string | number
      toStatus: string | number
    }>
  }
}

export interface XmlError {
  "@_codeSystem": string
  "@_code": string
  "@_displayName": string
}

interface XmlStringValue {
  "@_value": string
}
