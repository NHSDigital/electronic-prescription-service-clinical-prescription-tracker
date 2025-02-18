export interface SearchError {
  status: string,
  severity: "error" | "fatal",
  description: string
}

export interface QueryStringSearchParameters {
  prescriptionID?: string
  nhsNumber?: string
  creationDateRange? : {
    lowDate?: string,
    highDate?: string
  }
}

export interface HeaderSearchParameters {
  requestId?: string
  correlationId?: string
  organizationId?: string
  sdsRoleProfileId?: string
  sdsId?: string
  jobRoleCode?: string
}

type XmlStringValue = {
  "@_value": string
}

export interface XmlIssueDetail {
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

export interface XmlSearchResults {
  prescription : XmlPrescription | Array<XmlPrescription>
}

export interface XmlSoapBody {
  prescriptionSearchResponse: {
    PRESCRIPTIONSEARCHRESPONSE_SM01: {
      ControlActEvent: {
        subject: {
          searchResults: XmlSearchResults
        }
      }
    }
  }
}

interface XmlSoapEnvelope {
  "SOAP:Body" : XmlSoapBody
}

export interface XmlError {
  "@_codeSystem": string
  "@_code": string
  "@_displayName": string
}

export interface XmlSoapEnvBody {
  prescriptionSearchResponse: {
    MCCI_IN010000UK13: {
      acknowledgement: {
        acknowledgementDetail: {
          code: XmlError
        }
      }
    }
  }
}

interface XmlSoapEnvEnvelope {
  "SOAP-ENV:Body" : XmlSoapEnvBody
}

export interface XmlResponse {
  "SOAP:Envelope" ?: XmlSoapEnvelope
  "SOAP-ENV:Envelope" ?: XmlSoapEnvEnvelope
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

export enum TreatmentType {
  ACUTE = "0001",
  REPEAT = "0002",
  ERD = "0003"
}

interface FhirErrorDetails {
  status: string
  code: string
  detailsCode: string
  detailsDisplay: string
}
export interface ErrorMap {
  [key: string]: FhirErrorDetails
}
