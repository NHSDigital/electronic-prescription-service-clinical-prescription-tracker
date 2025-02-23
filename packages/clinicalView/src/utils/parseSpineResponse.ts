import {XMLParser} from "fast-xml-parser"
import {Logger} from "@aws-lambda-powertools/logger"
import {
  XmlResponse,
  XmlSoapBody,
  XmlPrescription,
  XmlFilteredHistory,
  XmlError,
  PatientDetails,
  PrescriptionDetails,
  ProductLineItemDetails,
  FilteredHistoryDetails,
  ParsedSpineResponse
} from "./types"

export const parseSpineResponse = (spineResponse: string, logger: Logger): Array<ParsedSpineResponse> => {
  const xmlParser = new XMLParser({ignoreAttributes: false})
  const xmlResponse = xmlParser.parse(spineResponse) as XmlResponse

  logger.info("Parsing XML SOAP body...")
  const xmlSoapBody: XmlSoapBody | undefined = xmlResponse["SOAP:Envelope"]?.["SOAP:Body"]

  if (!xmlSoapBody) {
    const error: string = parseErrorResponse(xmlResponse)
    if (error === "Prescription not found") {
      logger.info("No prescriptions found.")
      return []
    }
    throw new Error(error || "Unknown Error")
  }

  logger.info("Parsing prescription data...")
  let xmlPrescriptions: XmlPrescription | Array<XmlPrescription> =
    xmlSoapBody.prescriptionClinicalViewResponse.PORX_IN000006UK98
      .ControlActEvent.subject.PrescriptionJsonQueryResponse.epsRecord

  if (!Array.isArray(xmlPrescriptions)) {
    xmlPrescriptions = [xmlPrescriptions]
  }

  logger.info("Spine SOAP xmlPrescriptions data", {xmlPrescriptions})

  const parsedPrescriptions = xmlPrescriptions.map((xmlPrescription) => ({
    patientDetails: parsePatientDetails(xmlPrescription, logger),
    prescriptionDetails: parsePrescriptionDetails(xmlPrescription, logger),
    productLineItems: parseProductLineItems(xmlPrescription, logger),
    filteredHistory: parseFilteredHistory(xmlPrescription, logger)
  }))

  return parsedPrescriptions
}

// ---------------------------- PATIENT DETAILS ------------------------------
const parsePatientDetails = (xmlPrescription: XmlPrescription, logger: Logger): PatientDetails => {
  const parentPrescription = xmlPrescription.parentPrescription

  if (!parentPrescription) {
    throw new Error("Parent prescription details are missing")
  }

  if (
    !xmlPrescription.patientNhsNumber ||
    !parentPrescription?.given ||
    !parentPrescription?.family ||
    !parentPrescription?.birthTime) {
    logger.info("Missing required patient details", {
      patientNhsNumber: xmlPrescription.patientNhsNumber ?? "Missing",
      nhsNumber: xmlPrescription.patientNhsNumber.toString() ?? "Missing",
      given: parentPrescription?.given ?? "Missing",
      family: parentPrescription?.family ?? "Missing",
      birthTime: parentPrescription?.birthTime ?? "Missing"
    })
  }

  logger.info("Parent details parsed successfully", {
    patientNhsNumber: xmlPrescription.patientNhsNumber,
    nhsNumber: xmlPrescription.patientNhsNumber.toString(),
    given: parentPrescription?.given,
    family: parentPrescription?.family,
    birthTime: parentPrescription?.birthTime
  })

  return {
    nhsNumber: xmlPrescription.patientNhsNumber.toString(),
    prefix: parentPrescription.prefix ?? "",
    given: parentPrescription.given,
    family: parentPrescription.family,
    suffix: parentPrescription.suffix ?? "",
    gender: parentPrescription.administrativeGenderCode ?? undefined,
    birthDate: parentPrescription.birthTime.toString()
  }
}

