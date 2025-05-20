import {Logger} from "@aws-lambda-powertools/logger"
import {jest} from "@jest/globals"
import {Prescription} from "../src/parseSpineResponse"
import {RequestGroupType} from "../src/schema/requestGroup"

const logger: Logger = new Logger({serviceName: "clinicalView", logLevel: "DEBUG"})

const mockUUID = jest.fn()
jest.unstable_mockModule("crypto", () => {
  return {
    randomUUID: mockUUID
  }
})

const {generateFhirResponse} = await import("../src/generateFhirResponse")

describe("Test parseSpineResponse", () => {
  beforeEach(() => {
    mockUUID.mockImplementationOnce(() => "PATIENT-123-567-890")
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it("returns a RequestGroup resource when called", () => {
    const prescription: Prescription = {
      prescriptionId: "C0C3E6-A83008-93D8FL",
      nhsNumber: "5839945242",
      prefix: "MS",
      given: "STACEY",
      suffix: "OBE",
      family: "TWITCHETT",
      birthDate: "1948-04-30",
      gender: 2,
      address: {
        line: [
          "10 HEATHFIELD",
          "COBHAM",
          "SURREY"
        ],
        postalCode: "KT11 2QY"
      },
      issueDate: "2025-04-24T00:00:00.000Z",
      issueNumber: 1,
      status: "0001",
      prescriptionPendingCancellation: false,
      itemsPendingCancellation: false,
      treatmentType: "0001",
      prescriptionType: "0101",
      daysSupply: 28,
      prescriberOrg: "A83008",
      nominatedDispenserOrg: "FA565",
      nominatedDisperserType: "P1",
      lineItems: {
        1: {
          lineItemNo: "1",
          lineItemId: "D37FD639-E831-420C-B37B-40481DCA910E",
          status: "0007",
          itemName: "Amoxicillin 250mg capsules",
          quantity: 20,
          quantityForm: "tablet",
          dosageInstruction: "2 times a day for 10 days",
          pendingCancellation: false
        },
        2: {
          lineItemNo: "2",
          lineItemId: "407685A2-A1A2-4B6B-B281-CAED41733C2B",
          status: "0007",
          itemName: "Co-codamol 30mg/500mg tablets",
          quantity: 20,
          quantityForm: "tablet",
          dosageInstruction: "2 times a day for 10 days",
          pendingCancellation: false
        },
        3: {
          lineItemNo: "3",
          lineItemId: "20D6D69F-7BDD-4798-86DF-30F902BD2936",
          status: "0007",
          itemName: "Pseudoephedrine hydrochloride 60mg tablets",
          quantity: 30,
          quantityForm: "tablet",
          dosageInstruction: "3 times a day for 10 days",
          pendingCancellation: false
        },
        4: {
          lineItemNo: "4",
          lineItemId: "BF1B0BD8-0E6D-4D90-989E-F32065200CA3",
          status: "0007",
          itemName: "Azithromycin 250mg capsules",
          quantity: 30,
          quantityForm: "tablet",
          dosageInstruction: "3 times a day for 10 days",
          pendingCancellation: false
        }
      },
      dispenseNotifications: {},
      history: {
        2: {
          eventId: "2",
          message: "Prescription upload successful",
          messageId: "F1204DE7-9434-4EDE-B1A2-ACB849891919",
          timestamp: "2025-04-24T11:10:05.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false,
          isPrescriptionUpload: true,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0007"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0007"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0007"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
        }
      }
    }
    const expected = {} as unknown as RequestGroupType

    const actual = generateFhirResponse(prescription, logger)
    expect(actual).toEqual(expected)
  })
})
