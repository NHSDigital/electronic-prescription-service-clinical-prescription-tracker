import {randomUUID} from "crypto"
import {Logger} from "@aws-lambda-powertools/logger"
import {
  RequestGroup,
  Patient,
  MedicationRequest,
  MedicationDispense,
  Extension
} from "fhir/r4"
import {ParsedSpineResponse} from "../utils/types"
import {
  mapGender,
  mapMedicationDispenseType,
  mapMedicationRequestStatusReason,
  formatBirthDate
} from "./fhirMappers"

// Maps extracted data to FHIR RequestGroup response
export const generateFhirResponse = (prescriptions: Array<ParsedSpineResponse>, logger: Logger): RequestGroup => {
  logger.info("Generating the RequestGroup response...")

  // Generate UUID for Patient
  const patientUuid = "example-patient"

  // Generate the RequestGroup root resource
  const requestGroup: RequestGroup = {
    resourceType: "RequestGroup",
    id: "example-requestgroup",
    status: "active",
    identifier: [{
      system: "https://fhir.nhs.uk/Id/prescription-order-number",
      value: prescriptions[0].requestGroupDetails?.prescriptionId || ""
    }],
    intent: "reflex-order",
    author: {
      identifier: {
        system: "https://fhir.nhs.uk/Id/ods-organization-code",
        value: prescriptions[0].requestGroupDetails?.organizationSummaryObjective || ""
      }
    },
    authoredOn: new Date().toISOString(),
    subject: {reference: `#${patientUuid}`},
    extension: [],
    action: [],
    contained: []
  }

  prescriptions.forEach((prescription) => {
    // Generate Patient entry
    if (!requestGroup.contained?.some(entry => entry.resourceType === "Patient")) {
      logger.info("Adding Patient resource...")

      const patient: Patient = {
        resourceType: "Patient",
        id: patientUuid,
        identifier: [{system: "https://fhir.nhs.uk/Id/nhs-number", value: prescription.patientDetails?.nhsNumber}],
        name: [{
          prefix: [prescription.patientDetails?.prefix || ""],
          given: [prescription.patientDetails?.given || ""],
          family: prescription.patientDetails?.family || ""
        }],
        gender: mapGender(prescription.patientDetails?.gender ?? 0),
        birthDate: prescription.patientDetails?.birthDate
          ? formatBirthDate(prescription.patientDetails.birthDate)
          : undefined,
        address: prescription.patientDetails?.address
      }

      requestGroup.contained?.push(patient)
    }

    // Generate MedicationRequest entries
    prescription.productLineItems?.forEach(item => {
      logger.info("Adding MedicationRequest resource...")

      const medicationRequest: MedicationRequest = {
        resourceType: "MedicationRequest",
        id: `example-medicationrequest-${randomUUID()}`,
        status: "active",
        intent: "order",
        subject: {reference: `#${patientUuid}`},
        medicationCodeableConcept: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medication",
            code: item.medicationName,
            display: item.medicationName
          }]
        },
        dispenseRequest: {quantity: {value: parseInt(item.quantity, 10)}},
        dosageInstruction: [{text: item.dosageInstructions}],
        extension: []
      }
      requestGroup.contained?.push(medicationRequest)

      // Generate DispensingInformation extension
      logger.info("Adding DispensingInformation extension...")
      const dispenseStatusCode = "0008" // Mocked value - replace with actual logic
      const dispensingInformation: Extension = {
        url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-DispensingInformation",
        extension: [{
          url: "dispenseStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: dispenseStatusCode,
            display: mapMedicationDispenseType(dispenseStatusCode)
          }
        }]
      }
      medicationRequest?.extension?.push(dispensingInformation)

      // Generate PendingCancellations extension - Based on allowed dispense statuses
      const allowedPendingCancellationStatuses = ["0008", "0007", "0002"]
      const isPendingCancellation = allowedPendingCancellationStatuses.includes(dispenseStatusCode)

      if (isPendingCancellation) {
        logger.info(`Adding PendingCancellations extension because dispenseStatus is ${dispenseStatusCode}`)
        const cancellationReasonCode = "0004" // Mocked value - replace with actual logic
        const pendingCancellations: Extension = {
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-PendingCancellations",
          extension: [
            {
              url: "lineItemPendingCancellation",
              valueBoolean: true
            },
            {
              url: "cancellationReason",
              valueCoding: {
                system: "https://fhir.nhs.uk/CodeSystem/medicationrequest-status-reason",
                code: cancellationReasonCode,
                display: mapMedicationRequestStatusReason(cancellationReasonCode)
              }
            }
          ]
        }
        medicationRequest?.extension?.push(pendingCancellations)
      } else {
        logger.info(`Skipping PendingCancellations extension because dispenseStatus is ${dispenseStatusCode}`)
      }
    })

    // Generate MedicationDispense entries
    prescription.filteredHistory?.forEach(history => {
      logger.info("Adding MedicationDispense resource...")

      const medicationDispense: MedicationDispense = {
        resourceType: "MedicationDispense",
        id: `example-medicationdispense-${randomUUID()}`,
        status: "completed",
        authorizingPrescription: [{reference: `#${patientUuid}`}],
        quantity: {value: 1},
        dosageInstruction: [{text: history.message}]
      }

      requestGroup.contained?.push(medicationDispense)
    })

    // Add hardcoded extensions
    requestGroup.extension?.push({
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-RepeatInformation",
      extension: [
        {url: "numberOfRepeatsAllowed", valueInteger: 5}, // Adjust the logic for actual number
        {url: "numberOfRepeatsIssued", valueInteger: 2} // Adjust the logic for actual number
      ]
    })

    requestGroup.extension?.push({
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-PendingCancellations",
      extension: [
        {url: "prescriptionPendingCancellation", valueBoolean: false},
        {url: "lineItemPendingCancellation", valueBoolean: true}
      ]
    })

    requestGroup.extension?.push({
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory",
      extension: [{
        url: "status",
        valueCoding: {
          system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
          code: "0003", // Mocked value, map this value
          display: "With Dispenser - Active" // Mocked value, adjust the logic
        }
      }]
    })

    requestGroup.extension?.push({
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionType",
      valueCoding: {
        system: "https://fhir.nhs.uk/CodeSystem/prescription-type",
        code: "0101", // Mocked value, map this value
        display: "Primary Care Prescriber - Medical Prescriber" // Mocked value, adjust as needed
      }
    })

    // Add a hardcoded action object
    requestGroup.action?.push({
      title: "Prescription status transitions",
      action: [
        {
          title: "Prescription upload successful",
          timingTiming: {
            event: ["2025-02-24T05:30:00.494Z"],
            repeat: {
              frequency: 1,
              period: 20,
              periodUnit: "d"
            }
          },
          participant: {
            identifier: {
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: "A83008"
            }
          },
          code: [{
            coding: [{
              system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
              code: "0001",
              display: "To be Dispensed"
            }]
          }],
          action: [
            {
              resource: {
                reference: "#example-medicationrequest-1"
              }
            },
            {
              resource: {
                reference: "#example-medicationrequest-2"
              }
            }
          ]
        }
      ]
    })
  })

  logger.info("RequestGroup response generated successfully.")
  return requestGroup
}
