// tests/utils/fhirMappers.test.ts
import {describe, it, expect} from "@jest/globals"
import {
  mapGender,
  mapMedicationDispenseType,
  mapMedicationRequestStatusReason,
  formatBirthDate
} from "../src/utils/fhirMappers"

describe("fhirMappers", () => {
  it("should map gender codes correctly", () => {
    expect(mapGender(1)).toBe("male")
    expect(mapGender(2)).toBe("female")
    expect(mapGender(3)).toBe("other")
    expect(mapGender(99)).toBe("unknown")
  })

  it("should map medication dispense type codes correctly", () => {
    expect(mapMedicationDispenseType("0001")).toBe("Item fully dispensed")
    expect(mapMedicationDispenseType("0008")).toBe("Item with dispenser")
    expect(mapMedicationDispenseType("9999")).toBe("Unknown")
  })

  it("should map medication request status reason codes correctly", () => {
    expect(mapMedicationRequestStatusReason("0004")).toBe("Clinical grounds")
    expect(mapMedicationRequestStatusReason("0009")).toBe("Patient deducted - registered with new practice")
    expect(mapMedicationRequestStatusReason("9999")).toBe("Unknown")
  })

  it("should format birth date correctly", () => {
    expect(formatBirthDate("19480430")).toBe("1948-04-30")
    expect(formatBirthDate("20240101")).toBe("2024-01-01")
    expect(formatBirthDate("")).toBe("")
    expect(formatBirthDate("INVALID")).toBe("")
  })
})
