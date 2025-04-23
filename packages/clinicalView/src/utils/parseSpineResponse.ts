// import {XMLParser} from "fast-xml-parser"
// import {Logger} from "@aws-lambda-powertools/logger"
// import {
//   XmlResponse,
//   XmlSoapBody,
//   XmlPrescription,
//   XmlFilteredHistory,
//   XmlError,
//   RequestGroupDetails,
//   ProductLineItemDetails,
//   DispenseNotification,
//   DispenseNotificationItem,
//   FilteredHistoryDetails,
//   Prescription,
//   LineStatusChange
// } from "./types"
// import {padWithZeros} from "./fhirMappers"
// import {ServiceError} from "@cpt-common/common-types"

// export interface ParsedSpineResponse {
//   prescription?: Prescription
//   spineError?: ServiceError
// }

// export const parseSpineResponse = (spineResponse: string, logger: Logger): ParsedSpineResponse => {
//   const xmlParser = new XMLParser({ignoreAttributes: false})
//   const xmlResponse = xmlParser.parse(spineResponse) as XmlResponse

//   logger.info("Parsing XML SOAP response from Spine...", {xmlResponse})

//   // Handle potential variations in SOAP envelope naming
//   const xmlSoapBody: XmlSoapBody | undefined =
//     xmlResponse["SOAP:Envelope"]?.["SOAP:Body"] || xmlResponse["SOAP-ENV:Envelope"]?.["SOAP-ENV:Body"]

//   if (!xmlSoapBody) {
//     logger.error("Invalid SOAP response: No SOAP Body found.")
//     return {
//       error: {
//         status: "500",
//         severity: "fatal",
//         description: "Invalid SOAP response format from Spine."
//       }
//     }
//   }

//   // Check for error response structure (MCCI_IN010000UK13 indicates an error)
//   if (xmlSoapBody.prescriptionClinicalViewResponse?.MCCI_IN010000UK13) {
//     const errorMessage: string = parseErrorResponse(xmlResponse)

//     if (errorMessage === "Prescription not found") {
//       logger.info("No prescriptions found.")
//       return {
//         error: {
//           status: "404",
//           severity: "error",
//           description: "The requested prescription resource could not be found."
//         }
//       }
//     }

//     logger.error("Spine SOAP error detected", {errorMessage})

//     return {
//       error: {
//         status: "500",
//         severity: "error",
//         description: errorMessage || "Unknown error occurred."
//       }
//     }
//   }

//   // Process successful prescription response (PORX_IN000006UK98)
//   const xmlPrescription: XmlPrescription =
//     xmlSoapBody.prescriptionClinicalViewResponse.PORX_IN000006UK98
//       .ControlActEvent.subject.PrescriptionJsonQueryResponse.epsRecord

//   logger.info("Successfully parsed Spine SOAP prescription data", {xmlPrescription})

//   return {
//     requestGroupDetails: parseRequestGroupDetails(xmlPrescription, logger),
//     patientDetails: parsePatientDetails(xmlPrescription, logger),
//     productLineItems: parseProductLineItems(xmlPrescription, logger),
//     filteredHistory: parseFilteredHistory(xmlPrescription, logger),
//     dispenseNotificationDetails: parseDispenseNotificationItems(xmlPrescription, logger)
//   }
// }

// // ---------------------------- PATIENT DETAILS ------------------------------
// /**
//  * Parses patient details from the XML prescription.
//  */
// export const parsePatientDetails = (xmlPrescription: XmlPrescription, logger: Logger): PatientDetails => {
//   const parentPrescription = xmlPrescription.parentPrescription

//   if (!parentPrescription) {
//     throw new Error("Parent prescription details are missing")
//   }

//   if (
//     !xmlPrescription.patientNhsNumber ||
//     !parentPrescription?.given ||
//     !parentPrescription?.family ||
//     !parentPrescription?.birthTime
//   ) {
//     logger.info("Missing required patient details", {
//       patientNhsNumber: xmlPrescription.patientNhsNumber ?? "Missing",
//       nhsNumber: xmlPrescription.patientNhsNumber.toString() ?? "Missing",
//       given: parentPrescription?.given ?? "Missing",
//       family: parentPrescription?.family ?? "Missing",
//       birthTime: parentPrescription?.birthTime ?? "Missing"
//     })
//   }

