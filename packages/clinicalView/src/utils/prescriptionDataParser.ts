import {DOMParser} from "@xmldom/xmldom"

/**
 * Define the type for FhirResponseParams based on the extracted data from the Spine response
 */
export interface FhirResponseParams {
  acknowledgementTypeCode: string

  // RequestGroup
  // Prescription Information Banner
  prescriptionID: string // RequestGroup.groupIdentifier
  statusCode: string // RequestGroup.extension.businessStatus
  typeCode: string // RequestGroup.code
  instanceNumber: string // RequestGroup.identifier
  maxRepeats: string // RequestGroup.extension.numberOfRepeatsAllowed
  daysSupply: string // RequestGroup.action.timing (this is a separate action from dispense)
  // Dispenser
  organizationSummaryObjective: string //RequestGroup.action.participant

  // MedicationRequest
  // Prescribed Items
  productLineItems: Array<{
    medicationName: string // MedicationRequest.medicationCodeableConcept
    quantity: string // MedicationRequest.dispenseRequest.quantity.value
    dosageInstructions: string // MedicationRequest.dosageInstruction
  }>

  // Prescriber Information
  prescriptionType: string // MedicationRequest.courseOfTherapyType

  // Task
  // Message History
  message: string // Task resources referencing the prescription from Task.groupIdentifier
  sentDateTime: string // Task.authoredOn
  newStatusCode: string // 	Task.businessStatus for current Task
  organizationName: string //Task.owner(.reference).identifier

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

  // Extract filteredHistory items
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
    // The acknowledgement element's typeCode
    acknowledgementTypeCode: acknowledgementTypeCode || "",

    // Prescription Information Banner
    prescriptionID: soap_response.getElementsByTagName("prescriptionID").item(0)?.textContent || "",
    statusCode: soap_response.getElementsByTagName("prescriptionStatus").item(0)?.textContent || "",
    typeCode: soap_response
      .getElementsByTagName("prescriptionTreatmentType")
      .item(0)?.textContent || "",
    instanceNumber: soap_response.getElementsByTagName("instanceNumber").item(0)?.textContent || "",
    maxRepeats: soap_response.getElementsByTagName("maxrepeats").item(0)?.textContent || "",
    daysSupply: soap_response.getElementsByTagName("daysSupply").item(0)?.textContent || "",

    // Dispenser Information
    organizationSummaryObjective: soap_response
      .getElementsByTagName("dispensingOrganization").item(0)?.textContent || "",

    // Prescribed Medication Items
    productLineItems,

    // Prescriber Information
    prescriptionType: soap_response.getElementsByTagName("prescriptionType").item(0)?.textContent || "",

    // Task Details
    message: latestHistory.message,
    sentDateTime: latestHistory.sentDateTime,
    newStatusCode: latestHistory.newStatusCode,
    organizationName: latestHistory.organizationName
  }
}
