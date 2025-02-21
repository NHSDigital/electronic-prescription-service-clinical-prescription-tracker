import {DOMParser} from "@xmldom/xmldom"

/**
 * Define the type for FhirResponseParams based on the extracted data from the Spine response
 */
export interface FhirResponseParams {
  acknowledgementTypeCode: string

  /**
   * Patient
   */
  birthDate: string // Patient.gender
  gender: ("male" | "female" | "other" | "unknown") | undefined
  given: string // Patient.name.given
  family: string // Patient.name.family
  prefix: string // Patient.name.prefix
  suffix: string // Patient.name.suffix
  nhsNumber: string // Patient.identifier.value

  /**
   * RequestGroup
   */
  // Prescription Information Banner
  prescriptionID: string // RequestGroup.groupIdentifier
  statusCode: string // RequestGroup.extension.businessStatus
  typeCode: string // RequestGroup.code
  instanceNumber: number // RequestGroup.extension.numberOfRepeatsIssued
  maxRepeats: number // RequestGroup.extension.numberOfRepeatsAllowed
  daysSupply: string // RequestGroup.action.timing (this is a separate action from dispense)
  // Dispenser
  organizationSummaryObjective: string //RequestGroup.action.participant

  /**
   * MedicationRequest
   */
  // Prescribed Items
  productLineItems: Array<{
    medicationName: string // MedicationRequest.medicationCodeableConcept
    quantity: string // MedicationRequest.dispenseRequest.quantity.value
    dosageInstructions: string // MedicationRequest.dosageInstruction
  }>

  // Prescriber Information
  prescriptionType: string // MedicationRequest.courseOfTherapyType

  /**
   * Task
   */
  // Message History
  message: string // Task resources referencing the prescription from Task.groupIdentifier
  sentDateTime: string // Task.authoredOn
  newStatusCode: string // 	Task.businessStatus for current Task
  organizationName: string //Task.owner(.reference).identifier

  // Nominated Dispenser Information
  nominatedPerformer: string // RequestGroup.author
}

/**
 * Maps the integer gender code from the Spine response to a FHIR-compatible string.
 */
const mapGender = (genderCode: number): "male" | "female" | "other" | "unknown" => {
  switch (genderCode) {
    case 1:
      return "male"
    case 2:
      return "female"
    case 3:
      return "other"
    default:
      return "unknown"
  }
}

/**
 * Converts the numeric birth date (YYYYMMDD) into a string formatted as YYYY-MM-DD.
 */
const formatBirthDate = (birthDate: string): string => {
  if (!birthDate || isNaN(Number(birthDate))) return ""
  const dateStr = birthDate.trim()
  return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
}

/**
 * Extracts prescription data from the Spine SOAP response
 */
export function extractPrescriptionData(spineResponseData: string) {
  const parser = new DOMParser()
  const soap_response = parser.parseFromString(spineResponseData, "text/xml")

  // Extract the typeCode from the <acknowledgement> element
  const acknowledgementElement = soap_response.getElementsByTagName("acknowledgement").item(0)
  const acknowledgementTypeCode = acknowledgementElement?.getAttribute("typeCode")

  // Extract product items from the lineItem elements of the SOAP response
  const productLineItems = Array.from(
    soap_response.getElementsByTagName("parentPrescription")
  ).flatMap((parentPrescriptionElement) => {
    const lineItems = []

    // Loop through up to 5 line items (if they exist)
    for (let i = 1; i <= 5; i++) { // Assuming a maximum of 5 items per prescription
      const productName = parentPrescriptionElement.getElementsByTagName(`productLineItem${i}`)?.item(0)?.textContent
      const quantity = parentPrescriptionElement.getElementsByTagName(`quantityLineItem${i}`)?.item(0)?.textContent
      const dosage = parentPrescriptionElement.getElementsByTagName(`dosageLineItem${i}`)?.item(0)?.textContent

      // Add line item to the list if a product name exists
      if (productName) {
        lineItems.push({
          medicationName: productName,
          quantity: quantity || "0",
          dosageInstructions: dosage || "Unknown dosage"
        })
      }
    }

    return lineItems
  })

  // Extract filteredHistory elements (Message History)
  const filteredHistoryItems = Array.from(soap_response.getElementsByTagName("filteredHistory")).map(item => ({
    SCN: parseInt(item.getElementsByTagName("SCN")?.item(0)?.textContent || "0", 10),
    message: item.getElementsByTagName("message")?.item(0)?.textContent || "",
    sentDateTime: item.getElementsByTagName("timestamp")?.item(0)?.textContent || "",
    newStatusCode: item.getElementsByTagName("toStatus")?.item(0)?.textContent || "",
    organizationName: item.getElementsByTagName("agentPersonOrgCode")?.item(0)?.textContent || ""
  }))

  // Find the filteredHistory item with the highest SCN
  const latestHistory = filteredHistoryItems.reduce((latest, current) => {
    return current.SCN > latest.SCN ? current : latest
  }, filteredHistoryItems[0] || {})

  return {
    /* eslint-disable max-len */
    /**
     * Elements are grouped in line with the documentation on the Confluence
     * https://nhsd-confluence.digital.nhs.uk/display/APIMC/%27To-be%27+Clinical+Prescription+Tracker+Data+Items+with+EPS+FHIR+Translation
     */
    // The acknowledgement element's typeCode
    acknowledgementTypeCode: acknowledgementTypeCode || "",

    // Patient
    prefix: soap_response.getElementsByTagName("prefix").item(0)?.textContent || "",
    suffix: soap_response.getElementsByTagName("suffix").item(0)?.textContent || "",
    given: soap_response.getElementsByTagName("given").item(0)?.textContent || "",
    family: soap_response.getElementsByTagName("family").item(0)?.textContent || "",
    nhsNumber: soap_response.getElementsByTagName("patientNhsNumber").item(0)?.textContent || "",
    birthDate: formatBirthDate(soap_response.getElementsByTagName("birthTime").item(0)?.textContent || ""),
    gender: mapGender(parseInt(soap_response.getElementsByTagName("administrativeGenderCode").item(0)?.textContent || "0", 10)) as "male" | "female" | "other" | "unknown",

    // Prescription Information Banner
    prescriptionID: soap_response.getElementsByTagName("prescriptionID").item(0)?.textContent || "",
    statusCode: soap_response.getElementsByTagName("prescriptionStatus").item(0)?.textContent || "",
    typeCode: soap_response
      .getElementsByTagName("prescriptionTreatmentType")
      .item(0)?.textContent || "",
    instanceNumber: parseInt(soap_response.getElementsByTagName("instanceNumber").item(0)?.textContent || "0", 10),
    maxRepeats: parseInt(soap_response.getElementsByTagName("maxrepeats").item(0)?.textContent || "0", 10),

    daysSupply: soap_response.getElementsByTagName("daysSupply").item(0)?.textContent || "",

    // Dispenser Information
    organizationSummaryObjective: soap_response
      .getElementsByTagName("dispensingOrganization").item(0)?.textContent || "",

    // Prescribed Medication Items
    productLineItems,

    // Prescriber Information
    prescriptionType: soap_response.getElementsByTagName("prescriptionType").item(0)?.textContent || "",

    // Message History (Task Details)
    message: latestHistory.message,
    sentDateTime: latestHistory.sentDateTime,
    newStatusCode: latestHistory.newStatusCode,
    organizationName: latestHistory.organizationName,

    // Nominated Dispenser Information
    nominatedPerformer: soap_response.getElementsByTagName("nominatedPerformer").item(0)?.textContent || ""

  }
}
