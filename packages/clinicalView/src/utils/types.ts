import {Address} from "fhir/r4"

// Shared Interface for Line Status Change
export interface LineStatusChange {
  order: number
  id: string
  status?: string
  fromStatus: string
  toStatus: string
  cancellationReason?: string
}

// Main Response Interface
export interface ParsedSpineResponse {
  patientDetails?: PatientDetails
  requestGroupDetails?: RequestGroupDetails
  productLineItems?: Array<ProductLineItemDetails>
  filteredHistory?: FilteredHistoryDetails
  error?: string // Error message if parsing fails
}

// Patient Details
export interface PatientDetails {
  nhsNumber: string
  prefix: string
  given: string
  family: string
  suffix: string
  birthDate?: string
  gender?: number
  address?: Array<Address>
}

// Prescription Details
export interface RequestGroupDetails {
  prescriptionId: string
  prescriptionType: string
  statusCode: string
  instanceNumber: number
  maxRepeats?: number
  daysSupply: number
  nominatedPerformer: string
  organizationSummaryObjective: string
}

// Product Line Items
export interface ProductLineItemDetails {
  order: number
  medicationName: string
  quantity: string
  dosageInstructions: string
}

// Filtered History
export interface FilteredHistoryDetails {
  SCN: number
  sentDateTime: string
  fromStatus: string
  toStatus: string
  message: string
  organizationName: string
  lineStatusChangeDict?: {
    line: Array<LineStatusChange>
  }
}

// ------------------------ XML Types ------------------------

// Top-Level XML Response
export interface XmlResponse {
  "SOAP:Envelope"?: {
    "SOAP:Body"?: XmlSoapBody
  }
}

// SOAP Body
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
    }
    MCCI_IN010000UK13?: {
      acknowledgement: {
        acknowledgementDetail: {
          code: XmlError
        }
      }
    }
  }
}

// Prescription Object
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

// Filtered History Object
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
    line: Array<LineStatusChange>
  }
}

// Error Object
export interface XmlError {
  "@_codeSystem": string
  "@_code": string
  "@_displayName": string
}

// Utility Type for XML Attributes
interface XmlStringValue {
  "@_value": string
}
