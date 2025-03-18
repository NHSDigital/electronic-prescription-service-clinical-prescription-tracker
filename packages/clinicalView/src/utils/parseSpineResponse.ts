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
/**
 * Parses the SOAP XML response from the Spine service.
 */
export const parseSpineResponse = (spineResponse: string, logger: Logger): ParsedSpineResponse => {
  const xmlParser = new XMLParser({ignoreAttributes: false})
  const xmlResponse = xmlParser.parse(spineResponse) as XmlResponse

  logger.info("Parsing XML SOAP response from Spine...", {xmlResponse})

  // Handle potential variations in SOAP envelope naming
  const xmlSoapBody: XmlSoapBody | undefined =
    xmlResponse["SOAP:Envelope"]?.["SOAP:Body"] || xmlResponse["SOAP-ENV:Envelope"]?.["SOAP-ENV:Body"]

  if (!xmlSoapBody) {
    logger.error("Invalid SOAP response: No SOAP Body found.")
    return {
      error: {
        status: "500",
        severity: "fatal",
        description: "Invalid SOAP response format from Spine."
      }
    }
  }

  // Check for error response structure (MCCI_IN010000UK13 indicates an error)
  if (xmlSoapBody.prescriptionClinicalViewResponse?.MCCI_IN010000UK13) {
    const errorMessage: string = parseErrorResponse(xmlResponse)

    if (errorMessage === "Prescription not found") {
      logger.info("No prescriptions found.")
      return {
        error: {
          status: "404",
          severity: "error",
          description: "The requested prescription resource could not be found."
        }
      }
    }

    logger.error("Spine SOAP error detected", {errorMessage})

    return {
      error: {
        status: "500",
        severity: "error",
        description: errorMessage || "Unknown error occurred."
      }
    }
  }

  // Process successful prescription response (PORX_IN000006UK98)
  const xmlPrescription: XmlPrescription =
    xmlSoapBody.prescriptionClinicalViewResponse.PORX_IN000006UK98
      .ControlActEvent.subject.PrescriptionJsonQueryResponse.epsRecord

  logger.info("Successfully parsed Spine SOAP prescription data", {xmlPrescription})

  return {
    requestGroupDetails: parseRequestGroupDetails(xmlPrescription, logger),
    patientDetails: parsePatientDetails(xmlPrescription, logger),
    productLineItems: parseProductLineItems(xmlPrescription, logger),
    filteredHistory: parseFilteredHistory(xmlPrescription, logger),
    dispenseNotificationDetails: parseDispenseNotificationItems(xmlPrescription, logger)
  }
}

// ---------------------------- PATIENT DETAILS ------------------------------
/**
 * Parses patient details from the XML prescription.
 */
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
/**
 * Extracts and formats patient address from the XML data.
 */
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
/**
 * Parses prescription-level details from the XML data.
 */
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
    prescriptionStatus: padWithZeros(xmlPrescription.prescriptionStatus.toString(), 4),
    instanceNumber: xmlPrescription.instanceNumber
  })

  return {
    prescriptionId: xmlPrescription.prescriptionID,
    prescriptionTreatmentType: padWithZeros(xmlPrescription.prescriptionTreatmentType.toString(), 4),
    prescriptionType: padWithZeros(xmlPrescription.prescriptionType.toString(), 4),
    signedTime: xmlPrescription.signedTime,
    prescriptionTime: xmlPrescription.prescriptionTime,
    prescriptionStatus: padWithZeros(xmlPrescription.prescriptionStatus.toString(), 4),
    instanceNumber: xmlPrescription.instanceNumber,
    maxRepeats: xmlPrescription.maxRepeats ?? undefined,
    daysSupply: xmlPrescription.daysSupply,
    nominatedPerformer: xmlPrescription.nominatedPerformer ?? "",
    prescribingOrganization: xmlPrescription.prescribingOrganization ?? ""
  }
}

// ---------------------------- PRODUCT LINE ITEMS ---------------------------
/**
 * Parses product line items (medications) from the parent prescription.
 */
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
    const quantity = parentPrescription[quantityKey]?.toString() ?? ""
    const dosage = parentPrescription[dosageKey]?.toString() ?? ""

    // First, push everything (even if empty) into the array
    productLineItems.push({
      order: i,
      medicationName: productLineItem?.trim() ?? "",
      quantity: quantity.trim(),
      dosageInstructions: dosage.trim()
    })
  }

  // Filter out any product line items where all values are empty strings
  const filteredProductLineItems = productLineItems.filter(
    (item) => !(item.medicationName === "" && item.quantity === "" && item.dosageInstructions === "")
  )

  if (filteredProductLineItems.length === 0) {
    throw new Error("At least one valid product line item is required")
  }

  logger.info("Product line items parsed successfully", {productLineItems: filteredProductLineItems})

  return filteredProductLineItems
}

// ---------------------------- FILTERED HISTORY -----------------------------
/**
 * Parses filtered history of prescription events and returns the latest event details.
 */
