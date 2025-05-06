import {Logger} from "@aws-lambda-powertools/logger"
import {Prescription} from "@cpt-common/common-types/prescription"
import {INTENT_MAP, GENDER_MAP, PRESCRIPTION_STATUS_MAP} from "@cpt-common/common-types/fhir"
import {
  ClinicalViewPatientType,
  ClinicalViewRequestGroupType,
  PrescriptionStatusExtensionType,
  MedicationRepeatInformationExtensionType
} from "@cpt-common/common-types/schema"
import {
  Address,
  Extension,
  HumanName,
  Patient,
  RequestGroup
} from "fhir/r4"
import {randomUUID} from "crypto"

export const generateFhirResponse = (
  prescription: Prescription, logger: Logger): RequestGroup & ClinicalViewRequestGroupType => {
  logger.info("")
  // generate a UUID for the patient resource for other resources to reference
  const patientUuid = randomUUID()

  const responseRequestGroup: RequestGroup & ClinicalViewRequestGroupType = {
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
  const patientName: HumanName & ClinicalViewPatientType["name"][0] = {
    ...(prescription.prefix ? {prefix: [prescription.prefix]}: {}),
    ...(prescription.suffix ? {suffix: [prescription.suffix]}: {}),
    ...(prescription.given ? {given: [prescription.given]}: {}),
    ...(prescription.family ? {family: prescription.family}: {})
  }

  const line = prescription.address.line
  const postalCode = prescription.address.postalCode
  const patientAddress: Address & ClinicalViewPatientType["address"] = line.length || postalCode ? [{
    line,
    ...(postalCode ? {postalCode}: {}),
    text: [...line, ...[postalCode ? [postalCode]: []]].join(", "),
    type: "both",
    use: "home"
  }] : []

  const patient: Patient & ClinicalViewPatientType = {
    resourceType: "Patient",
    id: patientUuid,
    identifier: [{
      system: "https://fhir.nhs.uk/Id/nhs-number",
      value: prescription.nhsNumber
    }],
    name: [...(Object.keys(patientName).length ? [patientName]: [])], // TODO: this should not be included if empty
    birthDate: prescription.birthDate,
    gender: prescription.gender ? GENDER_MAP[prescription.gender] : "unknown",
    address: patientAddress //TODO: should this prop be fully optional
  }
  responseRequestGroup.contained.push(patient)

  // Generate RG extensions
  // Generate Prescription Status extension
  const prescriptionStatusExtension: Extension & PrescriptionStatusExtensionType = {
    url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-PrescriptionStatusHistory",
    extension: [{
      url: "status",
      valueCoding: {
        system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
        code: prescription.status,
        display: PRESCRIPTION_STATUS_MAP[prescription.status]
      }
    }]
  }
  responseRequestGroup?.extension?.push(prescriptionStatusExtension)

  // Generate Repeat information extension
  const repeatInformationExtension: Extension & MedicationRepeatInformationExtensionType = {
    url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-RepeatInformation",
    extension: [
      {
        url: "numberOfRepeatsIssued",
        valueInteger: prescription.issueNumber
      },
      ...(prescription.issueNumber ? [{
        url: "numberOfRepeatsAllowed",
        valueInteger: prescription.issueNumber
      }] as MedicationRepeatInformationExtensionType["extension"] : [])
    ]
  }
  responseRequestGroup?.extension?.push(repeatInformationExtension)

  return responseRequestGroup
}

/* TODO: NEXT WEEK
- Continue FHIR
- What to do about common types / consts / schema when interdependent?, single or multiple common modules?
*/
