import {describe, it, expect} from "@jest/globals"
import {Logger} from "@aws-lambda-powertools/logger"
import {generateFhirResponse} from "../src/utils/generateFhirResponse"
import {ParsedSpineResponse} from "../src/utils/types"

const logger = new Logger({serviceName: "clinicalView"})

const mockParsedResponse: ParsedSpineResponse =
{
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
    organizationName: "A83008",
    lineStatusChangeDict: {
      line: [
        {
          order: 1,
          id: "DAD23C1F-71A4-473A-9273-C83C8BFC5F64",
          status: "",
          fromStatus: "0005",
          toStatus: "0005",
          cancellationReason: "Clinical grounds"
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

describe("generateFhirResponse", () => {
  it("should generate a valid FHIR RequestGroup", () => {
    const response = generateFhirResponse(mockParsedResponse, logger)

    expect(response.resourceType).toBe("RequestGroup")

    // Extract the generated patient UUID from the response
    const patientResource = response.contained?.find((r) => r.resourceType === "Patient")
    expect(patientResource).toBeDefined()

    // Ensure the subject reference matches the generated patient UUID
    expect(response.subject?.reference).toBe(`#${patientResource?.id}`)

    expect(response.contained?.length).toBeGreaterThan(0)
    expect(response.contained?.find((r) => r.resourceType === "MedicationRequest")).toBeDefined()
  })
})