//   logger.info("Parent details parsed successfully", {
//     patientNhsNumber: xmlPrescription.patientNhsNumber,
//     nhsNumber: xmlPrescription.patientNhsNumber.toString(),
//     given: parentPrescription?.given,
//     family: parentPrescription?.family,
//     birthTime: parentPrescription?.birthTime
//   })

//   return {
//     nhsNumber: xmlPrescription.patientNhsNumber.toString(),
//     prefix: parentPrescription?.prefix ?? "",
//     given: parentPrescription?.given,
//     family: parentPrescription?.family,
//     suffix: parentPrescription?.suffix ?? "",
//     gender: parentPrescription?.administrativeGenderCode ?? undefined,
//     birthDate: parentPrescription?.birthTime.toString(),
//     address: parsePatientAddress(parentPrescription, logger)
//   }
// }

// // ---------------------------- PARSE PATIENT ADDRESS ------------------------------
// /**
//  * Extracts and formats patient address from the XML data.
//  */
// export const parsePatientAddress = (parentPrescription: XmlPrescription["parentPrescription"], logger: Logger) => {
//   // Check if any address-related fields exist in the parentPrescription
//   // If all address fields are missing, consider the address as not provided.
//   if (
//     !parentPrescription?.addrLine1 &&
//     !parentPrescription?.addrLine2 &&
//     !parentPrescription?.addrLine3 &&
//     !parentPrescription?.postalCode
//   ) {
//     logger.info("No address information provided for the patient.")
//     return undefined
//   }

//   const address = {
//     line: [
//       parentPrescription?.addrLine1,
//       parentPrescription?.addrLine2,
//       parentPrescription?.addrLine3
//     ].filter(Boolean) as Array<string>, // Filter out undefined/null values
//     city: parentPrescription?.city ?? undefined,
//     district: parentPrescription?.district ?? undefined,
//     postalCode: parentPrescription?.postalCode ?? undefined
//   }

//   logger.info("Patient address parsed successfully", {address})

//   return address
// }

// // ---------------------------- PRESCRIPTION DETAILS -------------------------
// /**
//  * Parses prescription-level details from the XML data.
//  */
// const parseRequestGroupDetails = (xmlPrescription: XmlPrescription, logger: Logger): RequestGroupDetails => {
//   if (
//     !xmlPrescription.prescriptionID ||
//     !xmlPrescription.prescriptionType.toString() ||
//     !xmlPrescription.prescriptionStatus ||
//     !xmlPrescription.instanceNumber) {
//     logger.info("Missing required prescription details", {
//       prescriptionID: xmlPrescription.prescriptionID ?? "Missing",
//       prescriptionType: xmlPrescription.prescriptionType.toString() ?? "Missing",
//       prescriptionStatus: xmlPrescription.prescriptionStatus ?? "Missing",
//       instanceNumber: xmlPrescription.instanceNumber ?? "Missing"
//     })
//   }

//   logger.info("Prescription details parsed successfully", {
//     prescriptionID: xmlPrescription.prescriptionID,
//     prescriptionType: padWithZeros(xmlPrescription.prescriptionType.toString(), 4),
//     prescriptionStatus: padWithZeros(xmlPrescription.prescriptionStatus.toString(), 4),
//     instanceNumber: xmlPrescription.instanceNumber
//   })

//   return {
//     prescriptionId: xmlPrescription.prescriptionID,
//     prescriptionTreatmentType: padWithZeros(xmlPrescription.prescriptionTreatmentType.toString(), 4),
//     prescriptionType: padWithZeros(xmlPrescription.prescriptionType.toString(), 4),
//     signedTime: xmlPrescription.signedTime,
//     prescriptionTime: xmlPrescription.prescriptionTime,
//     prescriptionStatus: padWithZeros(xmlPrescription.prescriptionStatus.toString(), 4),
//     instanceNumber: xmlPrescription.instanceNumber,
//     maxRepeats: xmlPrescription.maxRepeats ?? undefined,
//     daysSupply: xmlPrescription.daysSupply,
//     nominatedPerformer: xmlPrescription.nominatedPerformer ?? "",
//     prescribingOrganization: xmlPrescription.prescribingOrganization ?? ""
//   }
// }

