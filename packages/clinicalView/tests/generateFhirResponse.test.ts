import {describe, it, expect} from "@jest/globals"
import {Logger} from "@aws-lambda-powertools/logger"
import {generateFhirResponse} from "../src/utils/generateFhirResponse"
import {ParsedSpineResponse} from "../src/utils/types"

const logger = new Logger({serviceName: "clinicalView"})

const mockParsedResponse: Array<ParsedSpineResponse> = [
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
      statusCode: "0001",
      instanceNumber: 1,
      maxRepeats: 5,
      daysSupply: 28,
      nominatedPerformer: "VNE51",
      organizationSummaryObjective: "A83008"
    },
    productLineItems: [
      {
        medicationName: "Amoxicillin 250mg capsules",
        quantity: "20",
        dosageInstructions: "2 times a day for 10 days"
      }
    ],
    filteredHistory: [
      {
        SCN: 2,
        sentDateTime: "20240213105241",
        fromStatus: "False",
        toStatus: "0001",
        message: "Prescription upload successful",
        organizationName: "A83008"
      }
    ]
  }
]

describe("generateFhirResponse", () => {
  it("should generate a valid FHIR RequestGroup", () => {
    const response = generateFhirResponse(mockParsedResponse, logger)

    expect(response.resourceType).toBe("RequestGroup")
    expect(response.subject?.reference).toBe("#example-patient")
    expect(response.contained?.length).toBeGreaterThan(0)
    expect(response.contained?.find((r) => r.resourceType === "Patient")).toBeDefined()
    expect(response.contained?.find((r) => r.resourceType === "MedicationRequest")).toBeDefined()
  })
})
