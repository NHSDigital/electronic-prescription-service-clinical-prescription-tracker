import {expect, describe, it} from "@jest/globals"
import {mapMedicationRequest} from "../src/utils/fhirMapper"
import {FhirResponseParams} from "../src/utils/prescriptionExtractor"

describe("MedicationRequest Mapper", () => {
  it("Correctly maps MedicationRequest from extracted data", () => {
    const extractedData: FhirResponseParams = {
      acknowledgementTypeCode: "AA",
      prescriptionID: "9AD427-A83008-2E461K",
      statusCode: "0002",
      typeCode: "0001",
      instanceNumber: "1",
      maxRepeats: "",
      daysSupply: "28",
      organizationSummaryObjective: "TESTORG",
      prescriptionType: "0101",
      productLineItems: [
        {
          medicationName: "Amoxicillin",
          quantity: "30",
          dosageInstructions: "Take one capsule three times a day"
        },
        {
          medicationName: "Co-codamol",
          quantity: "20",
          dosageInstructions: "Take one tablet twice a day"
        }
      ]
    }

    // Map the extracted data to MedicationRequest objects
    const medicationRequests = mapMedicationRequest(extractedData)

    // Ensure medicationRequests is an array and has the correct number of elements
    expect(medicationRequests).toBeInstanceOf(Array)
    expect(medicationRequests.length).toBe(2) // There are 2 product line items, so 2 MedicationRequest objects

    // Check the properties of each MedicationRequest
    medicationRequests.forEach((medicationRequest, index) => {
      // Ensure medicationCodeableConcept is defined and contains the expected coding
      expect(medicationRequest.medicationCodeableConcept).toBeDefined()
      expect(
        medicationRequest.medicationCodeableConcept?.coding?.[0]
      ).toHaveProperty(
        "code",
        extractedData.productLineItems[index].medicationName
      )

      // Ensure dispenseRequest is defined and contains the correct quantity
      expect(medicationRequest.dispenseRequest).toBeDefined()
      expect(
        medicationRequest.dispenseRequest?.quantity?.value
      ).toBe(parseInt(extractedData.productLineItems[index].quantity))

      // Check the dosageInstruction field
      expect(medicationRequest.dosageInstruction?.[0]).toHaveProperty(
        "text",
        extractedData.productLineItems[index].dosageInstructions
      )
    })
  })

  it("Handles missing product items data", () => {
    const extractedData: FhirResponseParams = {
      acknowledgementTypeCode: "AA",
      prescriptionID: "9AD427-A83008-2E461K",
      statusCode: "0002",
      typeCode: "0001",
      instanceNumber: "1",
      maxRepeats: "",
      daysSupply: "28",
      organizationSummaryObjective: "TESTORG",
      prescriptionType: "0101",
      productLineItems: [] // No product items
    }

    // Map the extracted data to MedicationRequest objects
    const medicationRequests = mapMedicationRequest(extractedData)

    // Ensure medicationRequests is an empty array
    expect(medicationRequests).toBeInstanceOf(Array)
    expect(medicationRequests.length).toBe(0)

    // Ensure dispenseRequest and dosageInstruction are undefined when no product items exist
    expect(medicationRequests).toEqual([])
  })
})
