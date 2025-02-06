import {XMLParser} from "fast-xml-parser"

interface PatientDetails {
  nhsNumber: string
  prefix: string
  suffix: string
  given: string
  family: string
}

type PrescriptionDetails = {
  prescriptionId: string
  issueDate: string
  treatmentType: string
  maxRepeats: number | null
}

type IssueDetails = {
  issueNumber: number
  status: string
  itemsPendingCancellation: boolean
  itemsPendingCancellationCount: number
  prescriptionPendingCancellation: boolean
}
type Prescription = {
  patientDetails: PatientDetails
  prescriptionDetails: PrescriptionDetails
  issues: Array<IssueDetails>
}

type PrescriptionSearchResult = Array<Prescription>

export const parseSpineResponseXml = (spineResponseXml: string) => {
  let prescriptionSearchResult: PrescriptionSearchResult = []

  const parserOptions = {
    ignoreAttributes: false
  }
  const xmlParser = new XMLParser(parserOptions)
  let parsedResponseXml = xmlParser.parse(spineResponseXml)

  const soapBody = parsedResponseXml["SOAP:Envelope"]?.["SOAP:Body"]
  if (!soapBody) {
    // TODO: error stuff
    console.log("error")
    return
  }

  // eslint-disable-next-line max-len
  const searchResults = soapBody.prescriptionSearchResponse.PRESCRIPTIONSEARCHRESPONSE_SM01.ControlActEvent.subject.searchResults
  let prescriptions = searchResults.prescription
  if (!Array.isArray(prescriptions)) {
    prescriptions = [prescriptions]
  }
  return prescriptions
}

type XmlStringValue = {
  "@_value": string
}

interface IssueDetail {
  instanceNumber: XmlStringValue
  prescriptionStatus: XmlStringValue
  cancellations: XmlStringValue
  prescCancPending: XmlStringValue
  liCancPending: XmlStringValue
}

interface ResponsePrescription {
  id: XmlStringValue
  patientId: XmlStringValue
  prefix: XmlStringValue
  suffix: XmlStringValue
  given: XmlStringValue
  family: XmlStringValue
  issueDetail: IssueDetail | Array<IssueDetail>
  prescribedDate: XmlStringValue
  prescriptionTreatmentType: XmlStringValue
  maxRepeats: XmlStringValue
}

const parsePrescriptions = (prescriptions: Array<ResponsePrescription>) => {
  for (const prescription of prescriptions) {
    // do stuff
    const patientDetails: PatientDetails = {
      nhsNumber: prescription.patientId["@_value"],
      prefix: prescription.prefix["@_value"],
      suffix: prescription.suffix["@_value"],
      given: prescription.given["@_value"],
      family: prescription.family["@_value"]
    }

    const prescriptionDetails: PrescriptionDetails = {
      prescriptionId: prescription.id["@_value"],
      issueDate: prescription.prescribedDate["@_value"],
      treatmentType: prescription.prescriptionTreatmentType["@_value"],
      maxRepeats: prescription.maxRepeats["@_value"] === "None" ? null : Number(prescription.maxRepeats["@_value"])
    }
    let issues = prescription.issueDetail
    if (!Array.isArray(issues)) {
      issues = [issues]
    }
    for (const issue of issues) {
      const issueDetails: IssueDetail = {
        instanceNumber: issue.instanceNumber["@_value	"],
        status: issue.prescriptionStatus

      }
    }
  }
}
