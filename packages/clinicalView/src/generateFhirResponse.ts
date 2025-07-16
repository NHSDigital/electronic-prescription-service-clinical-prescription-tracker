import {Logger} from "@aws-lambda-powertools/logger"
import {INTENT_MAP, PRESCRIPTION_STATUS_MAP, TreatmentType} from "@cpt-common/common-types/fhir"
import {
  MedicationRepeatInformationExtensionType,
  PendingCancellationExtensionType,
  PrescriptionStatusExtensionType
} from "@cpt-common/common-types/schema"
import {randomUUID, UUID} from "crypto"
import {
  Address,
  Bundle,
  BundleEntry,
  Extension,
  HumanName,
  MedicationDispense,
  MedicationRequest,
  Patient,
  PractitionerRole,
  RequestGroup,
  RequestGroupAction
} from "fhir/r4"
import {
  COURSE_OF_THERAPY_TYPE_MAP,
  GENDER_MAP,
  LINE_ITEM_STATUS_MAP,
  LINE_ITEM_STATUS_REASON_MAP,
  MEDICATION_REQUEST_STATUS_MAP,
  PERFORMER_SITE_TYPE_MAP,
  PRESCRIPTION_TYPE_MAP
} from "./fhirMaps"
import {Prescription} from "./parseSpineResponse"
import {HistoryAction, PrescriptionLineItemsAction, ReferenceAction} from "./schema/actions"
import {
  DispensingInformationExtensionType,
  PrescriptionTypeExtensionType,
  TaskBusinessStatusExtensionType
} from "./schema/extensions"
import {MedicationDispenseBundleEntryType} from "./schema/medicationDispense"
import {MedicationRequestBundleEntryType} from "./schema/medicationRequest"
import {PatientBundleEntryType, PatientType} from "./schema/patient"
import {PractitionerRoleBundleEntryType} from "./schema/practitionerRole"
import {RequestGroupBundleEntryType} from "./schema/requestGroup"
import {logger} from "./handler"
import {BundleType} from "./schema/bundle"

interface MedicationRequestResourceIds {
  [key: string]: UUID
}
interface MedicationDispenseResourceIds {
  [key: string]: Array<UUID>
}
interface ResourceIds {
  medicationRequest: MedicationRequestResourceIds
  medicationDispense?: MedicationDispenseResourceIds

}

