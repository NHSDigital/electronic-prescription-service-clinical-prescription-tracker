import {randomUUID} from "crypto"
import {Logger} from "@aws-lambda-powertools/logger"
import {
  RequestGroup,
  Patient,
  MedicationRequest,
  MedicationDispense
} from "fhir/r4"
import {ParsedSpineResponse} from "../utils/types"

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
      value: prescriptions[0].prescriptionDetails?.prescriptionId || ""
    }],
    intent: "reflex-order",
    author: {
      identifier: {
        system: "https://fhir.nhs.uk/Id/ods-organization-code",
        value: prescriptions[0].prescriptionDetails?.organizationSummaryObjective || ""
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
        gender: prescription.patientDetails?.gender,
        birthDate: prescription.patientDetails?.birthDate
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
        dosageInstruction: [{text: item.dosageInstructions}]
      }
      requestGroup.contained?.push(medicationRequest)
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
  })

  logger.info("RequestGroup response generated successfully.")
  return requestGroup
}
