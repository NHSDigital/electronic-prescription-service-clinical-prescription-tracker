import {randomUUID, UUID} from "crypto"
import {Logger} from "@aws-lambda-powertools/logger"
import {
  Address,
  Extension,
  HumanName,
  MedicationDispense,
  MedicationRequest,
  Patient,
  PractitionerRole,
  RequestGroup,
  RequestGroupAction
} from "fhir/r4"
import {Prescription} from "@cpt-common/common-types/prescription"
import {
  PrescriptionStatusExtensionType,
  MedicationRepeatInformationExtensionType,
  PendingCancellationExtensionType,
  PrescriptionTypeExtensionType,
  MedicationRequestType,
  DispensingInformationExtensionType,
  MedicationDispenseType,
  PractitionerRoleType,
  TaskBusinessStatusExtensionType,
  PerformerSiteTypeExtensionType
} from "@cpt-common/common-types/schema"
import {
  INTENT_MAP,
  GENDER_MAP,
  PRESCRIPTION_STATUS_MAP,
  TreatmentType,
  PRESCRIPTION_TYPE_MAP,
  MEDICATION_REQUEST_STATUS_MAP,
  LINE_ITEM_STATUS_REASON_MAP,
  LINE_ITEM_STATUS_MAP,
  COURSE_OF_THERAPY_TYPE_MAP,
  MEDICATION_DISPENSE_STATUS_MAP,
  PERFORMER_SITE_TYPE_MAP
} from "@cpt-common/common-types/fhir"
import {HistoryAction, ReferenceAction, RequestGroupType} from "./schema/requestGroup"
import {PatientType} from "./schema/patient"

interface MedicationRequestResourceIds {
  [key:string]: UUID
}
interface MedicationDispenseResourceIds {
  [key: string]: {
    [key: string]: UUID
  }
}
interface ResourceIds {
  medicationRequest: MedicationRequestResourceIds
  medicationDispense?: MedicationDispenseResourceIds

}

/* TODO: Logging */