// // ---------------------------- PRODUCT LINE ITEMS ---------------------------
// /**
//  * Parses product line items (medications) from the parent prescription.
//  */
// const parseProductLineItems = (xmlPrescription: XmlPrescription, logger: Logger): Array<ProductLineItemDetails> => {
//   const productLineItems: Array<ProductLineItemDetails> = []
//   const parentPrescription = xmlPrescription.parentPrescription

//   if (!parentPrescription) {
//     throw new Error("Parent prescription details are missing")
//   }

//   for (let i = 1; i <= 4; i++) {
//     const productLineItemKey = `productLineItem${i}` as keyof typeof parentPrescription
//     const quantityKey = `quantityLineItem${i}` as keyof typeof parentPrescription
//     const dosageKey = `dosageLineItem${i}` as keyof typeof parentPrescription

//     const productLineItem = parentPrescription[productLineItemKey] as string | undefined
//     const quantity = parentPrescription[quantityKey]?.toString() ?? ""
//     const dosage = parentPrescription[dosageKey]?.toString() ?? ""

//     // First, push everything (even if empty) into the array
//     productLineItems.push({
//       order: i,
//       medicationName: productLineItem?.trim() ?? "",
//       quantity: quantity.trim(),
//       dosageInstructions: dosage.trim()
//     })
//   }

//   // Filter out any product line items where all values are empty strings
//   const filteredProductLineItems = productLineItems.filter(
//     (item) => !(item.medicationName === "" && item.quantity === "" && item.dosageInstructions === "")
//   )

//   if (filteredProductLineItems.length === 0) {
//     throw new Error("At least one valid product line item is required")
//   }

//   logger.info("Product line items parsed successfully", {productLineItems: filteredProductLineItems})

//   return filteredProductLineItems
// }

// // ---------------------------- FILTERED HISTORY -----------------------------
// /**
//  * Parses filtered history of prescription events and returns the latest event details.
//  */
// const parseFilteredHistory = (xmlPrescription: XmlPrescription, logger: Logger): Array<FilteredHistoryDetails> => {
//   const filteredHistoryItems: XmlFilteredHistory | Array<XmlFilteredHistory> = xmlPrescription.filteredHistory

//   if (!filteredHistoryItems) {
//     logger.warn("No filtered history found in prescription.")
//     return []
//   }

//   // If only one history event exists, wrap it in an array
//   const filteredHistoryArray = Array.isArray(filteredHistoryItems) ? filteredHistoryItems : [filteredHistoryItems]

//   // Convert each filtered history entry into a standard object
//   const parsedHistories: Array<FilteredHistoryDetails> = filteredHistoryArray.map((history) => {
//     return {
//       SCN: history.SCN ?? 0,
//       sentDateTime: history.timestamp ? history.timestamp.toString() : "",
//       fromStatus: history.fromStatus ? padWithZeros(history.fromStatus.toString(), 4) : "",
//       toStatus: history.toStatus ? padWithZeros(history.toStatus.toString(), 4) : "",
//       message: history.message ? history.message.toString() : "",
//       agentPersonOrgCode: history.agentPersonOrgCode ? history.agentPersonOrgCode.toString() : "",
//       cancellationReason: history.cancellationReason ? history.cancellationReason.toString() : "",
//       lineStatusChangeDict: history.lineStatusChangeDict
//         ? {
//           line: Array.isArray(history.lineStatusChangeDict.line)
//             ? history.lineStatusChangeDict.line.map((line) => ({
//               order: line.order ?? 0,
//               id: line.id ?? "",
//               status: line.status ?? "",
//               fromStatus: line.fromStatus ? padWithZeros(line.fromStatus.toString(), 4) : "",
//               toStatus: line.toStatus ? padWithZeros(line.toStatus.toString(), 4) : "",
//               cancellationReason: line.cancellationReason ?? undefined
//             }))
//             : history.lineStatusChangeDict.line
//               ? [
//                 {
//                   order: (history.lineStatusChangeDict.line as LineStatusChange).order ?? 0,
//                   id: (history.lineStatusChangeDict.line as LineStatusChange).id ?? "",
//                   status: (history.lineStatusChangeDict.line as LineStatusChange).status ?? "",
//                   fromStatus: (history.lineStatusChangeDict.line as LineStatusChange).fromStatus
//                     ? padWithZeros((history.lineStatusChangeDict.line as LineStatusChange).fromStatus.toString(), 4)
//                     : "",
//                   toStatus: (history.lineStatusChangeDict.line as LineStatusChange).toStatus
//                     ? padWithZeros((history.lineStatusChangeDict.line as LineStatusChange).toStatus.toString(), 4)
//                     : "",
//                   cancellationReason: (history.lineStatusChangeDict.line as LineStatusChange).cancellationReason
//                     ?? undefined
//                 }
//               ]
//               : [] // Return an empty array if no valid line exists
//         }
//         : undefined
//     }
//   })