// ---------------------------- PRESCRIPTION DETAILS -------------------------
const parsePrescriptionDetails = (xmlPrescription: XmlPrescription, logger: Logger): PrescriptionDetails => {
  if (
    !xmlPrescription.prescriptionID ||
    !xmlPrescription.prescriptionType.toString() ||
    !xmlPrescription.prescriptionStatus ||
    !xmlPrescription.instanceNumber) {
    logger.info("Missing required prescription details", {
      prescriptionID: xmlPrescription.prescriptionID ?? "Missing",
      prescriptionType: xmlPrescription.prescriptionType.toString() ?? "Missing",
      prescriptionStatus: xmlPrescription.prescriptionStatus ?? "Missing",
      instanceNumber: xmlPrescription.instanceNumber ?? "Missing"
    })
  }

  logger.info("Prescription details parsed successfully", {
    prescriptionID: xmlPrescription.prescriptionID,
    prescriptionType: xmlPrescription.prescriptionType.toString(),
    prescriptionStatus: xmlPrescription.prescriptionStatus,
    instanceNumber: xmlPrescription.instanceNumber
  })

  return {
    prescriptionId: xmlPrescription.prescriptionID,
    prescriptionType: xmlPrescription.prescriptionType.toString(),
    statusCode: xmlPrescription.prescriptionStatus.toString(),
    instanceNumber: xmlPrescription.instanceNumber,
    maxRepeats: xmlPrescription.maxRepeats !== null ? xmlPrescription.maxRepeats : undefined,
    daysSupply: xmlPrescription.daysSupply,
    nominatedPerformer: xmlPrescription.nominatedPerformer ?? "",
    organizationSummaryObjective: xmlPrescription.dispensingOrganization ?? ""
  }
}

// ---------------------------- PRODUCT LINE ITEMS ---------------------------
const parseProductLineItems = (xmlPrescription: XmlPrescription, logger: Logger): Array<ProductLineItemDetails> => {
  const productLineItems: Array<ProductLineItemDetails> = []
  const parentPrescription = xmlPrescription.parentPrescription

  if (!parentPrescription) {
    throw new Error("Parent prescription details are missing")
  }

  for (let i = 1; i <= 5; i++) {
    const productLineItemKey = `productLineItem${i}` as keyof typeof parentPrescription
    const quantityKey = `quantityLineItem${i}` as keyof typeof parentPrescription
    const dosageKey = `dosageLineItem${i}` as keyof typeof parentPrescription

    const productLineItem = parentPrescription[productLineItemKey] as string | undefined

    if (productLineItem) {
      productLineItems.push({
        medicationName: productLineItem,
        quantity: parentPrescription[quantityKey]?.toString() ?? "0",
        dosageInstructions: parentPrescription[dosageKey]?.toString() ?? "Unknown dosage"
      })
    }
  }

  if (productLineItems.length === 0) {
    throw new Error("At least one product line item is required")
  }

  logger.info("Product line items parsed successfully", {productLineItems})

  return productLineItems
}

// ---------------------------- FILTERED HISTORY -----------------------------
const parseFilteredHistory = (xmlPrescription: XmlPrescription, logger: Logger): Array<FilteredHistoryDetails> => {
  const filteredHistoryItems: XmlFilteredHistory | Array<XmlFilteredHistory> = xmlPrescription.filteredHistory
  const parsedHistory: Array<FilteredHistoryDetails> = []

  if (Array.isArray(filteredHistoryItems)) {
    for (const history of filteredHistoryItems) {
      parsedHistory.push({
        SCN: history.SCN,
        sentDateTime: history.timestamp.toString(),
        fromStatus: history.fromStatus.toString(),
        toStatus: history.toStatus.toString(),
        message: history.message.toString(),
        organizationName: history.agentPersonOrgCode.toString()
      })
    }
  } else if (filteredHistoryItems) {
    parsedHistory.push({
      SCN: filteredHistoryItems.SCN,
      sentDateTime: filteredHistoryItems.timestamp.toString(),
      fromStatus: filteredHistoryItems.fromStatus.toString(),
      toStatus: filteredHistoryItems.toStatus.toString(),
      message: filteredHistoryItems.message.toString(),
      organizationName: filteredHistoryItems.agentPersonOrgCode.toString()
    })
  }

  logger.info("Filtered history parsed successfully", {parsedHistory})

  return parsedHistory.sort((a, b) => b.SCN - a.SCN) // Sort by SCN in descending order
}

// ---------------------------- ERROR HANDLING -------------------------------
const parseErrorResponse = (responseXml: XmlResponse): string => {
  const xmlSoapEnvBody = responseXml["SOAP:Envelope"]?.["SOAP:Body"]
  if (!xmlSoapEnvBody) return "Unknown Error."

  const xmlError: XmlError | undefined = xmlSoapEnvBody.prescriptionClinicalViewResponse?.MCCI_IN010000UK13
    ?.acknowledgement?.acknowledgementDetail?.code

  return xmlError?.["@_displayName"] ?? "Unknown Error"
}