export const generateFhirResponse = (prescription: Prescription, logger: Logger): RequestGroup & RequestGroupType => {
  logger.info("")

  // Generate an ID (UUID) for the patient resource for others to reference
  const patientResourceId = randomUUID()

  // Generate main request group resource
  const responseRequestGroup: RequestGroup & RequestGroupType = {
    resourceType: "RequestGroup",
    id: randomUUID(),
    identifier: [{
      system: "https://fhir.nhs.uk/Id/prescription-order-number",
      value: prescription.prescriptionId
    }],
    subject: {
      reference: `#${patientResourceId}`
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
  const patient: PatientType = generatePatientResource(prescription, patientResourceId)
  responseRequestGroup.contained.push(patient)

  // Generate request group extensions
  const requestGroupExtensions: Array<Extension> = generateRequestGroupExtensions(prescription)
  responseRequestGroup.extension?.push(...requestGroupExtensions)

  // Generate medication requests for line items
  const {prescriberPractitionerRole, medicationRequests, medicationRequestResourceIds}:
    MedicationRequestResources = generateMedicationRequests(prescription, patientResourceId)
  responseRequestGroup.contained.push(prescriberPractitionerRole, ...medicationRequests)
  const resourceIds: ResourceIds = {
    medicationRequest: medicationRequestResourceIds
  }

  // Generate medication dispenses for dispense notifications
  if (Object.keys(prescription.dispenseNotifications).length){
    const {dispenserPractitionerRole, medicationDispenses, medicationDispenseResourceIds
    }:MedicationDispenseResources = generateMedicationDispenses(
      prescription, patientResourceId, medicationRequestResourceIds)

    responseRequestGroup.contained.push(dispenserPractitionerRole, ...medicationDispenses)
    resourceIds.medicationDispense = medicationDispenseResourceIds
  }

  const historyAction = generateHistoryActions(prescription, resourceIds)
  responseRequestGroup.action.push(historyAction)

  return responseRequestGroup
}

const generatePatientResource = (prescription: Prescription, patientResourceId: UUID): PatientType => {
  // Generate name element
  const patientName: HumanName & PatientType["name"] = [{
    ...(prescription.prefix ? {prefix: [prescription.prefix]}: {}),
    ...(prescription.suffix ? {suffix: [prescription.suffix]}: {}),
    ...(prescription.given ? {given: [prescription.given]}: {}),
    ...(prescription.family ? {family: prescription.family}: {})
  }]

  // Generate address element
  const line = prescription.address.line
  const postalCode = prescription.address.postalCode
  const patientAddress: Address & PatientType["address"] = line.length || postalCode ? [{
    line,
    ...(postalCode ? {postalCode}: {}),
    text: [...line, ...[postalCode ? [postalCode]: []]].join(", "),
    type: "both",
    use: "home"
  }] : []

  // Generate patient resource
  const patient: Patient & PatientType = {
    resourceType: "Patient",
    id: patientResourceId,
    identifier: [{
      system: "https://fhir.nhs.uk/Id/nhs-number",
      value: prescription.nhsNumber
    }],
    ...(Object.keys(patientName).length ? {name: patientName}: {}),
    birthDate: prescription.birthDate, /* TODO - format */
    gender: prescription.gender ? GENDER_MAP[prescription.gender] : "unknown",
    ...(patientAddress.length ? {address: patientAddress} : {})
  }

  return patient
}

const generateRequestGroupExtensions = (prescription: Prescription): Array<Extension> => {
  const extensions: Array<Extension> = []

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
  extensions.push(prescriptionStatusExtension)

  // Generate repeat information extension
  if (prescription.treatmentType !== TreatmentType.ACUTE){
    const repeatInformationExtension: MedicationRepeatInformationExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-RepeatInformation",
      extension: [
        {
          url: "numberOfRepeatsIssued",
          valueInteger: prescription.issueNumber
        },
        ...(prescription.maxRepeats ? [{
          url: "numberOfRepeatsAllowed",
          valueInteger: prescription.maxRepeats as number
        } satisfies Extension & MedicationRepeatInformationExtensionType["extension"][0]] : [])
      ]
    }
    extensions.push(repeatInformationExtension)
  }

  // Generate pending cancellation extension
  /* TODO: should this be here? is this the correct format? */
  const prescriptionPendingCancellationExtension: Extension & PendingCancellationExtensionType = {
    url: "https://fhir.nhs.uk/StructureDefinition/Extension-PendingCancellation",
    extension: [{
      url: "prescriptionPendingCancellation",
      valueBoolean: prescription.prescriptionPendingCancellation
    }]
  }
  extensions.push(prescriptionPendingCancellationExtension)

  // Generate prescription type extension
  const prescriptionTypeExtension : Extension & PrescriptionTypeExtensionType = {
    url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionType",
    valueCoding: {
      system: "https://fhir.nhs.uk/CodeSystem/prescription-type",
      code: prescription.prescriptionType,
      display: PRESCRIPTION_TYPE_MAP[prescription.prescriptionType]
    }
  }
  extensions.push(prescriptionTypeExtension)

  return extensions
}

interface MedicationRequestResources {
  prescriberPractitionerRole: PractitionerRoleType,
  medicationRequests: Array<MedicationRequestType>,
  medicationRequestResourceIds: MedicationRequestResourceIds
}

const generateMedicationRequests = (
  prescription: Prescription, patientResourceId: UUID): MedicationRequestResources => {
  // Generate practitioner role resource for prescriber
  const prescriberPractitionerRole: PractitionerRole & PractitionerRoleType = {
    resourceType: "PractitionerRole",
    id: randomUUID(),
    organization: {
      identifier: {
        system: "https://fhir.nhs.uk/Id/ods-organization-code",
        value: prescription.prescriberOrg
      }
    }
  }

  const medicationRequests = []
  const medicationRequestResourceIds: {[key: string]: UUID} = {}
  // Generate medication request resources for line items
  for (const lineItem of Object.values(prescription.lineItems)){
    // Generate medication request extensions
    const dispensingInformationExtension: Extension & DispensingInformationExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-DispensingInformation",
      extension:[
        {
          url: "dispenseStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: lineItem.status,
            display: LINE_ITEM_STATUS_MAP[lineItem.status]
          }
        }
      ]
    }

    const lineItemPendingCancellationExtension: Extension & PendingCancellationExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-PendingCancellation",
      extension:[{
        url: "lineItemPendingCancellation",
        valueBoolean: lineItem.pendingCancellation
      }]
    }

    // Generate medication request
    const medicationRequestResourceId = randomUUID()
    medicationRequestResourceIds[lineItem.lineItemNo] = medicationRequestResourceId

    const medicationRequest: MedicationRequest & MedicationRequestType= {
      resourceType: "MedicationRequest",
      id: medicationRequestResourceId,
      identifier: [{
        system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
        value: lineItem.lineItemId
      }],
      subject: {
        reference: `#${patientResourceId}`
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
      requester: {
        reference: `#${prescriberPractitionerRole.id}`
      },
      groupIdentifier: {
        system: "https://fhir.nhs.uk/Id/prescription-order-number",
        value: prescription.prescriptionId
      },
      medicationCodeableConcept: {
        text: lineItem.itemName
      },
      courseOfTherapyType: {
        coding: [{
          system: "http://terminology.hl7.org/CodeSystem/medicationrequest-course-of-therapy",
          code: COURSE_OF_THERAPY_TYPE_MAP[prescription.treatmentType].code,
          display: COURSE_OF_THERAPY_TYPE_MAP[prescription.treatmentType].display
        }]
      },
      dispenseRequest: {
        quantity: {
          value: lineItem.quantity,
          unit: lineItem.quantityForm
        },
        ...(prescription.nominatedDispenserOrg ? {performer: {
          identifier: [{
            system: "https://fhir.nhs.uk/Id/ods-organization-code",
            value: prescription.nominatedDispenserOrg
          }]
        }} : {}),
        ...(prescription.daysSupply ? {expectedSupplyDuration :{
          system: "http://unitsofmeasure.org",
          value: prescription.daysSupply,
          code: "d",
          unit: "days"
        }} : {}),
        ...(prescription.nominatedDisperserType ? {extension: [{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PerformerSiteType",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/dispensing-site-preference",
            code: prescription.nominatedDisperserType,
            display: PERFORMER_SITE_TYPE_MAP[prescription.nominatedDisperserType]
          }
        } satisfies Extension & PerformerSiteTypeExtensionType]}: {})
      },
      dosageInstruction:[{
        text: lineItem.dosageInstruction ?? "" // dosage instruction can be missing, but is required in fhir
      }],
      substitution: {
        allowedBoolean: false
      },
      extension: [
        dispensingInformationExtension,
        lineItemPendingCancellationExtension
      ]
    }
    medicationRequests.push(medicationRequest)
  }

  return {
    prescriberPractitionerRole,
    medicationRequests,
    medicationRequestResourceIds
  }
}

