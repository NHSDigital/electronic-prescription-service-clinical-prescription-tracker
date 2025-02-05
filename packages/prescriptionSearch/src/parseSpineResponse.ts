import {XMLParser} from "fast-xml-parser"

import {erdExample} from "./examples/examples"

// TODO: handle errors

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type PrescriptionSearchResponse = {
  patientDetails: {
    nhsNumber: string
    prefix: string
    suffix: string
    given: string
    family: string
  }
  prescriptionDetails: {
    prescriptionId: string
    issueDate: string
    treatmentType: string
    maxRepeats: number
  }
  issues: Array<{
    issueNumber: number
    status: string
    itemsPendingCancellation: boolean
    itemsPendingCancellationCount: number
    prescriptionPendingCancellation: boolean
  }>
}

export const parseSpineResponse = (spineResponse: string) => {
  const parserOptions = {
    ignoreAttributes: false
  }
  const xmlParser = new XMLParser(parserOptions)

  let jObj = xmlParser.parse(spineResponse)
  return jObj["SOAP:Envelope"]["SOAP:Body"].prescriptionSearchResponse.PRESCRIPTIONSEARCHRESPONSE_SM01.id
}

export const parseErd = () => {
  return parseSpineResponse(erdExample)
}
