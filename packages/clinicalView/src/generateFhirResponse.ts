import {Logger} from "@aws-lambda-powertools/logger"
import {Prescription, INTENT_MAP} from "@cpt-common/common-types"
import {
  Address,
  HumanName,
  Patient,
  RequestGroup
} from "fhir/r4"
import {requestGroupType} from "./schemas/requestGroupSchema"
import {randomUUID} from "crypto"
import {PatientType} from "./schemas/patientSchema"
import {GENDER_MAP} from "@cpt-common/common-types"

export const generateFhirResponse = (prescription: Prescription, logger: Logger): RequestGroup & requestGroupType => {
  logger.info("")
  // generate a UUID for the patient resource for other resources to reference
  const patientUuid = randomUUID()

  const responseRequestGroup: RequestGroup & requestGroupType = {
    resourceType: "RequestGroup",
    id: randomUUID(),
    identifier: [
      {
        system: "https://fhir.nhs.uk/Id/prescription-order-number",
        value: prescription.prescriptionId
      }
    ],
    subject: {
      reference: `#${patientUuid}`
    },
    status: "active",
    intent: INTENT_MAP[prescription.treatmentType],
    author: {
      identifier: {
        system: "https://fhir.nhs.uk/Id/ods-organization-code",
        value: prescription.prescriberOrg
      }
    },
    authoredOn: prescription.issueDate,
    extension: [],
    action: [],
    contained: []
  }

  // Generate Patient Resource
  const patientName: HumanName & PatientType["name"][0] = {
    ...(prescription.prefix ? {prefix: [prescription.prefix]}: {}),
    ...(prescription.suffix ? {suffix: [prescription.suffix]}: {}),
    ...(prescription.given ? {given: [prescription.given]}: {}),
    ...(prescription.family ? {family: prescription.family}: {})
  }

  const line = prescription.address.line
  const postalCode = prescription.address.postalCode
  const patientAddress: Address & PatientType["address"] = line.length || postalCode ? [{
    line,
    ...(postalCode ? {postalCode}: {}),
    text: [...line, ...[postalCode ? [postalCode]: []]].join(", "),
    type: "both",
    use: "home"
  }] : []

  const patient: Patient & PatientType = {
    resourceType: "Patient",
    id: patientUuid,
    identifier: [{
      system: "https://fhir.nhs.uk/Id/nhs-number",
      value: prescription.nhsNumber
    }],
    name: [...(Object.keys(patientName).length ? [patientName]: [])], // TODO: should this property be fully optional?
    birthDate: "",
    gender: "unknown", // TODO: is this actually required or optional? use below or make it required/not undefined in the parse
    // ...(prescription.gender ? {gender: GENDER_MAP[prescription.gender]} : {}),
    address: patientAddress //TODO: should this prop be fully optional
  }
  responseRequestGroup.contained.push(patient)

  return responseRequestGroup
}
