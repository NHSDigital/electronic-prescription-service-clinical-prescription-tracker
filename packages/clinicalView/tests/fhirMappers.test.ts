import {describe, it, expect} from "@jest/globals"
import {
  mapGender,
  mapMedicationDispenseType,
  mapMedicationRequestStatusReason,
  mapTaskBusinessStatus,
  mapPrescriptionType,
  formatToISO8601,
  formatBirthDate,
  padWithZeros
} from "../src/utils/fhirMappers"

describe("fhirMappers", () => {
  // Test for gender mapping
  it("should map gender codes correctly", () => {
    expect(mapGender(1)).toBe("male")
    expect(mapGender(2)).toBe("female")
    expect(mapGender(3)).toBe("other")
    expect(mapGender(99)).toBe("unknown")
  })

  // Test for medication dispense type mapping
  it("should map medication dispense type codes correctly", () => {
    expect(mapMedicationDispenseType("0001")).toBe("Item fully dispensed")
    expect(mapMedicationDispenseType("0002")).toBe("Item not dispensed")
    expect(mapMedicationDispenseType("0008")).toBe("Item with dispenser")
    expect(mapMedicationDispenseType("9999")).toBe("Unknown")
  })

  // Test for medication request status reason (display to code)
  it("should map medication request status reason display values to their corresponding codes", () => {
    expect(mapMedicationRequestStatusReason("Prescribing Error")).toBe("0001")
    expect(mapMedicationRequestStatusReason("Clinical contra-indication")).toBe("0002")
    expect(mapMedicationRequestStatusReason("Change to medication treatment regime")).toBe("0003")
    expect(mapMedicationRequestStatusReason("Clinical grounds")).toBe("0004")
    expect(mapMedicationRequestStatusReason("At the Patients request")).toBe("0005")
    expect(mapMedicationRequestStatusReason("At the Pharmacists request")).toBe("0006")
    expect(mapMedicationRequestStatusReason("Notification of Death")).toBe("0007")
    expect(mapMedicationRequestStatusReason("Patient deducted - other reason")).toBe("0008")
    expect(mapMedicationRequestStatusReason("Patient deducted - registered with new practice")).toBe("0009")
    expect(mapMedicationRequestStatusReason("Unknown reason")).toBe("Unknown")
  })

  // Test for mapping prescription status codes
  it("should map prescription status codes to their display values", () => {
    expect(mapTaskBusinessStatus("0001")).toBe("To be Dispensed")
    expect(mapTaskBusinessStatus("0002")).toBe("With Dispenser")
    expect(mapTaskBusinessStatus("0006")).toBe("Dispensed")
    expect(mapTaskBusinessStatus("9999")).toBe("Unknown Task Business Status") // Unknown code
  })

  // Test for mapping prescription type codes
  it("should map prescription type codes to their display values", () => {
    expect(mapPrescriptionType("0101")).toBe("Primary Care Prescriber - Medical Prescriber")
    expect(mapPrescriptionType("0113"))
      .toBe("Primary Care Prescriber - Optometrist Independent/Supplementary prescriber")
    expect(mapPrescriptionType("0707")).toBe("Dental Prescribing - Dentist (Wales)")
    expect(mapPrescriptionType("9999")).toBe("Unknown prescription type") // Unknown code
  })

  // Test for formatting birth date
  it("should format date strings into ISO 8601 format", () => {
    expect(formatToISO8601("20250221000000")).toBe("2025-02-21T00:00:00.000Z")
    expect(formatToISO8601("20231231010101")).toBe("2023-12-31T01:01:01.000Z")
    expect(formatToISO8601("")).toBe("") // Empty input
    expect(formatToISO8601("2023123101")).toBe("") // Invalid format
    expect(formatToISO8601("INVALID")).toBe("") // Non-numeric
  })

  // Test for formatting birth date
  it("should format birth date correctly", () => {
    expect(formatBirthDate("19480430")).toBe("1948-04-30")
    expect(formatBirthDate("20240101")).toBe("2024-01-01")
    expect(formatBirthDate("")).toBe("")
    expect(formatBirthDate("INVALID")).toBe("")
  })

  // Test for padding numbers with leading zeros
  it("should pad numbers with leading zeros correctly", () => {
    expect(padWithZeros(5, 4)).toBe("0005")
    expect(padWithZeros("12", 4)).toBe("0012")
    expect(padWithZeros(123, 5)).toBe("00123")
    expect(padWithZeros("999", 6)).toBe("000999")
  })
})