interface MedicationDispenseResources {
  dispenserPractitionerRole: PractitionerRoleType,
  medicationDispenses: Array<MedicationDispenseType>,
  medicationDispenseResourceIds: MedicationDispenseResourceIds
}

const generateMedicationDispenses = (prescription: Prescription, patientResourceId: UUID,
  medicationRequestResourceIds: MedicationRequestResourceIds): MedicationDispenseResources => {

  const medicationDispenses: Array<MedicationDispenseType> = []
  const medicationDispenseResourceIds: MedicationDispenseResourceIds = {}
  // Generate practitioner role resource for dispenser
  const dispenserPractitionerRole: PractitionerRole & PractitionerRoleType = {
    resourceType: "PractitionerRole",
    id: randomUUID(),
    organization: {
      identifier: {
        system: "https://fhir.nhs.uk/Id/ods-organization-code",
        value: prescription.dispenserOrg as string
      }
    }
  }

  // Generate medication dispense extensions
  const taskBusinessStatusExtension : Extension & TaskBusinessStatusExtensionType = {
    url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
    valueCoding: {
      system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
      code: prescription.status,
      display: PRESCRIPTION_STATUS_MAP[prescription.status]
    }
  }

  /* TODO: do we need a prescriptionNonDispensingReason extension for a hl7 prescription level cancellation?*/

  for (const dispenseNotification of Object.values(prescription.dispenseNotifications)){
    for (const lineItem of Object.values(dispenseNotification.lineItems)){
      const medicationDispenseResourceId = randomUUID()

      medicationDispenseResourceIds[
        dispenseNotification.dispenseNotificationId][lineItem.lineItemNo] = medicationDispenseResourceId

      // Generate medication dispense
      const medicationDispense: MedicationDispense & MedicationDispenseType= {
        resourceType: "MedicationDispense",
        id: medicationDispenseResourceId,
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: lineItem.lineItemId
        }],
        subject: {
          reference: `#${patientResourceId}`
        },
        status: MEDICATION_DISPENSE_STATUS_MAP[lineItem.status],
        performer: [{
          actor: {
            reference: `#${dispenserPractitionerRole}`
          }
        }],
        authorizingPrescription: [{
          reference: `#${medicationRequestResourceIds[lineItem.lineItemNo]}`
        }],
        medicationCodeableConcept: {
          text: lineItem.itemName
        },
        quantity: {
          value: lineItem.quantity,
          unit: lineItem.quantityForm
        },
        ...(lineItem.dosageInstruction ? {dosageInstruction: [{
          text: lineItem.dosageInstruction ?? "" // dosage instruction can be missing, but is required in fhir
        }]}: {}),
        ...(prescription.daysSupply ? {daysSupply: {
          system: "http://unitsofmeasure.org",
          value: prescription.daysSupply,
          code: "d",
          unit: "days"
        }}: {}),
        extension: [
          taskBusinessStatusExtension
        ]
      }
      medicationDispenses.push(medicationDispense)
    }
  }

  return {dispenserPractitionerRole, medicationDispenses, medicationDispenseResourceIds}
}

