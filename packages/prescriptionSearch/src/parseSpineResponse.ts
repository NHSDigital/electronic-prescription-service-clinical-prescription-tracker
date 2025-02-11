import {XMLParser} from "fast-xml-parser"

import {
  PrescriptionSearchResults,
  XmlPrescription,
  PatientDetails,
  PrescriptionDetails,
  IssueDetails,
  Prescription
} from "./types"

// TODO - logs

export const parseSpineResponse = (spineResponse: string): PrescriptionSearchResults | undefined => {
  const parserOptions = {
    ignoreAttributes: false
  }
  const xmlParser = new XMLParser(parserOptions)
  const responseXml = xmlParser.parse(spineResponse)

  const xmlSoapBody = responseXml["SOAP:Envelope"]?.["SOAP:Body"]
  if (!xmlSoapBody) {
    // TODO: error stuff
    console.log("error")
    return
  }

  // eslint-disable-next-line max-len
  const xmlSearchResults = xmlSoapBody.prescriptionSearchResponse.PRESCRIPTIONSEARCHRESPONSE_SM01.ControlActEvent.subject.searchResults
  let xmlPrescriptions = xmlSearchResults.prescription
  if (!Array.isArray(xmlPrescriptions)) {
    xmlPrescriptions = [xmlPrescriptions]
  }

  let prescriptionSearchResults: PrescriptionSearchResults = parsePrescriptions(xmlPrescriptions)
  return prescriptionSearchResults
}

const parsePrescriptions = (xmlPrescriptions: Array<XmlPrescription>): PrescriptionSearchResults => {
  let parsedPrescriptions: PrescriptionSearchResults = []

  for (const xmlPrescription of xmlPrescriptions) {
    const patientDetails: PatientDetails = {
      nhsNumber: xmlPrescription.patientId["@_value"],
      prefix: xmlPrescription.prefix["@_value"],
      suffix: xmlPrescription.suffix["@_value"],
      given: xmlPrescription.given["@_value"],
      family: xmlPrescription.family["@_value"]
    }

    const prescriptionDetails: PrescriptionDetails = {
      prescriptionId: xmlPrescription.id["@_value"],
      prescriptionType: "erd", //todo: what about repeats?
      issueDate: xmlPrescription.prescribedDate["@_value"],
      treatmentType: xmlPrescription.prescriptionTreatmentType["@_value"],
      maxRepeats: xmlPrescription.maxRepeats["@_value"] === "None" ?
        null : Number(xmlPrescription.maxRepeats["@_value"])
    }

    let xmlIssues = xmlPrescription.issueDetail
    if (!Array.isArray(xmlIssues)) {
      xmlIssues = [xmlIssues]
      prescriptionDetails.prescriptionType = "acute"
    }

    for (const xmlIssue of xmlIssues) {
      const issueDetails: IssueDetails = {
        issueNumber: Number(xmlIssue.instanceNumber["@_value"]),
        status: xmlIssue.prescriptionStatus["@_value"],
        prescriptionPendingCancellation: convertXmlBool(xmlIssue.prescCancPending["@_value"]),
        itemsPendingCancellation: convertXmlBool(xmlIssue.liCancPending["@_value"])
      }
      const parsedPrescription: Prescription = {
        ...patientDetails,
        ...prescriptionDetails,
        ...issueDetails
      }
      parsedPrescriptions.push(parsedPrescription)
    }
  }
  return parsedPrescriptions
}

const convertXmlBool = (value: string): boolean => {
  return value === "True" ? true : false
}