export const generateFhirResponse = (prescription: Prescription, logger: Logger): BundleType => {
  logger.info("Generating the Bundle wrapper...")
  const responseBundle: Bundle & BundleType = {
    resourceType: "Bundle",
    type: "searchset",
    total: 1,
    entry: []
  }

  // Generate an ID (UUID) for the patient resource for others to reference
  const patientResourceId = randomUUID()

  logger.info("Generating RequestGroup...")
  const requestGroupResourceId = randomUUID()
  const requestGroup: BundleEntry<RequestGroup> & RequestGroupBundleEntryType = {
    fullUrl: `urn:uuid:${requestGroupResourceId}`,
    search: {
      mode: "match"
    },
    resource: {
      resourceType: "RequestGroup",
      id: requestGroupResourceId,
      identifier: [{
        system: "https://fhir.nhs.uk/Id/prescription-order-number",
        value: prescription.prescriptionId
      }],
      subject: {
        reference: `urn:uuid:${patientResourceId}`
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
      action: []
    }
  }

  logger.info("Generating RequestGroup extensions...")
  const requestGroupExtensions: Array<Extension> = generateRequestGroupExtensions(prescription)
  requestGroup.resource.extension?.push(...requestGroupExtensions)

  logger.info("Generating Patient resource...")
  const patient: PatientBundleEntryType = generatePatientResource(prescription, patientResourceId)
  responseBundle.entry.push(patient)

  logger.info("Generating MedicationRequest resources...")
  const medicationRequestResources: MedicationRequestResources = generateMedicationRequests(
    prescription, patientResourceId)
  const {prescriberPractitionerRole, medicationRequests, medicationRequestResourceIds} = medicationRequestResources
  responseBundle.entry.push(prescriberPractitionerRole, ...medicationRequests)

  const resourceIds: ResourceIds = {
    medicationRequest: medicationRequestResourceIds
  }

  logger.info("Generating MedicationDispense resources...")
  if (Object.keys(prescription.dispenseNotifications).length){
    const medicationDispenseResources :MedicationDispenseResources = generateMedicationDispenses(
      prescription, patientResourceId, medicationRequestResourceIds)
    const {dispenserPractitionerRole, medicationDispenses, medicationDispenseResourceIds} = medicationDispenseResources

    responseBundle.entry.push(dispenserPractitionerRole, ...medicationDispenses)
    resourceIds.medicationDispense = medicationDispenseResourceIds
  }

  logger.info("Generating prescription line items Action...")
  const prescriptionLineItemsAction = generatePrescriptionLineItemsAction(prescription, resourceIds.medicationRequest)
  requestGroup.resource.action.push(prescriptionLineItemsAction)

  logger.info("Generating history Action...")
  const historyAction = generateHistoryAction(prescription, resourceIds)
  requestGroup.resource.action.push(historyAction)

  responseBundle.entry.push(requestGroup)
  return responseBundle
}

const generateRequestGroupExtensions = (prescription: Prescription): Array<Extension> => {
  const extensions: Array<Extension> = []

  logger.info("Generating PrescriptionStatus extension...")
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

  logger.info("Generating MedicationRepeatInformation extension for non acute prescription...")
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

  logger.info("Generating prescription PendingCancellation extension...")
  const prescriptionPendingCancellationExtension: Extension & PendingCancellationExtensionType = {
    url: "https://fhir.nhs.uk/StructureDefinition/Extension-PendingCancellation",
    extension: [{
      url: "prescriptionPendingCancellation",
      valueBoolean: prescription.prescriptionPendingCancellation
    }]
  }
  extensions.push(prescriptionPendingCancellationExtension)

  logger.info("Generating PrescriptionType extensions...")
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

const generatePatientResource = (prescription: Prescription, patientResourceId: UUID): PatientBundleEntryType => {
  logger.info("Generating Patient name...")
  const patientName: HumanName & PatientType["name"] = [{
    ...(prescription.prefix ? {prefix: [prescription.prefix]}: {}),
    ...(prescription.suffix ? {suffix: [prescription.suffix]}: {}),
    ...(prescription.given ? {given: [prescription.given]}: {}),
    ...(prescription.family ? {family: prescription.family}: {})
  }]

  logger.info("Generating Patient address...")
  const line = prescription.address.line
  const postalCode = prescription.address.postalCode
  const patientAddress: Address & PatientType["address"] = line.length || postalCode ? [{
    ...(line.length ? {line} : {}),
    ...(postalCode ? {postalCode}: {}),
    text: [...line, ...(postalCode ? [postalCode]: [])].join(", "),
    type: "both",
    use: "home"
  }] : []

  const patient: BundleEntry<Patient> & PatientBundleEntryType = {
    fullUrl: `urn:uuid:${patientResourceId}`,
    search: {
      mode: "include"
    },
    resource:{
      resourceType: "Patient",
      id: patientResourceId,
      identifier: [{
        system: "https://fhir.nhs.uk/Id/nhs-number",
        value: prescription.nhsNumber
      }],
      ...(Object.keys(patientName[0]).length ? {name: patientName}: {}),
      birthDate: prescription.birthDate,
      gender: prescription.gender ? GENDER_MAP[prescription.gender] : "unknown",
      ...(patientAddress.length ? {address: patientAddress} : {})
    }
  }

  return patient
}

interface MedicationRequestResources {
  prescriberPractitionerRole: PractitionerRoleBundleEntryType,
  medicationRequests: Array<MedicationRequestBundleEntryType>,
  medicationRequestResourceIds: MedicationRequestResourceIds
}

const generateMedicationRequests = (
  prescription: Prescription, patientResourceId: UUID): MedicationRequestResources => {
  logger.info("Generating prescriber PractitionerRole resource...")
  const prescriberResourceId = randomUUID()
  const prescriberPractitionerRole: BundleEntry<PractitionerRole> & PractitionerRoleBundleEntryType = {
    fullUrl: `urn:uuid:${prescriberResourceId}`,
    search: {
      mode: "include"
    },
    resource: {
      resourceType: "PractitionerRole",
      id: prescriberResourceId,
      organization: {
        identifier: {
          system: "https://fhir.nhs.uk/Id/ods-organization-code",
          value: prescription.prescriberOrg
        }
      }
    }
  }

  const medicationRequests: Array<MedicationRequestBundleEntryType> = []
  const medicationRequestResourceIds: MedicationRequestResourceIds = {}
  // Generate a medication request resource for each line item
  for (const lineItem of Object.values(prescription.lineItems)){
    logger.debug("Generating DispensingInformation extension for line item...", {lineItemNo: lineItem.lineItemNo})
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

    logger.debug("Generating PendingCancellation extension for line item...", {lineItemNo: lineItem.lineItemNo})
    const lineItemPendingCancellationExtension: Extension & PendingCancellationExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-PendingCancellation",
      extension:[{
        url: "lineItemPendingCancellation",
        valueBoolean: lineItem.pendingCancellation
      }]
    }

    logger.info("Generating MedicationRequest for line item...", {lineItemNo: lineItem.lineItemNo})
    const medicationRequestResourceId = randomUUID()
    medicationRequestResourceIds[lineItem.lineItemNo] = medicationRequestResourceId

    const medicationRequest: BundleEntry<MedicationRequest> & MedicationRequestBundleEntryType= {
      fullUrl: `urn:uuid:${medicationRequestResourceId}`,
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationRequest",
        id: medicationRequestResourceId,
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: lineItem.lineItemId
        }],
        subject: {
          reference: `urn:uuid:${patientResourceId}`
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
          reference: `urn:uuid:${prescriberResourceId}`
        },
        ...(prescription.dispenserOrg ? {performer: {
          identifier: [{
            system: "https://fhir.nhs.uk/Id/ods-organization-code",
            value: prescription.dispenserOrg
          }]
        }} : {}),
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
          extension: [{
            url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PerformerSiteType",
            valueCoding: {
              system: "https://fhir.nhs.uk/CodeSystem/dispensing-site-preference",
              code: prescription.nominatedDisperserType,
              display: PERFORMER_SITE_TYPE_MAP[prescription.nominatedDisperserType]
            }
          }]
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
  dispenserPractitionerRole: PractitionerRoleBundleEntryType,
  medicationDispenses: Array<MedicationDispenseBundleEntryType>,
  medicationDispenseResourceIds: MedicationDispenseResourceIds
}

const generateMedicationDispenses = (prescription: Prescription, patientResourceId: UUID,
  medicationRequestResourceIds: MedicationRequestResourceIds): MedicationDispenseResources => {
  const medicationDispenses: Array<MedicationDispenseBundleEntryType> = []
  const medicationDispenseResourceIds: MedicationDispenseResourceIds = {}
  logger.info("Generating dispenser PractitionerRole resource...")
  const dispenserResourceId = randomUUID()
  const dispenserPractitionerRole: BundleEntry<PractitionerRole> & PractitionerRoleBundleEntryType = {
    fullUrl: `urn:uuid:${dispenserResourceId}`,
    search: {
      mode: "include"
    },
    resource:{
      resourceType: "PractitionerRole",
      id: dispenserResourceId,
      organization: {
        identifier: {
          system: "https://fhir.nhs.uk/Id/ods-organization-code",
          value: prescription.dispenserOrg as string
        }
      }
    }
  }

  logger.info("Generating TaskBusinessStatus extension...")
  const taskBusinessStatusExtension : Extension & TaskBusinessStatusExtensionType = {
    url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
    valueCoding: {
      system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
      code: prescription.status,
      display: PRESCRIPTION_STATUS_MAP[prescription.status]
    }
  }

  // Generate a medication dispense resource for each component of each line item of each dispense notification
  for (const dispenseNotification of Object.values(prescription.dispenseNotifications)){
    medicationDispenseResourceIds[dispenseNotification.dispenseNotificationId] = []
    for (const lineItem of Object.values(dispenseNotification.lineItems)){

      logger.info("Generating MedicationDispense resources for DN line item...", {
        dispenseNotificationId: dispenseNotification.dispenseNotificationId,
        lineItemNo: lineItem.lineItemNo
      })

      for (const component of lineItem.components){
        const medicationDispenseResourceId = randomUUID()
        medicationDispenseResourceIds[
          dispenseNotification.dispenseNotificationId].push(medicationDispenseResourceId)

        /* Some fields may be empty/undefined return them as is for partial DN scenarios */
        const medicationDispense: BundleEntry<MedicationDispense> & MedicationDispenseBundleEntryType= {
          fullUrl: `urn:uuid:${medicationDispenseResourceId}`,
          search: {
            mode: "include"
          },
          resource:{
            resourceType: "MedicationDispense",
            id: medicationDispenseResourceId,
            identifier: [{
              system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
              value: lineItem.lineItemId
            }],
            subject: {
              reference: `urn:uuid:${patientResourceId}`
            },
            status: dispenseNotification.isLastDispenseNotification ? "in-progress" : "unknown",
            performer: [{
              actor: {
                reference: `urn:uuid:${dispenserResourceId}`
              }
            }],
            type:{
              coding: [{
                system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
                code: lineItem.status,
                display: LINE_ITEM_STATUS_MAP[lineItem.status]
              }]
            },
            authorizingPrescription: [{
              reference: `urn:uuid:${medicationRequestResourceIds[lineItem.lineItemNo]}`
            }],
            medicationCodeableConcept: {
              text: component.itemName ?? ""
            },
            quantity: {
              value: component.quantity ? component.quantity : 0,
              unit: component.quantityForm ? component.quantityForm : ""
            },
            ...(component.dosageInstruction ? {dosageInstruction: [{text: component.dosageInstruction}]}: {}),
            extension: [
              taskBusinessStatusExtension
            ]
          }
        }
        medicationDispenses.push(medicationDispense)
      }
    }
  }

  return {dispenserPractitionerRole, medicationDispenses, medicationDispenseResourceIds}
}

const generatePrescriptionLineItemsAction = (prescription: Prescription, resourceIds: MedicationRequestResourceIds):
  RequestGroupAction & PrescriptionLineItemsAction => {
  logger.info("Generating Action for prescription line items...")
  const prescriptionLineItemsAction: RequestGroupAction & PrescriptionLineItemsAction = {
    title: "Prescription Line Items(Medications)",
    ...(prescription.daysSupply ? {timingTiming: {
      repeat: {
        frequency: 1,
        period: prescription.daysSupply,
        periodUnit: "d"
      }
    }} : {}),
    action:[]
  }

  // Generate a reference sub Action for each MedicationRequest
  for (const medicationRequestResourceId of Object.values(resourceIds)){
    const referenceAction: RequestGroupAction & ReferenceAction = {
      resource: {
        reference: `urn:uuid:${medicationRequestResourceId}`
      }
    }
    prescriptionLineItemsAction.action?.push(referenceAction)
  }

  return prescriptionLineItemsAction
}

const generateHistoryAction = (
  prescription: Prescription, resourceIds: ResourceIds): RequestGroupAction & HistoryAction => {

  logger.info("Generating Action for prescription history...")
  const historyAction: RequestGroupAction & HistoryAction = {
    title: "Prescription status transitions",
    action: []
  }

  // Generate a sub Action for each prescription history event
  const historyEvents = Object.values(prescription.history)
  for (const event of historyEvents){
    const referenceActions: Array<ReferenceAction> = []

    // Generate a reference sub Action of the event sub Action for each MedicationDispense
    let dispenseNotificationCoding
    if (event.isDispenseNotification && resourceIds.medicationDispense){
      logger.info("Generating reference Actions for MedicationDispenses...")
      const dispenseNotificationId = prescription.dispenseNotifications[event.internalId].dispenseNotificationId

      for (const medicationDispenseResourceId of resourceIds.medicationDispense[dispenseNotificationId]){
        const referenceAction: RequestGroupAction & ReferenceAction = {
          resource: {
            reference: `urn:uuid:${medicationDispenseResourceId}`
          }
        }
        referenceActions.push(referenceAction)
      }

      dispenseNotificationCoding = [{
        coding:[{
          system: "https://tools.ietf.org/html/rfc4122",
          code: dispenseNotificationId
        }]
      }] satisfies HistoryAction["action"][0]["code"]
    }

    logger.info("Generating sub Action for history event...")
    const eventAction: RequestGroupAction & HistoryAction["action"][0] = {
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
        ...(dispenseNotificationCoding ? dispenseNotificationCoding: [])
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
