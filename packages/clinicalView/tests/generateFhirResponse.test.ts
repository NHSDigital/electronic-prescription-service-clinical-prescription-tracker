import {describe, it, expect} from "@jest/globals"
import {Logger} from "@aws-lambda-powertools/logger"
import {generateFhirResponse} from "../src/utils/generateFhirResponse"
import {ParsedSpineResponse} from "../src/utils/types"
import {Patient} from "fhir/r4"

const logger = new Logger({serviceName: "clinicalView"})

// Mock parsed response for testing
const mockParsedResponse: ParsedSpineResponse = {
  patientDetails: {
    nhsNumber: "9449304130",
    prefix: "MS",
    given: "STACEY",
    family: "TWITCHETT",
    suffix: "",
    birthDate: "1948-04-30",
    gender: 2
  },
  requestGroupDetails: {
    prescriptionId: "9AD427-A83008-2E461K",
    prescriptionTreatmentType: "0001",
    prescriptionType: "0101",
    signedTime: "20250226044948",
    prescriptionTime: "20250226000000",
    prescriptionStatus: "0001",
    instanceNumber: 1,
    maxRepeats: 5,
    daysSupply: 28,
    nominatedPerformer: "VNE51",
    prescribingOrganization: "A83008"
  },
  productLineItems: [
    {
      order: 1,
      medicationName: "Amoxicillin 250mg capsules",
      quantity: "20",
      dosageInstructions: "2 times a day for 10 days"
    }
  ],
  filteredHistory: {
    SCN: 2,
    sentDateTime: "20240213105241",
    fromStatus: "False",
    toStatus: "0001",
    message: "Prescription upload successful",
    agentPersonOrgCode: "A83008",
    lineStatusChangeDict: {
      line: [
        {
          order: 1,
          id: "DAD23C1F-71A4-473A-9273-C83C8BFC5F64",
          status: "",
          fromStatus: "0005",
          toStatus: "0005",
          cancellationReason: "Clinical grounds"
        },
        {
          order: 2,
          id: "9F737A38-F80C-4AD0-96FC-CB5A796D254B",
          status: "",
          fromStatus: "0008",
          toStatus: "0001"
        },
        {
          order: 3,
          id: "FDB4258F-BB6B-4217-A001-382BD4035123",
          status: "",
          fromStatus: "0007",
          toStatus: "0008"
        }
      ]
    }
  },
  dispenseNotificationDetails: {
    statusPrescription: "0003",
    dispensingOrganization: "FA123",
    dispNotifToStatus: "0006",
    dispenseNotifDateTime: "20240213105241",
    dispenseNotificationItems: []
  }
}

const mockParsedResponseWithDispense: ParsedSpineResponse = {
  ...mockParsedResponse,
  dispenseNotificationDetails: {
    statusPrescription: "0006",
    dispensingOrganization: "FA123",
    dispNotifToStatus: "0006",
    dispenseNotifDateTime: "20240213105241",
    dispenseNotificationItems: [
      {
        order: 1,
        medicationName: "Amoxicillin 250mg capsules",
        quantity: "20",
        status: "0006"
      }
    ]
  }
}

const mockParsedResponseWithMultipleItems: ParsedSpineResponse = {
  ...mockParsedResponse,
  productLineItems: [
    {
      order: 1,
      medicationName: "Amoxicillin 250mg capsules",
      quantity: "20",
      dosageInstructions: "2 times a day for 10 days"
    },
    {
      order: 2,
      medicationName: "Co-codamol 30mg/500mg tablets",
      quantity: "30",
      dosageInstructions: "1 tablet every 6 hours"
    },
    {
      order: 3,
      medicationName: "Pseudoephedrine hydrochloride 60mg tablets",
      quantity: "15",
      dosageInstructions: "Take one tablet twice daily"
    }
  ]
}

