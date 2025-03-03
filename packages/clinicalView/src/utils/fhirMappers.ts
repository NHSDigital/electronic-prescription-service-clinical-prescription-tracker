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
 * Maps the medication request status reason display value to its code.
 */
export const mapMedicationRequestStatusReason = (display: string): string => {
  const medicationRequestStatusReasonMap: Record<string, string> = {
    "Prescribing Error": "0001",
    "Clinical contra-indication": "0002",
    "Change to medication treatment regime": "0003",
    "Clinical grounds": "0004",
    "At the Patients request": "0005",
    "At the Pharmacists request": "0006",
    "Notification of Death": "0007",
    "Patient deducted - other reason": "0008",
    "Patient deducted - registered with new practice": "0009"
  }

  return medicationRequestStatusReasonMap[display] || "Unknown"
}

/**
 * Maps the prescription status code to its display value.
 */
export const mapTaskBusinessStatus = (code: string): string => {
  const taskBusinessStatusMap: Record<string, string> = {
    "0001": "To be Dispensed",
    "0002": "With Dispenser",
    "0003": "With Dispenser - Active",
    "0004": "Expired",
    "0005": "Cancelled",
    "0006": "Dispensed",
    "0007": "Not Dispensed"
  }

  return taskBusinessStatusMap[code] || "Unknown Task Business Status"
}

/**
 * Maps the prescription type code to its display value.
 */
export const mapPrescriptionType = (code: string): string => {
  const prescriptionTypeMap: Record<string, string> = {
    "0101": "Primary Care Prescriber - Medical Prescriber",
    "0104": "Primary Care Prescriber - Nurse Independent/Supplementary prescriber",
    "0105": "Primary Care Prescriber - Community Practitioner Nurse prescriber",
    "0108": "Primary Care Prescriber - Pharmacist Independent/Supplementary prescriber",
    "0113": "Primary Care Prescriber - Optometrist Independent/Supplementary prescriber",
    "0114": "Primary Care Prescriber - Podiatrist/Chiropodist Independent/Supplementary prescriber",
    "0116": "Primary Care Prescriber - Radiographer Independent/Supplementary prescriber",
    "0117": "Primary Care Prescriber - Physiotherapist Independent/Supplementary prescriber",
    "0124": "Primary Care Prescriber - Dietician Supplementary prescriber",
    "0125": "Primary Care Prescriber - Paramedic Independent/Supplementary prescriber",
    "0201": "Primary Care Prescriber - Medical Prescriber (Wales)",
    "0204": "Primary Care Prescriber - Nurse Independent/Supplementary prescriber (Wales)",
    "0205": "Primary Care Prescriber - Community Practitioner Nurse prescriber (Wales)",
    "0208": "Primary Care Prescriber - Pharmacist Independent/Supplementary prescriber (Wales)",
    "0213": "Primary Care Prescriber - Optometrist Independent/Supplementary prescriber (Wales)",
    "0214": "Primary Care Prescriber - Podiatrist/Chiropodist Independent/Supplementary (Wales)",
    "0216": "Primary Care Prescriber - Radiographer Independent/Supplementary prescriber (Wales)",
    "0217": "Primary Care Prescriber - Physiotherapist Independent/Supplementary prescriber (Wales)",
    "0224": "Primary Care Prescriber - Dietician Supplementary prescriber (Wales)",
    "0225": "Primary Care Prescriber - Paramedic Independent/Supplementary prescriber (Wales)",
    "0607": "Dental Prescribing - Dentist",
    "0707": "Dental Prescribing - Dentist (Wales)",
    "1001": "Outpatient Community Prescriber - Medical Prescriber",
    "1101": "Outpatient Pharmacy Prescriber - Medical Prescriber",
    "1201": "Outpatient Homecare Prescriber - Medical Prescriber"
  }

  return prescriptionTypeMap[code] || "Unknown prescription type"
}

/**
 * Converts a date string in the format YYYYMMDDHHMMSS to an ISO 8601 format.
 * @param dateStr - The input date string (e.g., "20250221000000")
 * @returns An ISO formatted string (e.g., "2025-02-21T00:00:00.000Z")
 */
export const formatToISO8601 = (dateStr: string): string => {
  if (!dateStr || dateStr.length !== 14) {
    console.warn("Invalid date format, returning current timestamp.")
    return "" // Return empty string if input is missing or invalid
  }

  const year = dateStr.substring(0, 4)
  const month = dateStr.substring(4, 6)
  const day = dateStr.substring(6, 8)
  const hour = dateStr.substring(8, 10)
  const minute = dateStr.substring(10, 12)
  const second = dateStr.substring(12, 14)

  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`).toISOString()
}

/**
 * Converts the numeric birth date (YYYYMMDD) into a string formatted as YYYY-MM-DD.
 */
export const formatBirthDate = (birthDate: string): string => {
  if (!birthDate || isNaN(Number(birthDate))) return ""
  return `${birthDate.slice(0, 4)}-${birthDate.slice(4, 6)}-${birthDate.slice(6, 8)}`
}

/**
 * Pads numeric values with leading zeros.
 */
export const padWithZeros = (value: number | string, length = 4): string => {
  return String(value).padStart(length, "0")
}
