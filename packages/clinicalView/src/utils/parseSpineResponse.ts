import {XMLParser} from "fast-xml-parser"
import {Logger} from "@aws-lambda-powertools/logger"
import {
  XmlResponse,
  XmlSoapBody,
  XmlPrescription,
  XmlFilteredHistory,
  XmlError,
  PatientDetails,
  RequestGroupDetails,
  ProductLineItemDetails,
  DispenseNotification,
  DispenseNotificationItem,
  FilteredHistoryDetails,
  ParsedSpineResponse
} from "./types"
import {padWithZeros} from "./fhirMappers"

// ---------------------------- PARSE SPINE RESPONSE ------------------------------
export const parseSpineResponse = (spineResponse: string, logger: Logger): ParsedSpineResponse => {
  const xmlParser = new XMLParser({ignoreAttributes: false})
  const xmlResponse = xmlParser.parse(spineResponse) as XmlResponse

  logger.info("Parsing XML SOAP response from Spine...")
  const xmlSoapBody: XmlSoapBody | undefined = xmlResponse["SOAP:Envelope"]?.["SOAP:Body"]

  if (!xmlSoapBody) {
    const error: string = parseErrorResponse(xmlResponse)
    if (error === "Prescription not found") {
      logger.warn("No prescriptions found.")
      return {}
    }
    throw new Error(error || "Unknown Error")
  }

  // Extract prescription data from the SOAP body
  const xmlPrescription: XmlPrescription =
    xmlSoapBody.prescriptionClinicalViewResponse.PORX_IN000006UK98
      .ControlActEvent.subject.PrescriptionJsonQueryResponse.epsRecord

  logger.info("Spine SOAP xmlPrescription data", {xmlPrescription})

  // Parse and return structured prescription data
  return {
    requestGroupDetails: parseRequestGroupDetails(xmlPrescription, logger),
    patientDetails: parsePatientDetails(xmlPrescription, logger),
    productLineItems: parseProductLineItems(xmlPrescription, logger),
    filteredHistory: parseFilteredHistory(xmlPrescription, logger),
    dispenseNotificationDetails: parseDispenseNotificationItems(xmlPrescription, logger)
  }
}

// ---------------------------- PATIENT DETAILS ------------------------------
// Parses patient details from the XML prescription
export const parsePatientDetails = (xmlPrescription: XmlPrescription, logger: Logger): PatientDetails => {
  const parentPrescription = xmlPrescription.parentPrescription

  if (!parentPrescription) {
    throw new Error("Parent prescription details are missing")
  }

  if (
    !xmlPrescription.patientNhsNumber ||
    !parentPrescription?.given ||
    !parentPrescription?.family ||
    !parentPrescription?.birthTime
  ) {
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

  const patientAddress = parsePatientAddress(parentPrescription, logger)

  return {
    nhsNumber: xmlPrescription.patientNhsNumber.toString(),
    prefix: parentPrescription?.prefix ?? "",
    given: parentPrescription?.given,
    family: parentPrescription?.family,
    suffix: parentPrescription?.suffix ?? "",
    gender: parentPrescription?.administrativeGenderCode ?? undefined,
    birthDate: parentPrescription?.birthTime.toString(),
    address: patientAddress ? [patientAddress] : undefined
  }
}

// ---------------------------- PARSE PATIENT ADDRESS ------------------------------
// Extracts and formats patient address from the XML data
export const parsePatientAddress = (parentPrescription: XmlPrescription["parentPrescription"], logger: Logger) => {
  // Check if any address-related fields exist in the parentPrescription
  // If all address fields are missing, consider the address as not provided.
  if (
    !parentPrescription?.addrLine1 &&
    !parentPrescription?.addrLine2 &&
    !parentPrescription?.addrLine3 &&
    !parentPrescription?.postalCode
  ) {
    logger.info("No address information provided for the patient.")
    return undefined
  }

  const address = {
    line: [
      parentPrescription?.addrLine1,
      parentPrescription?.addrLine2,
      parentPrescription?.addrLine3
    ].filter(Boolean) as Array<string>, // Filter out undefined/null values
    city: parentPrescription?.city ?? undefined,
    district: parentPrescription?.district ?? undefined,
    postalCode: parentPrescription?.postalCode ?? undefined,
    text: [
      parentPrescription?.addrLine1,
      parentPrescription?.addrLine2,
      parentPrescription?.addrLine3,
      parentPrescription?.postalCode
    ]
      .filter(Boolean)
      .join(", "), // Join the address components into a single text string
    type: "both" as const,
    use: "home" as const
  }

  logger.info("Patient address parsed successfully", {address})

  return address
}

// ---------------------------- PRESCRIPTION DETAILS -------------------------
// Parses prescription-level details
const parseRequestGroupDetails = (xmlPrescription: XmlPrescription, logger: Logger): RequestGroupDetails => {
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
    prescriptionType: padWithZeros(xmlPrescription.prescriptionType.toString(), 4),
    statusCode: padWithZeros(xmlPrescription.prescriptionStatus.toString(), 4),
    instanceNumber: xmlPrescription.instanceNumber
  })

  return {
    prescriptionId: xmlPrescription.prescriptionID,
    prescriptionType: padWithZeros(xmlPrescription.prescriptionType.toString(), 4),
    signedTime: xmlPrescription.signedTime,
    statusCode: padWithZeros(xmlPrescription.prescriptionStatus.toString(), 4),
    instanceNumber: xmlPrescription.instanceNumber,
    maxRepeats: xmlPrescription.maxRepeats !== null ? xmlPrescription.maxRepeats : undefined,
    daysSupply: xmlPrescription.daysSupply,
    nominatedPerformer: xmlPrescription.nominatedPerformer ?? "",
    prescribingOrganization: xmlPrescription.prescribingOrganization ?? ""
  }
}