describe("generateFhirResponse", () => {

  it("should generate a valid FHIR RequestGroup", () => {
    const response = generateFhirResponse(mockParsedResponse, logger)

    // Check that the response is a RequestGroup
    expect(response.resourceType).toBe("RequestGroup")

    // Check that the subject references the correct patient UUID
    const patientResource = response.contained?.find((r) => r.resourceType === "Patient")
    expect(patientResource).toBeDefined()
    expect(response.subject?.reference).toBe(`#${patientResource?.id}`)

    // Ensure there are contained resources
    expect(response.contained?.length).toBeGreaterThan(0)

    // Check that at least one MedicationRequest exists
    expect(response.contained?.some((r) => r.resourceType === "MedicationRequest")).toBe(true)
  })

  it("should include correct patient details", () => {
    const response = generateFhirResponse(mockParsedResponse, logger)

    const patientResource = response.contained?.find((r) => r.resourceType === "Patient") as Patient
    expect(patientResource).toBeDefined()
    expect(patientResource.identifier?.[0].value).toBe("9449304130")
    expect(patientResource.name?.[0].given?.[0]).toBe("STACEY")
    expect(patientResource.name?.[0].family).toBe("TWITCHETT")
  })

  it("should include correct prescription details", () => {
    const response = generateFhirResponse(mockParsedResponse, logger)

    expect(response.identifier?.[0].value).toBe("9AD427-A83008-2E461K")
    expect(response.status).toBe("active")
    expect(response.intent).toBe("order")
    expect(response.author?.identifier?.value).toBe("A83008")
  })

  it("should include correct RepeatInformation extension", () => {
    const response = generateFhirResponse(mockParsedResponse, logger)

    const repeatExtension = response.extension?.find((ext) =>
      ext.url.includes("Extension-EPS-RepeatInformation")
    )
    expect(repeatExtension).toBeDefined()
    expect(repeatExtension?.extension?.find((ext) => ext.url === "numberOfRepeatsAllowed")?.valueInteger).toBe(5)
    expect(repeatExtension?.extension?.find((ext) => ext.url === "numberOfRepeatsIssued")?.valueInteger).toBe(1)
  })

  it("should include correct PendingCancellations extension", () => {
    const response = generateFhirResponse(mockParsedResponse, logger)

    const pendingCancellationExt = response.extension?.find((ext) =>
      ext.url.includes("Extension-EPS-PendingCancellations")
    )
    expect(pendingCancellationExt).toBeDefined()
    expect(pendingCancellationExt?.extension?.some((ext) => ext.url === "prescriptionPendingCancellation")).toBe(true)
  })

  it("should include PrescriptionStatusHistory extension", () => {
    const response = generateFhirResponse(mockParsedResponse, logger)

    const statusHistoryExt = response.extension?.find((ext) =>
      ext.url.includes("Extension-DM-PrescriptionStatusHistory")
    )
    expect(statusHistoryExt).toBeDefined()
    expect(statusHistoryExt?.extension?.[0].valueCoding?.code).toBe("0001")
  })

  it("should include MedicationRequest and optionally MedicationDispense based on dispense data", () => {
    // Generate response with dispense notification details
    const responseWithDispense = generateFhirResponse(mockParsedResponseWithDispense, logger)
    const responseWithoutDispense = generateFhirResponse(mockParsedResponse, logger)

    // Check that the RequestGroup contains actions
    expect(responseWithDispense.action?.length).toBeGreaterThan(0)

    // Ensure MedicationRequest always exists
    const medicationRequestExists = responseWithDispense.contained?.some((r) => r.resourceType === "MedicationRequest")
    expect(medicationRequestExists).toBe(true)

    // Check for MedicationDispense only if dispense notifications are present
    const medicationDispenseExists = responseWithDispense.contained?.some(
      (r) => r.resourceType === "MedicationDispense"
    )
    expect(medicationDispenseExists).toBe(true)

    // Validate that MedicationDispense is NOT present when no dispense data exists
    const medicationDispenseMissing = responseWithoutDispense.contained?.some(
      (r) => r.resourceType === "MedicationDispense"
    )
    expect(medicationDispenseMissing).toBe(false)
  })

  it("should correctly handle multiple product line items", () => {
    const response = generateFhirResponse(mockParsedResponseWithMultipleItems, logger)

    // Extract MedicationRequest entries from the response
    const medicationRequests = response.contained?.filter((r) => r.resourceType === "MedicationRequest")

    // Ensure all expected product line items are present in MedicationRequests
    expect(medicationRequests?.length).toBe(3)

    // Verify the content of each MedicationRequest
    mockParsedResponseWithMultipleItems.productLineItems?.forEach((item) => {
      const matchingMedicationRequest = medicationRequests?.find(
        (r) => r.medicationCodeableConcept?.coding?.[0].display === item.medicationName
      )

      expect(matchingMedicationRequest).toBeDefined()
      expect(matchingMedicationRequest?.dispenseRequest?.quantity?.value).toBe(parseInt(item.quantity, 10))
      expect(matchingMedicationRequest?.dosageInstruction?.[0]?.text).toBe(item.dosageInstructions)
    })
  })

  it("should handle missing prescription details gracefully", () => {
    const minimalResponse: ParsedSpineResponse = {
      patientDetails: {
        nhsNumber: "1234567890",
        prefix: "",
        given: "John",
        family: "Doe",
        suffix: "",
        birthDate: "",
        gender: 1
      },
      requestGroupDetails: {
        prescriptionId: "",
        prescriptionTreatmentType: "",
        prescriptionType: "",
        signedTime: "",
        prescriptionTime: "",
        prescriptionStatus: "",
        instanceNumber: 0,
        maxRepeats: 0,
        daysSupply: 0,
        nominatedPerformer: "",
        prescribingOrganization: ""
      },
      productLineItems: [],
      filteredHistory: undefined,
      dispenseNotificationDetails: undefined
    }

    const response = generateFhirResponse(minimalResponse, logger)

    expect(response.resourceType).toBe("RequestGroup")
    expect(response.identifier?.[0].value).toBe("")
    expect(response.contained?.length).toBeGreaterThan(0)
  })
})