const generateHistoryActions = (
  prescription: Prescription, resourceIds: ResourceIds): RequestGroupAction & HistoryAction => {

  // Generate main action for prescription history
  const historyAction: RequestGroupAction & HistoryAction = {
    id: randomUUID(),
    title: "Prescription status transitions",
    action: []
  }

  for (const event of Object.values(prescription.history)){
    // Generate reference sub sub actions
    const referenceActions: Array<ReferenceAction> = []
    // Generate sub sub action to reference relevant medication dispenses for dispense notification history events
    if (event.isDispenseNotification && resourceIds.medicationDispense){
      for (const medicationDispenseResourceId of Object.values(resourceIds.medicationDispense[event.messageId])){
        const referenceAction: RequestGroupAction & ReferenceAction = {
          resource: {
            reference : medicationDispenseResourceId
          }
        }
        referenceActions.push(referenceAction)
      }
    }

    // Generate sub sub action to reference medication requests for creation/upload history events
    if (event.isPrescriptionUpload) {
      for (const medicationRequestResourceId of Object.values(resourceIds.medicationRequest)){
        const referenceAction: RequestGroupAction & ReferenceAction = {
          resource: {
            reference : medicationRequestResourceId
          }
        }
        referenceActions.push(referenceAction)
      }
    }

    // Generate history event sub action
    const eventAction: RequestGroupAction & HistoryAction["action"][0] = {
      id: randomUUID(),
      title: event.message,
      timingDateTime: event.timestamp,
      code: [
        {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: event.newStatus,
            display: PRESCRIPTION_STATUS_MAP[event.newStatus]
          }]
        },
        ...(event.isDispenseNotification ? [{
          coding:[{
            system: "https://tools.ietf.org/html/rfc4122",
            code: event.messageId
          }]
        }] : [])
      ],
      participant: [{
        extension: [{
          // eslint-disable-next-line max-len
          url: "http://hl7.org/fhir/5.0/StructureDefinition/extension-RequestOrchestration.action.participant.typeReference",
          valueReference: {
            identifier: {
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: event.org
            }
          }
        }]
      }],
      ...(referenceActions.length ? {action: referenceActions} : {})
    }
    historyAction.action?.push(eventAction)
  }

  return historyAction
}
