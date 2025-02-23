/**
 * Maps the integer gender code from the Spine response to a FHIR-compatible string.
 */
export const mapGender = (genderCode: number): "male" | "female" | "other" | "unknown" => {
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
 * Maps the medication dispense type code to its display value.
 */
export const mapMedicationDispenseType = (code: string): string => {
  const medicationDispenseTypeMap: Record<string, string> = {
    "0001": "Item fully dispensed",
    "0002": "Item not dispensed",
    "0003": "Item dispensed - partial",
    "0004": "Item not dispensed owing",
    "0005": "Item cancelled",
    "0006": "Expired",
    "0007": "Item to be dispensed",
    "0008": "Item with dispenser"
  }

  return medicationDispenseTypeMap[code] || "Unknown"
}

/**
 * Maps the medication request status reason code to its display value.
 */
export const mapMedicationRequestStatusReason = (code: string): string => {
  const medicationRequestStatusReasonMap: Record<string, string> = {
    "0001": "Prescribing Error",
    "0002": "Clinical contra-indication",
    "0003": "Change to medication treatment regime",
    "0004": "Clinical grounds",
    "0005": "At the Patients request",
    "0006": "At the Pharmacists request",
    "0007": "Notification of Death",
    "0008": "Patient deducted - other reason",
    "0009": "Patient deducted - registered with new practice"
  }

  return medicationRequestStatusReasonMap[code] || "Unknown"
}
