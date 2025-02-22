import {XMLParser} from "fast-xml-parser"
import {Logger} from "@aws-lambda-powertools/logger"
import {
  XmlResponse,
  XmlSoapBody,
  XmlPrescription,
  XmlProductLineItem,
  XmlFilteredHistory,
  XmlError,
  PatientDetails,
  PrescriptionDetails,
  ProductLineItemDetails,
  FilteredHistoryDetails,
  ParsedSpineResponse
} from "./types"

export const parseSpineResponse = (spineResponse: string, logger: Logger): ParsedSpineResponse => {
  const xmlParser = new XMLParser({ignoreAttributes: false})
  const xmlResponse = xmlParser.parse(spineResponse) as XmlResponse

  logger.info("Parsing XML SOAP body...")
  const xmlSoapBody: XmlSoapBody | undefined = xmlResponse["SOAP:Envelope"]?.["SOAP:Body"]

  if (!xmlSoapBody) {
    const error: string = parseErrorResponse(xmlResponse)
    if (error === "Prescription not found") {
      logger.info("No prescriptions found.")
      return {
        patientDetails: undefined,
        prescriptionDetails: undefined,
        productLineItems: [],
        filteredHistory: [],
        error: "Prescription not found"
      }
    }
    return {
      patientDetails: undefined,
      prescriptionDetails: undefined,
      productLineItems: [],
      filteredHistory: [],
      error: error || "Unknown Error"
    }
  }

  logger.info("Parsing prescription data...")
  let xmlPrescriptions: XmlPrescription | Array<XmlPrescription> =
    xmlSoapBody.prescriptionClinicalViewResponse.PORX_IN000006UK98
      .ControlActEvent.subject.PrescriptionJsonQueryResponse.epsRecord

  // Handle both single and multiple prescriptions
  if (!Array.isArray(xmlPrescriptions)) {
    xmlPrescriptions = [xmlPrescriptions]
  }

  const parsedPrescriptions = xmlPrescriptions.map(xmlPrescription => ({
    patientDetails: parsePatientDetails(xmlPrescription),
    prescriptionDetails: parsePrescriptionDetails(xmlPrescription),
    productLineItems: parseProductLineItems(xmlPrescription),
    filteredHistory: parseFilteredHistory(xmlPrescription)
  }))

  return parsedPrescriptions[0] // For now, return only the first prescription
}

// ---------------------------- PATIENT DETAILS ------------------------------
const parsePatientDetails = (xmlPrescription: XmlPrescription): PatientDetails => {
  return {
    nhsNumber: xmlPrescription.patientNhsNumber["@_value"],
    prefix: xmlPrescription.prefix["@_value"],
    given: xmlPrescription.given["@_value"],
    family: xmlPrescription.family["@_value"],
    suffix: xmlPrescription.suffix["@_value"] || "",
    birthDate: formatBirthDate(xmlPrescription.patientBirthTime["@_value"]),
    gender: mapGender(xmlPrescription.administrativeGenderCode["@_value"])
  }
}

// ---------------------------- PRESCRIPTION DETAILS -------------------------
const parsePrescriptionDetails = (xmlPrescription: XmlPrescription): PrescriptionDetails => {
  return {
    prescriptionId: xmlPrescription.prescriptionID["@_value"],
    prescriptionType: xmlPrescription.prescriptionType["@_value"],
    statusCode: xmlPrescription.prescriptionStatus["@_value"],
    instanceNumber: parseInt(xmlPrescription.instanceNumber["@_value"], 10),
    maxRepeats: xmlPrescription.maxRepeats["@_value"] === "None"
      ? undefined
      : parseInt(xmlPrescription.maxRepeats["@_value"], 10),
    daysSupply: xmlPrescription.daysSupply["@_value"],
    nominatedPerformer: xmlPrescription.nominatedPerformer["@_value"] || "",
    organizationSummaryObjective: xmlPrescription.dispensingOrganization["@_value"] || ""
  }
}

// ---------------------------- PRODUCT LINE ITEMS ---------------------------
const parseProductLineItems = (xmlPrescription: XmlPrescription): Array<ProductLineItemDetails> => {
  const productLineItems: Array<ProductLineItemDetails> = []

  for (let i = 1; i <= 5; i++) {
    const productLineItemKey = `productLineItem${i}` as keyof XmlPrescription
    const quantityKey = `quantityLineItem${i}` as keyof XmlPrescription
    const dosageKey = `dosageLineItem${i}` as keyof XmlPrescription

    const productLineItem = xmlPrescription[productLineItemKey] as XmlProductLineItem | undefined

    if (productLineItem && productLineItem["@_value"]) {
      productLineItems.push({
        medicationName: productLineItem["@_value"],
        quantity: (xmlPrescription[quantityKey] as XmlProductLineItem | undefined)?.["@_value"] || "0",
        dosageInstructions: (xmlPrescription[dosageKey] as XmlProductLineItem | undefined)?.["@_value"]
          || "Unknown dosage"
      })
    }
  }

  return productLineItems
}

// ---------------------------- FILTERED HISTORY -----------------------------
const parseFilteredHistory = (xmlPrescription: XmlPrescription): Array<FilteredHistoryDetails> => {
  const filteredHistoryItems: XmlFilteredHistory | Array<XmlFilteredHistory> = xmlPrescription.filteredHistory
  const parsedHistory: Array<FilteredHistoryDetails> = []

  if (Array.isArray(filteredHistoryItems)) {
    for (const history of filteredHistoryItems) {
      parsedHistory.push({
        SCN: parseInt(history.SCN["@_value"], 10),
        sentDateTime: history.timestamp["@_value"],
        fromStatus: history.fromStatus["@_value"],
        toStatus: history.toStatus["@_value"],
        message: history.message["@_value"],
        organizationName: history.agentPersonOrgCode["@_value"]
      })
    }
  } else {
    parsedHistory.push({
      SCN: parseInt(filteredHistoryItems.SCN["@_value"], 10),
      sentDateTime: filteredHistoryItems.timestamp["@_value"],
      fromStatus: filteredHistoryItems.fromStatus["@_value"],
      toStatus: filteredHistoryItems.toStatus["@_value"],
      message: filteredHistoryItems.message["@_value"],
      organizationName: filteredHistoryItems.agentPersonOrgCode["@_value"]
    })
  }

  return parsedHistory.sort((a, b) => b.SCN - a.SCN) // Sort by SCN in descending order
}

// ---------------------------- ERROR HANDLING -------------------------------
const parseErrorResponse = (responseXml: XmlResponse): string => {
  const xmlSoapEnvBody: XmlSoapBody | undefined = responseXml["SOAP:Envelope"]?.["SOAP:Body"]
  if (!xmlSoapEnvBody) return "Unknown Error."

  const xmlError: XmlError = xmlSoapEnvBody.prescriptionClinicalViewResponse.MCCI_IN010000UK13!
    .acknowledgement.acknowledgementDetail.code
  return xmlError["@_displayName"] || "Unknown Error"
}

// ---------------------------- HELPERS --------------------------------------
const mapGender = (genderCode: string): "male" | "female" | "other" | "unknown" => {
  switch (genderCode) {
    case "1":
      return "male"
    case "2":
      return "female"
    case "3":
      return "other"
    default:
      return "unknown"
  }
}

const formatBirthDate = (birthDate: string): string => {
  if (!birthDate || isNaN(Number(birthDate))) return ""
  return `${birthDate.slice(0, 4)}-${birthDate.slice(4, 6)}-${birthDate.slice(6, 8)}`
}