const parseFilteredHistory = (xmlPrescription: XmlPrescription, logger: Logger): FilteredHistoryDetails => {
  const filteredHistoryItems: XmlFilteredHistory | Array<XmlFilteredHistory> = xmlPrescription.filteredHistory

  if (!filteredHistoryItems) {
    logger.warn("No filtered history found in prescription.")
    return {
      SCN: 0,
      sentDateTime: "",
      fromStatus: "",
      toStatus: "",
      message: "",
      agentPersonOrgCode: "",
      lineStatusChangeDict: undefined
    }
  }

  // Get the latest filtered history by the highest SCN
  const latestHistory = Array.isArray(filteredHistoryItems)
    ? filteredHistoryItems.reduce((prev, current) => (prev.SCN > current.SCN ? prev : current), filteredHistoryItems[0])
    : filteredHistoryItems

  // Ensure fields are valid (handle cases like "False" values)
  const fromStatus =
    latestHistory.fromStatus && latestHistory.fromStatus !== "False"
      ? padWithZeros(latestHistory.fromStatus.toString(), 4)
      : ""

  const toStatus =
    latestHistory.toStatus && typeof latestHistory.toStatus !== "boolean" // Ensure it's not `False`
      ? padWithZeros(latestHistory.toStatus.toString(), 4)
      : ""

  const message = latestHistory.message ? latestHistory.message.toString() : ""
  const agentPersonOrgCode = latestHistory.agentPersonOrgCode ? latestHistory.agentPersonOrgCode.toString() : ""

  // Ensure lineStatusChangeDict.line is always an array
  let lineStatusChangeDict
  if (latestHistory.lineStatusChangeDict && latestHistory.lineStatusChangeDict.line) {
    const lineItems = Array.isArray(latestHistory.lineStatusChangeDict.line)
      ? latestHistory.lineStatusChangeDict.line
      : [latestHistory.lineStatusChangeDict.line] // Wrap it in an array if it's an object

    lineStatusChangeDict = {
      line: lineItems.map((line) => ({
        order: line?.order ?? 0,
        id: line?.id ?? "",
        status: line?.status ?? "",
        fromStatus: line?.fromStatus ? padWithZeros(line.fromStatus.toString(), 4) : "",
        toStatus: line?.toStatus ? padWithZeros(line.toStatus.toString(), 4) : "",
        cancellationReason: line?.cancellationReason ?? undefined
      }))
    }
  }

  const parsedHistory: FilteredHistoryDetails = {
    SCN: latestHistory.SCN ?? 0,
    sentDateTime: latestHistory.timestamp ? latestHistory.timestamp.toString() : "",
    fromStatus,
    toStatus,
    message,
    agentPersonOrgCode,
    lineStatusChangeDict
  }

  logger.info("Filtered history parsed successfully", {parsedHistory})
  return parsedHistory
}

// ---------------------------- DISPENSE NOTIFICATION -----------------------------
/**
 * Parses dispense notification for each product line item and returns the dispense data.
 */
export const parseDispenseNotificationItems = (xmlPrescription: XmlPrescription, logger: Logger)
  : DispenseNotification => {
  const dispenseNotification = xmlPrescription?.dispenseNotification
  const parentPrescription = xmlPrescription?.parentPrescription
  const dispensingOrganization = xmlPrescription?.dispensingOrganization ?? ""
  const dispNotifToStatus = padWithZeros(xmlPrescription?.dispenseNotification?.dispNotifToStatus ?? "", 4)
  const dispenseNotifDateTime = xmlPrescription?.dispenseNotification?.dispenseNotifDateTime ?? ""

  const statusPrescription = padWithZeros(dispenseNotification?.statusPrescription ?? "", 4)
  const dispenseNotificationItems: Array<DispenseNotificationItem> = []

  if (!dispenseNotification || !parentPrescription) {
    logger.info("No dispense notification or parent prescription found.")
    return {
      statusPrescription,
      dispensingOrganization,
      dispNotifToStatus,
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
    dispNotifToStatus,
    dispenseNotifDateTime,
    dispenseNotificationItems
  }
}

// ---------------------------- ERROR HANDLING -------------------------------
/**
 * Parses error messages from the SOAP response.
 */
const parseErrorResponse = (responseXml: XmlResponse): string => {
  const xmlSoapEnvBody: XmlSoapBody | undefined =
    responseXml["SOAP:Envelope"]?.["SOAP:Body"] || responseXml["SOAP-ENV:Envelope"]?.["SOAP-ENV:Body"]
  if (!xmlSoapEnvBody) return "Unknown Error."

  const xmlError: XmlError | undefined = xmlSoapEnvBody.prescriptionClinicalViewResponse?.MCCI_IN010000UK13
    ?.acknowledgement?.acknowledgementDetail?.code

  return xmlError?.["@_displayName"] ?? "Unknown Error"
}
