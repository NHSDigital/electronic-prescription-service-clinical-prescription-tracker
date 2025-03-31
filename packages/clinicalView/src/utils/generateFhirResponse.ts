import {randomUUID} from "crypto"
import {Logger} from "@aws-lambda-powertools/logger"
import {
  RequestGroup,
  Patient,
  MedicationRequest,
  MedicationDispense
} from "fhir/r4"
import {ParsedSpineResponse, FilteredHistoryDetails} from "../utils/types"
import {
  mapGender,
  mapTaskBusinessStatus,
  mapMedicationDispenseType,
  mapMedicationRequestStatusReason,
  mapPrescriptionType,
  mapPrescriptionTreatmentTypeToIntent,
  formatToISO8601,
  formatBirthDate
} from "./fhirMappers"
import {requestGroupType} from "../schemas/requestGroupSchema"
import {MedicationRequestType} from "../schemas/medicationRequestSchema"
import {PatientType} from "../schemas/patientSchema"

/**
 * Maps extracted prescription data into a FHIR RequestGroup response.
 */
export const generateFhirResponse =
(prescription: ParsedSpineResponse, logger: Logger): RequestGroup & requestGroupType => {
  // ======================================================================================
  //  STEP 1: Generate Unique Identifiers & Initialize Data Maps
  // ======================================================================================
  const requestGroupId: string = randomUUID()
  const patientUuid: string = randomUUID()
  const medicationRequestIds: Array<string> = [] // Stores MedicationRequest IDs to attach to RequestGroup action
  const medicationDispenseMap = new Map<string, string>() // Maps medication name to MedicationDispense ID

  // ======================================================================================
  //  STEP 2: Find Latest Filtered History & Check for Pending Cancellations
  // ======================================================================================
  const filteredHistoryArray = Array.isArray(prescription.filteredHistory)
    ? prescription.filteredHistory
    : prescription.filteredHistory
      ? [prescription.filteredHistory]
      : []

  // Get the latest filtered history entry based on SCN (highest SCN value)
  const latestHistory: FilteredHistoryDetails | null = filteredHistoryArray.reduce<FilteredHistoryDetails | null>(
    (latest, current) =>
      !latest || current.SCN > latest.SCN ? current : latest,
    null
  )

  // Check if any line has a pending cancellation in the latest history entry
  const hasPrescriptionPendingCancellation = latestHistory?.cancellationReason?.includes("Pending") ?? false
  const hasLineItemPendingCancellation = latestHistory?.lineStatusChangeDict?.line?.some(
    (line) => line.cancellationReason?.includes("Pending")
  ) ?? false

  // ======================================================================================
  //  STEP 3: Construct the Root RequestGroup Resource
  // ======================================================================================
  const prescriptionId: string = prescription.requestGroupDetails?.prescriptionId ?? ""
  const prescribingOrganization: string = prescription.requestGroupDetails?.prescribingOrganization ?? ""
  const prescriptionTreatmentType: string = prescription.requestGroupDetails?.prescriptionTreatmentType ?? ""

  const requestGroup: RequestGroup & requestGroupType = {
    resourceType: "RequestGroup",
    id: requestGroupId,
    status: "active",
    identifier: [
      {
        system: "https://fhir.nhs.uk/Id/prescription-order-number",
        value: prescriptionId
      }
    ],
    intent: mapPrescriptionTreatmentTypeToIntent(prescriptionTreatmentType),
    author: {
      identifier: {
        system: "https://fhir.nhs.uk/Id/ods-organization-code",
        value: prescribingOrganization
      }
    },
    authoredOn: new Date().toISOString(),
    subject: {reference: `#${patientUuid}`},
    extension: [],
    action: [],
    contained: []
  }

  // ======================================================================================
  //  STEP 4: Generate Patient Resource
  // ======================================================================================
  if (!requestGroup.contained?.some((entry) => entry.resourceType === "Patient")) {
    const address = prescription.patientDetails?.address
    const patient: Patient & PatientType = {
      resourceType: "Patient",
      id: patientUuid,
      identifier: [
        {
          system: "https://fhir.nhs.uk/Id/nhs-number",
          value: prescription.patientDetails.nhsNumber
        }
      ],
      name: [
        {
          prefix: [prescription.patientDetails?.prefix ?? ""],
          given: [prescription.patientDetails?.given ?? ""],
          family: prescription.patientDetails?.family ?? ""
        }
      ],
      gender: mapGender(prescription.patientDetails?.gender ?? 0),
      birthDate: formatBirthDate(prescription.patientDetails.birthDate),
      address: address ? [{
        ...address,
        text: address.line.join(", "), // Join the address components into a single text string
        type: "both",
        use: "home"
      }] : undefined
    }

    requestGroup.contained?.push(patient)
  }

  // ======================================================================================
  //  STEP 5: Add Extensions to RequestGroup
  // ======================================================================================

  // ---------------------- Extension-EPS-RepeatInformation -------------------------------
  const numberOfRepeatsAllowed = prescription.requestGroupDetails?.maxRepeats
  const numberOfRepeatsIssued: number = prescription.requestGroupDetails?.instanceNumber ?? 0

  if (typeof numberOfRepeatsAllowed === "number" && !isNaN(numberOfRepeatsAllowed)) {
    requestGroup.extension?.push({
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-RepeatInformation",
      extension: [
        {
          url: "numberOfRepeatsAllowed",
          valueInteger: numberOfRepeatsAllowed
        },
        {
          url: "numberOfRepeatsIssued",
          valueInteger: numberOfRepeatsIssued
        }
      ]
    })
  }

  // ---------------------- Extension-EPS-PendingCancellations ----------------------------
  requestGroup.extension?.push({
    url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-PendingCancellations",
    extension: [
      {
        url: "prescriptionPendingCancellation",
        valueBoolean: hasPrescriptionPendingCancellation
      },
      {
        url: "lineItemPendingCancellation",
        valueBoolean: hasLineItemPendingCancellation
      }
    ]
  })

  // ---------------------- Extension-DM-PrescriptionStatusHistory ------------------------
  const prescriptionStatus: string = prescription.requestGroupDetails?.prescriptionStatus ?? ""
  requestGroup.extension?.push({
    url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory",
    extension: [{
      url: "status",
      valueCoding: {
        system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
        code: prescriptionStatus || "",
        display: mapTaskBusinessStatus(prescriptionStatus || "")
      }
    }]
  })

  // ---------------------- Extension-DM-PrescriptionType ---------------------------------
  const prescriptionTypeCode: string = prescription.requestGroupDetails?.prescriptionType ?? ""
  requestGroup.extension?.push({
    url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionType",
    valueCoding: {
      system: "https://fhir.nhs.uk/CodeSystem/prescription-type",
      code: prescriptionTypeCode,
      display: mapPrescriptionType(prescriptionTypeCode)
    }
  })

  // ======================================================================================
  //  STEP 6: Generate MedicationRequest Resources and Store in medicationRequestMap
  // ======================================================================================
  prescription.productLineItems?.forEach((item) => {
    const medicationRequestId: string = randomUUID()

    // Find the latest history entry for this medication order
    const medicationHistory = latestHistory?.lineStatusChangeDict?.line?.find(
      (line) => line.order === item.order
    )

    const medicationRequest: MedicationRequest & MedicationRequestType = {
      resourceType: "MedicationRequest",
      id: medicationRequestId,
      status: medicationHistory?.toStatus === "0005" ? "cancelled" : "active",
      intent: "order",
      subject: {reference: `#${patientUuid}`},
      medicationCodeableConcept: {
        coding: [
          {
            system: "http://snomed.info/sct",
            code: item.medicationName,
            display: item.medicationName
          }
        ]
      },
      dispenseRequest: {quantity: {value: parseInt(item.quantity, 10)}},
      dosageInstruction: [{text: item.dosageInstructions}],
      extension: []
    }

    // DispensingInformation Extension
    if (medicationHistory?.toStatus) {
      medicationRequest.extension?.push({
        url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-DispensingInformation",
        extension: [
          {
            url: "dispenseStatus",
            valueCoding: {
              system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
              code: medicationHistory.toStatus,
              display: mapMedicationDispenseType(medicationHistory.toStatus)
            }
          }
        ]
      })
    }

    // Add PendingCancellations Extension for this MedicationRequest
    if (medicationHistory?.cancellationReason?.includes("Pending")) {
      medicationRequest.extension?.push({
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
              code: mapMedicationRequestStatusReason(medicationHistory.cancellationReason),
              display: medicationHistory.cancellationReason
            }
          }
        ]
      })
    }

    // Store MedicationRequest ID for linking
    medicationRequestIds.push(medicationRequestId)
    requestGroup.contained?.push(medicationRequest)

  })

  // ======================================================================================
  //  STEP 7: Generate MedicationDispense Resources and Link to MedicationRequest
  // ======================================================================================
  // TODO: handle multiple dispense notifications each with multiple items
  prescription.dispenseNotificationDetails?.dispenseNotificationItems.forEach((item, index) => {
    const medicationDispenseId: string = randomUUID()
    const medicationRequestId = medicationRequestIds[index] // Get corresponding MedicationRequest ID

    // TODO: Check this against the schema driven type
    const medicationDispense: MedicationDispense = {
      resourceType: "MedicationDispense",
      id: medicationDispenseId,
      status: "completed",
      authorizingPrescription: medicationRequestId ? [{reference: `#${medicationRequestId}`}] : [],
      medicationCodeableConcept: {
        coding: [
          {
            system: "https://fhir.nhs.uk/CodeSystem/medication",
            display: item.medicationName
          }
        ]
      },
      quantity: {value: parseInt(item.quantity, 10)},
      type: {
        coding: [
          {
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: item.status,
            display: mapMedicationDispenseType(item.status)
          }
        ]
      }
    }

    // TODO: Change these to map from the message id (dispNotifDocumentKey on spine response)
    medicationDispenseMap.set(item.medicationName, medicationDispenseId)

    // Add to contained resources
    requestGroup.contained?.push(medicationDispense)
  })

  // ======================================================================================
  // STEP 8: Generate Actions and Correctly Link MedicationRequests
  // ======================================================================================
  requestGroup.action?.push({
    title: "Prescription status transitions",
    action: prescription.filteredHistory?.map((history) => {
      let actionCommonProperties = {
        participant: [
          {
            identifier: {
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: history.agentPersonOrgCode
            }
          }
        ],
        code: [
          {
            coding: [
              {
                system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
                code: history.toStatus,
                display: mapTaskBusinessStatus(history.toStatus)
              }
            ]
          }
        ]
      }

      return history.message.includes("Prescription upload successful")
        ? {
          ...actionCommonProperties,
          title: "Prescription upload successful",
          timingTiming: {
            event: [formatToISO8601(history.sentDateTime)],
            repeat: {
              frequency: 1,
              period: prescription.requestGroupDetails?.daysSupply ?? 0,
              periodUnit: "d"
            }
          },
          action: medicationRequestIds.map((medicationRequestId) => ({
            resource: {reference: `#${medicationRequestId}`}
          }))
        }
        : {
          ...actionCommonProperties,
          title: history.message,
          timingDateTime: formatToISO8601(history.sentDateTime),
          // TODO: lookup messageId by SCN in the history element and use that to query medicationDispenseMap
          action: history.message.includes("Dispense notification successful") ?
            [...medicationDispenseMap.values()].map((medicationDispenseId) => {
              return {
                resource: {reference: `#${medicationDispenseId}`}
              }
            }) : undefined
        }
    })
  })

  // ======================================================================================
  //  FINAL STEP: Return Constructed RequestGroup
  // ======================================================================================
  logger.info("RequestGroup response generated successfully.")
  return requestGroup
}
