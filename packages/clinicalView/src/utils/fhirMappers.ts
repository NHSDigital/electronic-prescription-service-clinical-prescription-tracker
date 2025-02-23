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