// ---------------------------- PRODUCT LINE ITEMS ---------------------------
// Parses product line items (medications) from the parent prescription
const parseProductLineItems = (xmlPrescription: XmlPrescription, logger: Logger): Array<ProductLineItemDetails> => {
  const productLineItems: Array<ProductLineItemDetails> = []
  const parentPrescription = xmlPrescription.parentPrescription

  if (!parentPrescription) {
    throw new Error("Parent prescription details are missing")
  }

  for (let i = 1; i <= 4; i++) {
    const productLineItemKey = `productLineItem${i}` as keyof typeof parentPrescription
    const quantityKey = `quantityLineItem${i}` as keyof typeof parentPrescription
    const dosageKey = `dosageLineItem${i}` as keyof typeof parentPrescription

    const productLineItem = parentPrescription[productLineItemKey] as string | undefined

    if (productLineItem) {
      productLineItems.push({
        order: i,
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
// Parses filtered history of prescription events
const parseFilteredHistory = (xmlPrescription: XmlPrescription, logger: Logger): FilteredHistoryDetails => {
  const filteredHistoryItems: XmlFilteredHistory | Array<XmlFilteredHistory> = xmlPrescription.filteredHistory

  // Get the latest filtered history by the highest SCN
  const latestHistory = Array.isArray(filteredHistoryItems)
    ? filteredHistoryItems.reduce((prev, current) => (prev.SCN > current.SCN ? prev : current), filteredHistoryItems[0])
    : filteredHistoryItems

  const parsedHistory: FilteredHistoryDetails = {
    SCN: latestHistory.SCN,
    sentDateTime: latestHistory.timestamp.toString(),
    fromStatus: padWithZeros(latestHistory.fromStatus.toString(), 4),
    toStatus: padWithZeros(latestHistory.toStatus.toString(), 4),
    message: latestHistory.message.toString(),
    organizationName: latestHistory.agentPersonOrgCode.toString(),
    lineStatusChangeDict: latestHistory.lineStatusChangeDict
      ? {
        line: latestHistory.lineStatusChangeDict.line.map((line) => ({
          order: line.order,
          id: line.id,
          status: line.status ?? "",
          fromStatus: padWithZeros(line.fromStatus.toString(), 4),
          toStatus: padWithZeros(line.toStatus.toString(), 4),
          cancellationReason: line?.cancellationReason
        }))
      }
      : undefined
  }

  logger.info("Filtered history parsed successfully", {parsedHistory})
  return parsedHistory
}

// ---------------------------- DISPENSE NOTIFICATION -----------------------------
// Parses dispense notification for each product line item and returns the dispense data
export const parseDispenseNotificationItems = (xmlPrescription: XmlPrescription, logger: Logger)
  : DispenseNotification => {
  const dispenseNotification = xmlPrescription?.dispenseNotification
  const parentPrescription = xmlPrescription?.parentPrescription
  const dispensingOrganization = xmlPrescription?.dispensingOrganization ?? ""
  const dispenseNotifDateTime = xmlPrescription?.dispenseNotifDateTime ?? ""

  const statusPrescription = padWithZeros(dispenseNotification?.statusPrescription ?? "", 4)
  const dispenseNotificationItems: Array<DispenseNotificationItem> = []

  if (!dispenseNotification || !parentPrescription) {
    logger.info("No dispense notification or parent prescription found.")
    return {
      statusPrescription,
      dispensingOrganization,
      dispenseNotifDateTime,
      dispenseNotificationItems
    }
  }

  // Looping over 4 product line items dynamically
  for (let i = 1; i <= 4; i++) {
    const productLineItemKey = `productLineItem${i}` as keyof typeof parentPrescription
    const quantityLineItemKey = `quantityLineItem${i}` as keyof typeof parentPrescription
    const statusLineItemKey = `statusLineItem${i}` as keyof typeof dispenseNotification

    const product = parentPrescription[productLineItemKey] as string | undefined
    const quantity = parentPrescription[quantityLineItemKey]?.toString() ?? "0"
    const status = padWithZeros(dispenseNotification[statusLineItemKey]?.toString(), 4) ?? ""

    // We don't add cancelled items
    if (product && status !== "0005") {
      dispenseNotificationItems.push({
        order: i,
        medicationName: product,
        quantity,
        status
      })
    }
  }

  return {
    statusPrescription,
    dispensingOrganization,
    dispenseNotifDateTime,
    dispenseNotificationItems
  }
}

// ---------------------------- ERROR HANDLING -------------------------------
// Parses error messages from the SOAP response
const parseErrorResponse = (responseXml: XmlResponse): string => {
  const xmlSoapEnvBody = responseXml["SOAP:Envelope"]?.["SOAP:Body"]
  if (!xmlSoapEnvBody) return "Unknown Error."

  const xmlError: XmlError | undefined = xmlSoapEnvBody.prescriptionClinicalViewResponse?.MCCI_IN010000UK13
    ?.acknowledgement?.acknowledgementDetail?.code

  return xmlError?.["@_displayName"] ?? "Unknown Error"
}
