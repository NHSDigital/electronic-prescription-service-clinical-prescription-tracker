import {expect, describe, it} from "@jest/globals"
import {mapMedicationRequest} from "../src/utils/fhirMapper"
import {FhirResponseParams} from "../src/utils/fhirMapper"

describe("MedicationRequest Mapper", () => {
  it("Correctly maps MedicationRequest from extracted data", () => {
    const extractedData: FhirResponseParams = {
      acknowledgementTypeCode: "AA",
      prescriptionId: "9AD427-A83008-2E461K",
      prescriptionType: "0101",
      prescriptionStatus: "0002",
      prescriptionTreatmentType: "0001",
      productLineItems: [
        {product: "Amoxicillin", quantity: "30", dosage: "Take one capsule three times a day"},
        {product: "Co-codamol", quantity: "20", dosage: "Take one tablet twice a day"}
      ]
    }

    const medicationRequest = mapMedicationRequest(extractedData)

    // Ensure medicationCodeableConcept is defined and contains the expected coding
    expect(medicationRequest.medicationCodeableConcept).toBeDefined()
    expect(medicationRequest.medicationCodeableConcept?.coding?.[0]).toHaveProperty("code", "Amoxicillin")

    // Ensure dispenseRequest is defined and contains the correct quantity sum
    expect(medicationRequest.dispenseRequest).toBeDefined()
    expect(medicationRequest.dispenseRequest?.quantity?.value).toBe(50) // Summed quantity from all medications

    // Check the dosageInstruction field
    expect(medicationRequest.dosageInstruction?.[0]).toHaveProperty("text", "Take one capsule three times a day")
  })

  it("Handles missing product items data", () => {
    const extractedData: FhirResponseParams = {
      acknowledgementTypeCode: "AA",
      prescriptionId: "9AD427-A83008-2E461K",
      prescriptionType: "0101",
      prescriptionStatus: "0002",
      prescriptionTreatmentType: "0001",
      productLineItems: []
    }

    const medicationRequest = mapMedicationRequest(extractedData)

    // Ensure medicationCodeableConcept is defined and contains a default value
    expect(medicationRequest.medicationCodeableConcept).toBeDefined()
    expect(medicationRequest.medicationCodeableConcept?.coding?.[0]).toHaveProperty("code", "Unknown")

    // Ensure dispenseRequest is undefined when there are no medications
    expect(medicationRequest.dispenseRequest).toBeUndefined()

    // Ensure dosageInstruction is an empty array
    expect(medicationRequest.dosageInstruction).toBeDefined()
    expect(medicationRequest.dosageInstruction?.[0]).toHaveProperty("text", "Unknown dosage")
  })
})
