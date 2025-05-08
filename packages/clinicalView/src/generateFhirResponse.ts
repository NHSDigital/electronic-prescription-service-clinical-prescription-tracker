import {randomUUID} from "crypto"
import {Logger} from "@aws-lambda-powertools/logger"
import {
  Address,
  Extension,
  HumanName,
  MedicationRequest,
  Patient,
  RequestGroup
} from "fhir/r4"
import {Prescription} from "@cpt-common/common-types/prescription"
import {
  PrescriptionStatusExtensionType,
  MedicationRepeatInformationExtensionType,
  PendingCancellationExtensionType,
  PrescriptionTypeExtensionType,
  MedicationRequestType
} from "@cpt-common/common-types/schema"
import {
  INTENT_MAP,
  GENDER_MAP,
  PRESCRIPTION_STATUS_MAP,
  TreatmentType,
  PRESCRIPTION_TYPE_MAP,
  MEDICATION_REQUEST_STATUS_MAP,
  LINE_ITEM_STATUS_REASON_MAP
} from "@cpt-common/common-types/fhir"
import {RequestGroupType} from "./schema/requestGroup"
import {PatientType} from "./schema/patient"
import {text} from "stream/consumers"

export const generateFhirResponse = (
  prescription: Prescription, logger: Logger): RequestGroup & RequestGroupType => {
  logger.info("") // TODO: logs

  // generate a UUID for the patient resource for other resources to reference
  const patientUuid = randomUUID()

  const responseRequestGroup: RequestGroup & RequestGroupType = {
    resourceType: "RequestGroup",
    id: randomUUID(),
    identifier: [{
      system: "https://fhir.nhs.uk/Id/prescription-order-number",
      value: prescription.prescriptionId
    }],
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

  // Generate patient resource
  const patientName: HumanName & PatientType["name"] = [{
    ...(prescription.prefix ? {prefix: [prescription.prefix]}: {}),
    ...(prescription.suffix ? {suffix: [prescription.suffix]}: {}),
    ...(prescription.given ? {given: [prescription.given]}: {}),
    ...(prescription.family ? {family: prescription.family}: {})
  }]

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
    ...(Object.keys(patientName).length ? {name: patientName}: {}),
    birthDate: prescription.birthDate,
    gender: prescription.gender ? GENDER_MAP[prescription.gender] : "unknown",
    ...(patientAddress.length ? {address: patientAddress} : {})
  }
  responseRequestGroup.contained.push(patient)

  // Generate RG extensions
  // Generate prescription status extension
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
  responseRequestGroup.extension?.push(prescriptionStatusExtension)

  // Generate repeat information extension
  if (prescription.treatmentType !== TreatmentType.ACUTE){
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
    responseRequestGroup.extension?.push(repeatInformationExtension)
  }

  // Generate pending cancellation extension
  // TODO: should this be here?
  const prescriptionPendingCancellationExtension: Extension & PendingCancellationExtensionType = {
    url: "https://fhir.nhs.uk/StructureDefinition/Extension-PendingCancellation",
    extension: [{
      url: "prescriptionPendingCancellation",
      valueBoolean: prescription.prescriptionPendingCancellation
    }]
  }
  responseRequestGroup.extension?.push(prescriptionPendingCancellationExtension)

  // Generate prescription type extension
  const prescriptionTypeExtension : Extension & PrescriptionTypeExtensionType = {
    url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionType",
    valueCoding: {
      system: "https://fhir.nhs.uk/CodeSystem/prescription-type",
      code: prescription.prescriptionType,
      display: PRESCRIPTION_TYPE_MAP[prescription.prescriptionType]
    }
  }
  responseRequestGroup.extension?.push(prescriptionTypeExtension)

  // Generate medication dispense resources for DN's
  const medicationDispenseReferences: {[key: string]: string} = {}

  // Generate medication request resources for line items
  for (const lineItem of Object.values(prescription.lineItems)){
    const medicationRequest: MedicationRequest & MedicationRequestType= {
      resourceType: "MedicationRequest",
      id: randomUUID(),
      identifier: [{
        system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
        value: lineItem.lineItemId
      }],
      subject: {
        reference: `#${patientUuid}`
      },
      status: MEDICATION_REQUEST_STATUS_MAP[lineItem.status],
      ...(lineItem.cancellationReason ? {
        statusReason: {
          coding:[{
            system: "https://fhir.nhs.uk/CodeSystem/medicationrequest-status-reason",
            code: LINE_ITEM_STATUS_REASON_MAP[lineItem.cancellationReason],
            display: lineItem.cancellationReason
          }]
        }
      } : {}),
      intent: INTENT_MAP[prescription.treatmentType],
      medicationCodeableConcept: {
        text: lineItem.itemName
      },
      dispenseRequest: {
        quantity: {
          value: lineItem.quantity,
          unit: lineItem.quantityForm
        }
      },
      ...(lineItem.dosageInstruction ? {dosageInstructions:[{
        text: lineItem.dosageInstruction
      }]} : {} )
    }
    responseRequestGroup.contained.push(medicationRequest)
  }
  /*TODO:
  - extensions
  - authored on?
  - requester - prescriber?
  - groupIdentifier? - prescription id again?
  - courseOfTherapyType
  */

  return responseRequestGroup
}
