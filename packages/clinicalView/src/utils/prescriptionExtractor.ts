import {DOMParser} from "@xmldom/xmldom"

// Define the type for FhirResponseParams based on your data
export interface FhirResponseParams {
  acknowledgementTypeCode: string
  prescriptionID: string
  statusCode: string
  typeCode: string
  instanceNumber: string
  maxRepeats: string
  daysSupply: string
  dispensingOrganization: string
  prescriptionType: string
  productLineItems: Array<{
    product: string
    quantity: string
    dosage: string
    narrative: string
  }>
}

// Extracts data from the Spine response
export function extractPrescriptionData(spineResponseData: string) {
  const parser = new DOMParser()
  const soap_response = parser.parseFromString(spineResponseData, "text/xml")

  // Extract <acknowledgement> element
  const acknowledgementElement = soap_response.getElementsByTagName("acknowledgement").item(0)
  const acknowledgementTypeCode = acknowledgementElement?.getAttribute("typeCode")

  // Extract product items from lineItem elements
  const productLineItems = Array.from(soap_response.getElementsByTagName("parentPrescription")).map((lineItem) => {
    return {
      product: lineItem.getElementsByTagName("productLineItem1")?.item(0)?.textContent || "",
      quantity: lineItem.getElementsByTagName("quantityLineItem1")?.item(0)?.textContent || "0",
      dosage: lineItem.getElementsByTagName("dosageLineItem1")?.item(0)?.textContent || "Unknown dosage",
      narrative: lineItem.getElementsByTagName("narrativeLineItem1")?.item(0)?.textContent || "Unknown narrative"
    }
  })

  return {
    // The acknowledgement element type code
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

    // Dispenser
    dispensingOrganization: soap_response.getElementsByTagName("dispensingOrganization").item(0)?.textContent || "",

    // Prescriber information
    prescriptionType: soap_response.getElementsByTagName("prescriptionType").item(0)?.textContent || "",

    // Prescribed Items
    productLineItems
  }
}
