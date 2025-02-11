import {DOMParser} from "@xmldom/xmldom"

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
    acknowledgementTypeCode: acknowledgementTypeCode || "",
    prescriptionId: soap_response.getElementsByTagName("prescriptionID").item(0)?.textContent || "",
    prescriptionType: soap_response.getElementsByTagName("prescriptionType").item(0)?.textContent || "",
    prescriptionStatus: soap_response.getElementsByTagName("prescriptionStatus").item(0)?.textContent || "",
    prescriptionTreatmentType: soap_response
      .getElementsByTagName("prescriptionTreatmentType")
      .item(0)?.textContent || "",
    productLineItems
  }
}
