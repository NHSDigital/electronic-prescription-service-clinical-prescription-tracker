import {randomUUID} from "crypto"
import {Logger} from "@aws-lambda-powertools/logger"
import {
  Bundle,
  BundleEntry,
  Extension,
  RequestGroup,
  Patient,
  HumanName
} from "fhir/r4"
import {Prescription} from "./parseSpineResponse"
import {BundleType} from "./schema/bundle"
import {PatientBundleEntryType, PatientType} from "./schema/patient"
import {RequestGroupBundleEntryType} from "./schema/requestGroup"
import {
  MedicationRepeatInformationExtensionType,
  PendingCancellationExtensionType,
  PrescriptionStatusExtensionType
} from "@cpt-common/common-types/schema"
import {INTENT_MAP, PRESCRIPTION_STATUS_MAP, TreatmentType} from "@cpt-common/common-types/fhir"

export const generateFhirResponse = (prescriptions: Array<Prescription>, logger: Logger): Bundle & BundleType => {
  // Generate the Bundle wrapper
  logger.info("Generating the Bundle wrapper...")
  const responseBundle: Bundle & BundleType = {
    resourceType: "Bundle",
    type: "searchset",
    total: prescriptions.length,
    entry: []
  }

  // Generate UUID for the Patient bundle entry for each RequestGroup to reference in subject
  const patientUuid = randomUUID()
  if (prescriptions.length > 0){
    // Generate the Patient bundle entry if there are prescriptions to process
    logger.info("Generating the Patient bundle entry...")
    if (responseBundle.entry?.length === 0){
      const patientName: HumanName & PatientType["name"] = [{
        ...(prescriptions[0].prefix ? {prefix: [prescriptions[0].prefix]} : {}),
        ...(prescriptions[0].suffix ? {suffix: [prescriptions[0].suffix]} : {}),
        ...(prescriptions[0].given ? {given: [prescriptions[0].given]} : {}),
        ...(prescriptions[0].family ? {family: prescriptions[0].family} : {})
      }]
      const patient: BundleEntry<Patient> & PatientBundleEntryType = {
        fullUrl: `urn:uuid:${patientUuid}`,
        search: {
          mode: "include"
        },
        resource: {
          resourceType: "Patient",
          identifier: [{
            system: "https://fhir.nhs.uk/Id/nhs-number",
            value: prescriptions[0].nhsNumber
          }],
          ...(Object.keys(patientName[0]).length ? {name: patientName}: {})
        }
      }
      responseBundle.entry?.push(patient)
    }
  }

  // For each prescription/issue generate a RequestGroup bundle entry
  for (const prescription of prescriptions){
    // Generate the RequestGroup bundle entry for the prescription/issue
    logger.info("Generating the RequestGroup bundle entry...", {prescriptionId: prescription.prescriptionId})
    const requestGroup:BundleEntry<RequestGroup> & RequestGroupBundleEntryType = {
      fullUrl: `urn:uuid:${randomUUID()}`,
      search: {
        mode: "match"
      },
      resource: {
        resourceType: "RequestGroup",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-number",
          value: prescription.prescriptionId
        }],
        subject: {
          reference: `urn:uuid:${patientUuid}`
        },
        status: prescription.deleted ? "completed" : "active",
        intent: INTENT_MAP[prescription.treatmentType],
        authoredOn: prescription.issueDate,
        extension: []
      }
    }

    // Generate the PrescriptionStatus extension
    logger.info("Generating the PrescriptionStatus extension...",
      {prescriptionId: prescription.prescriptionId})
    const prescriptionStatus: Extension & PrescriptionStatusExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-PrescriptionStatusHistory",
      extension: [{
        url: "status",
        valueCoding : {
          system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
          code: prescription.status,
          display: PRESCRIPTION_STATUS_MAP[prescription.status]
        }
      }]
    }
    requestGroup.resource?.extension?.push(prescriptionStatus)

    // Generate the RepeatInformation extension for non acute prescriptions/issues
    if (prescription.treatmentType !== TreatmentType.ACUTE){
      logger.info("Generating the RepeatInformation extension for non acute prescription...",
        {prescriptionId: prescription.prescriptionId})
      const medicationRepeatInformation: Extension & MedicationRepeatInformationExtensionType = {
        url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-RepeatInformation",
        extension: [
          {
            url: "numberOfRepeatsIssued",
            valueInteger: prescription.issueNumber
          }
        ]
      }
      if (prescription.maxRepeats){
        medicationRepeatInformation.extension?.push({
          url: "numberOfRepeatsAllowed",
          valueInteger: prescription.maxRepeats
        })
      }
      requestGroup.resource?.extension?.push(medicationRepeatInformation)
    }

    // Generate the PendingCancellation extension
    logger.info("Generating the PendingCancellation extension...", {prescriptionId: prescription.prescriptionId})
    const pendingCancellation: Extension & PendingCancellationExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-PendingCancellation",
      extension: [
        {
          url: "prescriptionPendingCancellation",
          valueBoolean: prescription.prescriptionPendingCancellation
        },
        {
          url: "lineItemPendingCancellation",
          valueBoolean: prescription.itemsPendingCancellation
        }
      ]
    }
    requestGroup.resource?.extension?.push(pendingCancellation)
    responseBundle.entry?.push(requestGroup)
  }

  return responseBundle
}
