import {describe, it, expect} from "@jest/globals"
import {
  mapGender,
  mapMedicationDispenseType,
  mapMedicationRequestStatusReason,
  formatBirthDate
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

  // Test for formatting birth date
  it("should format birth date correctly", () => {
    expect(formatBirthDate("19480430")).toBe("1948-04-30")
    expect(formatBirthDate("20240101")).toBe("2024-01-01")
    expect(formatBirthDate("")).toBe("")
    expect(formatBirthDate("INVALID")).toBe("")
  })
})
