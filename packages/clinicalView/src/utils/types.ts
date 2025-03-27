import {Logger} from "@aws-lambda-powertools/logger"
import {SpineClient} from "@NHSDigital/eps-spine-client/lib/spine-client"
import {RequestGroupAction} from "fhir/r4"

interface FhirErrorDetails {
  status: string
  code: string
  detailsCode: string
  detailsDisplay: string
}
export interface ErrorMap {
  [key: string]: FhirErrorDetails
}

export interface HandlerParams {
  logger: Logger
  spineClient: SpineClient
}

export interface SearchError {
  status: string
  severity: "fatal" | "error" | "warning" | "information"
  description: string
}

export interface PathParameters {
  prescriptionId?: string
}

export interface HeaderSearchParameters {
  requestId?: string
  correlationId?: string
  organizationId?: string
  sdsRoleProfileId?: string
  sdsId?: string
  jobRoleCode?: string
}

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
  requestGroupDetails: RequestGroupDetails
  patientDetails: PatientDetails
  productLineItems: Array<ProductLineItemDetails>
  filteredHistory: Array<FilteredHistoryDetails>
  dispenseNotificationDetails?: DispenseNotification
}

export interface ParseError {
  error: SearchError
}

// Patient Details
export interface PatientDetails {
  nhsNumber: string
  prefix: string
  given: string
  family: string
  suffix: string
  birthDate: string
  gender: number
  address?: Address
}

interface Address {
  line: Array<string>
  city?: string
  district?: string
  postalCode?: string
}

// Prescription Details
export interface RequestGroupDetails {
  prescriptionId: string
  prescriptionTreatmentType: string
  prescriptionType: string
  signedTime: string
  prescriptionTime: string
  prescriptionStatus: string
  instanceNumber: number
  maxRepeats?: number
  daysSupply: number
  nominatedPerformer: string
  prescribingOrganization: string
}

// Product Line Items
export interface ProductLineItemDetails {
  order: number
  medicationName: string
  quantity: string
  dosageInstructions: string
}

// Dispense Notification
export interface DispenseNotification {
  statusPrescription: string
  dispensingOrganization: string,
  dispNotifToStatus: string,
  dispenseNotifDateTime: string,
  dispenseNotificationItems: Array<DispenseNotificationItem>
}

// Dispense Notification Item
export interface DispenseNotificationItem {
  order: number
  medicationName: string
  quantity: string
  status: string
}

// Filtered History
export interface FilteredHistoryDetails {
  SCN: number
  sentDateTime: string
  fromStatus: string
  toStatus: string
  message: string
  agentPersonOrgCode: string
  cancellationReason?: string
  lineStatusChangeDict?: {
    line: Array<LineStatusChange>
  }
}

export interface PrescriptionStatusTransitions {
  title: string
  action: Array<RequestGroupAction>
}

// ------------------------ XML Types ------------------------

// Top-Level XML Response
export interface XmlResponse {
  "SOAP:Envelope"?: {
    "SOAP:Body"?: XmlSoapBody
  }
  "SOAP-ENV:Envelope"?: {
    "SOAP-ENV:Body"?: XmlSoapBody
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
  prescriptionTreatmentType: string
  prescriptionType: string
  signedTime: string
  prescriptionTime: string
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
  dispNotifToStatus: string
  dispenseNotifDateTime: string

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

  dispenseNotification?: {
    dispNotifDocumentKey: string
    dispNotifFromStatus: string
    dispNotifToStatus: string
    dispenseNotifDateTime: string

    productLineItem1: string
    quantityLineItem1: string
    narrativeLineItem1: string
    statusLineItem1: string

    productLineItem2: string
    quantityLineItem2: string
    narrativeLineItem2: string
    statusLineItem2: string

    productLineItem3: string
    quantityLineItem3: string
    narrativeLineItem3: string
    statusLineItem3: string
    productLineItem4: string

    quantityLineItem4: string
    narrativeLineItem4: string
    statusLineItem4: string
    statusPrescription: string
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
  cancellationReason?: string
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
