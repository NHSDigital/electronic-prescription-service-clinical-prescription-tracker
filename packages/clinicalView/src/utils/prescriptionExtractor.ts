import {DOMParser} from "@xmldom/xmldom"

export function extractPrescriptionData(spineResponseData: string) {
  const parser = new DOMParser()
  const soap_response = parser.parseFromString(spineResponseData, "text/xml")

  // Extract <acknowledgement> element
  const acknowledgementElement = soap_response.getElementsByTagName("acknowledgement").item(0)

  return {
    acknowledgement: acknowledgementElement || null, // Ensure it's either an Element or null
    prescriptionId: soap_response.getElementsByTagName("prescriptionID").item(0)?.textContent || "",
    prescriptionType: soap_response.getElementsByTagName("prescriptionType").item(0)?.textContent || "",
    prescriptionStatus: soap_response.getElementsByTagName("prescriptionStatus").item(0)?.textContent || "",
    prescriptionTreatmentType: soap_response
      .getElementsByTagName("prescriptionTreatmentType")
      .item(0)?.textContent || ""
  }
}
