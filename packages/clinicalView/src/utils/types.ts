export interface ParsedSpineResponse {
  patientDetails?: PatientDetails
  prescriptionDetails?: PrescriptionDetails
  productLineItems: Array<ProductLineItemDetails>
  filteredHistory: Array<FilteredHistoryDetails>
  error?: string
}

export interface PatientDetails {
  nhsNumber: string
  prefix: string
  given: string
  family: string
  suffix: string
  birthDate: string
  gender: "male" | "female" | "other" | "unknown"
}

export interface PrescriptionDetails {
  prescriptionId: string
  prescriptionType: string
  statusCode: string
  instanceNumber: number
  maxRepeats?: number
  daysSupply: string
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
  patientNhsNumber: XmlStringValue
  prefix: XmlStringValue
  given: XmlStringValue
  family: XmlStringValue
  suffix: XmlStringValue
  patientBirthTime: XmlStringValue
  administrativeGenderCode: XmlStringValue

  prescriptionID: XmlStringValue
  prescriptionType: XmlStringValue
  prescriptionStatus: XmlStringValue
  instanceNumber: XmlStringValue
  maxRepeats: XmlStringValue
  daysSupply: XmlStringValue
  nominatedPerformer: XmlStringValue
  dispensingOrganization: XmlStringValue

  productLineItem1?: XmlProductLineItem
  productLineItem2?: XmlProductLineItem
  productLineItem3?: XmlProductLineItem
  productLineItem4?: XmlProductLineItem
  productLineItem5?: XmlProductLineItem

  quantityLineItem1?: XmlStringValue
  quantityLineItem2?: XmlStringValue
  quantityLineItem3?: XmlStringValue
  quantityLineItem4?: XmlStringValue
  quantityLineItem5?: XmlStringValue

  dosageLineItem1?: XmlStringValue
  dosageLineItem2?: XmlStringValue
  dosageLineItem3?: XmlStringValue
  dosageLineItem4?: XmlStringValue
  dosageLineItem5?: XmlStringValue

  filteredHistory: XmlFilteredHistory | Array<XmlFilteredHistory>
}

export interface XmlProductLineItem {
  "@_value": string
}

export interface XmlFilteredHistory {
  SCN: XmlStringValue
  timestamp: XmlStringValue
  fromStatus: XmlStringValue
  toStatus: XmlStringValue
  message: XmlStringValue
  agentPersonOrgCode: XmlStringValue
}

export interface XmlError {
  "@_codeSystem": string
  "@_code": string
  "@_displayName": string
}

interface XmlStringValue {
  "@_value": string
}