//   logger.info("Filtered history parsed successfully", {parsedHistories})
//   return parsedHistories
// }

// // ---------------------------- DISPENSE NOTIFICATION -----------------------------
// /**
//  * Parses dispense notification for each product line item and returns the dispense data.
//  */
// export const parseDispenseNotificationItems = (xmlPrescription: XmlPrescription, logger: Logger)
//   : DispenseNotification => {
//   // TODO: There can be multiple dispense notifications, so we need to handle that
//   const dispenseNotification = xmlPrescription?.dispenseNotification
//   const parentPrescription = xmlPrescription?.parentPrescription
//   const dispensingOrganization = xmlPrescription?.dispensingOrganization ?? ""
//   const dispNotifToStatus = padWithZeros(xmlPrescription?.dispenseNotification?.dispNotifToStatus ?? "", 4)
//   const dispenseNotifDateTime = xmlPrescription?.dispenseNotification?.dispenseNotifDateTime ?? ""

//   const statusPrescription = padWithZeros(dispenseNotification?.statusPrescription ?? "", 4)
//   const dispenseNotificationItems: Array<DispenseNotificationItem> = []

//   if (!dispenseNotification || !parentPrescription) {
//     logger.info("No dispense notification or parent prescription found.")
//     return {
//       statusPrescription,
//       dispensingOrganization,
//       dispNotifToStatus,
//       dispenseNotifDateTime,
//       dispenseNotificationItems
//     }
//   }

//   // Looping over 4 product line items dynamically
//   for (let i = 1; i <= 4; i++) {
//     const productLineItemKey = `productLineItem${i}` as keyof typeof parentPrescription
//     const quantityLineItemKey = `quantityLineItem${i}` as keyof typeof parentPrescription
//     const statusLineItemKey = `statusLineItem${i}` as keyof typeof dispenseNotification

//     const product = parentPrescription[productLineItemKey] as string | undefined
//     const quantity = parentPrescription[quantityLineItemKey]?.toString() ?? "0"
//     const status = padWithZeros(dispenseNotification[statusLineItemKey]?.toString(), 4) ?? ""

//     // We don't add cancelled items
//     if (product && status !== "0005") {
//       dispenseNotificationItems.push({
//         order: i,
//         medicationName: product,
//         quantity,
//         status
//       })
//     }
//   }

//   return {
//     statusPrescription,
//     dispensingOrganization,
//     dispNotifToStatus,
//     dispenseNotifDateTime,
//     dispenseNotificationItems
//   }
// }

// // ---------------------------- ERROR HANDLING -------------------------------
// /**
//  * Parses error messages from the SOAP response.
//  */
// const parseErrorResponse = (responseXml: XmlResponse): string => {
//   const xmlSoapEnvBody: XmlSoapBody | undefined =
//     responseXml["SOAP:Envelope"]?.["SOAP:Body"] || responseXml["SOAP-ENV:Envelope"]?.["SOAP-ENV:Body"]
//   if (!xmlSoapEnvBody) return "Unknown Error."

//   const xmlError: XmlError | undefined = xmlSoapEnvBody.prescriptionClinicalViewResponse?.MCCI_IN010000UK13
//     ?.acknowledgement?.acknowledgementDetail?.code

//   return xmlError?.["@_displayName"] ?? "Unknown Error"
// }
