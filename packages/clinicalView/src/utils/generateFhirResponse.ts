import {randomUUID} from "crypto"
import {Logger} from "@aws-lambda-powertools/logger"
import {
  RequestGroup,
  Patient,
  MedicationRequest,
  MedicationDispense,
  Extension,
  Reference,
  RequestGroupAction
} from "fhir/r4"
import {ParsedSpineResponse, PrescriptionStatusTransitions} from "../utils/types"
import {
  mapGender,
  mapMedicationDispenseType,
  mapMedicationRequestStatusReason,
  mapPrescriptionType,
  formatBirthDate
} from "./fhirMappers"

// Maps extracted data to FHIR RequestGroup response
export const generateFhirResponse = (prescription: ParsedSpineResponse, logger: Logger): RequestGroup => {
  // Generate unique UUIDs for Patient and MedicationRequests
  const patientUuid = randomUUID()
  const medicationRequestMap = new Map<string, string>() // Maps medication name to MedicationRequest ID
  const medicationDispenseMap = new Map<string, string>() // Maps medication name to MedicationDispense ID

  // Generate the RequestGroup root resource
  const requestGroup: RequestGroup = {
    resourceType: "RequestGroup",
    id: "example-requestgroup",
    status: "active",
    identifier: [
      {
        system: "https://fhir.nhs.uk/Id/prescription-order-number",
        value: prescription.requestGroupDetails?.prescriptionId || ""
      }
    ],
    intent: "reflex-order",
    author: {
      identifier: {
        system: "https://fhir.nhs.uk/Id/ods-organization-code",
        value: prescription.requestGroupDetails?.prescribingOrganization || ""
      }
    },
    authoredOn: new Date().toISOString(),
    subject: {reference: `#${patientUuid}`},
    extension: [],
    action: [],
    contained: []
  }

  // Generate Patient entry
  if (!requestGroup.contained?.some((entry) => entry.resourceType === "Patient")) {

    const patient: Patient = {
      resourceType: "Patient",
      id: patientUuid,
      identifier: [
        {
          system: "https://fhir.nhs.uk/Id/nhs-number",
          value: prescription.patientDetails?.nhsNumber
        }
      ],
      name: [
        {
          prefix: [prescription.patientDetails?.prefix || ""],
          given: [prescription.patientDetails?.given || ""],
          family: prescription.patientDetails?.family || ""
        }
      ],
      gender: mapGender(prescription.patientDetails?.gender ?? 0),
      birthDate: prescription.patientDetails?.birthDate
        ? formatBirthDate(prescription.patientDetails.birthDate)
        : undefined,
      address: prescription.patientDetails?.address
    }

    requestGroup.contained?.push(patient)
  }

  // Determine if the prescription is cancelled and if any line item is pending cancellation
  const prescriptionCancelled = prescription.requestGroupDetails?.statusCode === "0005"
  const latestHistory = prescription.filteredHistory
  const lineItemPendingCancellation = latestHistory?.lineStatusChangeDict?.line
    ?.some((line: {cancellationReason?: string}) => line.cancellationReason) ?? false

  // Generate MedicationRequest entries
  prescription.productLineItems?.forEach((item) => {
    const lineItem = latestHistory?.lineStatusChangeDict?.line?.find((line) => line.order === item.order)

    if (lineItem) {
      const medicationRequestId = `${randomUUID()}`

      const medicationRequest: MedicationRequest = {
        resourceType: "MedicationRequest",
        id: medicationRequestId,
        status: lineItem.toStatus === "0005" ? "cancelled" : "active",
        intent: "order",
        subject: {reference: `#${patientUuid}`},
        medicationCodeableConcept: {
          coding: [
            {
              system: "https://fhir.nhs.uk/CodeSystem/medication",
              code: item.medicationName,
              display: item.medicationName
            }
          ]
        },
        dispenseRequest: {quantity: {value: parseInt(item.quantity, 10)}},
        dosageInstruction: [{text: item.dosageInstructions}],
        extension: []
      }

      // Store MedicationRequest ID for linking
      medicationRequestMap.set(item.medicationName, medicationRequestId)

      // DispensingInformation Extension
      if (lineItem.toStatus) {
        const dispensingInformation: Extension = {
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-DispensingInformation",
          extension: [
            {
              url: "dispenseStatus",
              valueCoding: {
                system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
                code: lineItem.toStatus,
                display: mapMedicationDispenseType(lineItem.toStatus)
              }
            }
          ]
        }

        medicationRequest?.extension?.push(dispensingInformation)
      }

      // PendingCancellations Extension
      if (lineItem.cancellationReason) {
        const cancellationInformation: Extension = {
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
                code: mapMedicationRequestStatusReason(lineItem.cancellationReason),
                display: lineItem.cancellationReason
              }
            }
          ]
        }
        medicationRequest.extension?.push(cancellationInformation)
      }

      requestGroup.contained?.push(medicationRequest)
    }
  })

  // Generate MedicationDispense entries from dispenseNotificationItems
  prescription.dispenseNotificationItems?.forEach((item) => {
    const medicationDispenseId = `${randomUUID()}`
    const medicationRequestId = medicationRequestMap.get(item.medicationName)

    const medicationDispense: MedicationDispense = {
      resourceType: "MedicationDispense",
      id: medicationDispenseId,
      status: "completed",
      authorizingPrescription: medicationRequestId
        ? [{reference: `#${medicationRequestId}`}]
        : [],
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

    // Store MedicationDispense ID for linking
    medicationDispenseMap.set(item.medicationName, medicationDispenseId)

    requestGroup.contained?.push(medicationDispense)
  })

  // Add Extension-EPS-RepeatInformation
  const repeatInformation: Extension = {
    url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-RepeatInformation",
    extension: [
      {
        url: "numberOfRepeatsAllowed",
        valueInteger: prescription.requestGroupDetails?.maxRepeats || 0
      },
      {
        url: "numberOfRepeatsIssued",
        valueInteger: prescription.requestGroupDetails?.instanceNumber || 0
      }
    ]
  }
  requestGroup.extension?.push(repeatInformation)

  // Add Extension-EPS-PendingCancellations
  const pendingCancellations: Extension = {
    url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-PendingCancellations",
    extension: [
      {url: "prescriptionPendingCancellation", valueBoolean: prescriptionCancelled},
      {url: "lineItemPendingCancellation", valueBoolean: lineItemPendingCancellation}
    ]
  }
  requestGroup.extension?.push(pendingCancellations)

  // Add Extension-DM-PrescriptionStatusHistory
  const prescriptionStatusHistory: Extension = {
    url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory",
    extension: [{
      url: "status",
      valueCoding: {
        system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
        code: latestHistory?.toStatus || "", // Default to "0003" if no history is available
        display: mapMedicationDispenseType(latestHistory?.toStatus || "")
      }
    }]
  }
  requestGroup.extension?.push(prescriptionStatusHistory)

  // Add Extension-DM-PrescriptionType
  const prescriptionType: Extension = {
    url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionType",
    valueCoding: {
      system: "https://fhir.nhs.uk/CodeSystem/prescription-type",
      code: prescription.requestGroupDetails?.prescriptionType || "",
      display: mapPrescriptionType(prescription.requestGroupDetails?.prescriptionType || "")
    }
  }
  requestGroup.extension?.push(prescriptionType)

  // Add PrescriptionStatusTransitions action
  const prescriptionStatusTransitions: PrescriptionStatusTransitions = {
    title: "Prescription status transitions",
    action: []
  }
  requestGroup.action?.push(prescriptionStatusTransitions)

  // Add PrescriptionUploadSuccessful action
  const prescriptionUploadSuccessful: RequestGroupAction = {
    title: "Prescription upload successful",
    timingTiming: {
      event: ["2025-02-24T05:30:00.494Z"],
      repeat: {
        frequency: 1,
        period: 20,
        periodUnit: "d" as const
      }
    },
    participant: [{
      identifier: {
        system: "https://fhir.nhs.uk/Id/ods-organization-code",
        value: "A83008"
      }
    }] as Array<Reference>,
    code: [{
      coding: [{
        system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
        code: "0001",
        display: "To be Dispensed"
      }]
    }],
    action: []
  }
  // Iterate over each stored MedicationRequest ID and add it to the action array
  medicationRequestMap.forEach((medicationRequestId) => {
    prescriptionUploadSuccessful.action?.push({
      resource: {
        reference: `#${medicationRequestId}`
      }
    })
  })
  prescriptionStatusTransitions.action?.push(prescriptionUploadSuccessful)

  // Add NominatedReleaseRequestSuccessful action
  const nominatedReleaseRequestSuccessful: RequestGroupAction = {
    title: "Nominated Release Request successful",
    timingDateTime: "2025-01-29T13:00:00Z",
    participant: [{
      identifier: {
        system: "https://fhir.nhs.uk/Id/ods-organization-code",
        value: prescription.requestGroupDetails?.dispensingOrganization || ""
      }
    }] as Array<Reference>,
    code: [{
      coding: [{
        system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
        code: "0002",
        display: "With Dispenser"
      }]
    }]
  }
  prescriptionStatusTransitions.action?.push(nominatedReleaseRequestSuccessful)

  // Add DispenseNotificationSuccessful action
  const dispenseNotificationSuccessful: RequestGroupAction = {
    title: "Dispense notification successful",
    timingDateTime: "2025-01-30T10:00:00Z",
    participant: [{
      identifier: {
        system: "https://fhir.nhs.uk/Id/ods-organization-code",
        value: "FCG71"
      }
    }] as Array<Reference>,
    code: [{
      coding: [{
        system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
        code: "0003",
        display: "With Dispenser - Active"
      }]
    }],
    action: []
  }
  // Iterate over each stored MedicationDispense ID and add it to the action array
  medicationDispenseMap.forEach((medicationDispenseId) => {
    dispenseNotificationSuccessful.action?.push({
      resource: {
        reference: `#${medicationDispenseId}`
      }
    })
  })
  prescriptionStatusTransitions.action?.push(dispenseNotificationSuccessful)

  logger.info("RequestGroup response generated successfully.")
  return requestGroup
}
