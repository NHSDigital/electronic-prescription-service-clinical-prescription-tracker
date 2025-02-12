import {XMLParser} from "fast-xml-parser"

import {
  XmlResponse,
  XmlSoapBody,
  XmlSearchResults,
  PrescriptionSearchResults,
  XmlPrescription,
  PatientDetails,
  PrescriptionDetails,
  IssueDetails,
  Prescription,
  XmlSoapEnvBody,
  XmlError
} from "./types"

// TODO - logging

export const parseSpineResponse = (spineResponse: string): PrescriptionSearchResults | undefined => {
  const xmlParser: XMLParser = new XMLParser({ignoreAttributes: false})
  const xmlResponse = xmlParser.parse(spineResponse) as XmlResponse

  // todo: pick out no results
  const xmlSoapBody: XmlSoapBody | undefined = xmlResponse["SOAP:Envelope"]?.["SOAP:Body"]
  if (!xmlSoapBody) {
    // TODO: error stuff
    console.log("error")
    const thing = parseErrorResponse(xmlResponse) // do something with this
    return thing
  }

  const xmlSearchResults: XmlSearchResults = xmlSoapBody.prescriptionSearchResponse
    .PRESCRIPTIONSEARCHRESPONSE_SM01.ControlActEvent.subject.searchResults
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
      issueDate: xmlPrescription.prescribedDate["@_value"],
      treatmentType: xmlPrescription.prescriptionTreatmentType["@_value"],
      maxRepeats: xmlPrescription.maxRepeats["@_value"] === "None" ?
        null : Number(xmlPrescription.maxRepeats["@_value"])
    }

    let xmlIssues = xmlPrescription.issueDetail
    if (!Array.isArray(xmlIssues)) {
      xmlIssues = [xmlIssues]
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

const parseErrorResponse = (responseXml: XmlResponse)=> {
  const xmlSoapEnvBody: XmlSoapEnvBody | undefined = responseXml["SOAP-ENV:Envelope"]?.["SOAP-ENV:Body"]
  if (!xmlSoapEnvBody){
    // log
    return
  }

  const xmlError: XmlError = xmlSoapEnvBody.prescriptionSearchResponse
    .MCCI_IN010000UK13.acknowledgement.acknowledgementDetail.code

  if (xmlError["@_displayName"] === "Prescription not found") {
    // do something
  }
}
