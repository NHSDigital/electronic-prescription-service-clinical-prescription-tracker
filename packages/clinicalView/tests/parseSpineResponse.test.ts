import {Logger} from "@aws-lambda-powertools/logger"
import {parseSpineResponse} from "../src/utils/parseSpineResponse"
import {Prescription, FilteredHistoryDetails} from "../src/utils/types"

// Import test data
import acuteReleased from "./data/acuteReleased"
import acuteDispensed from "./data/acuteDispensed"
import acuteCancelled from "./data/acuteCancelled"
import acuteWithDispenser from "./data/acuteWithDispenser"
import acuteSubsequentCancellation from "./data/acuteSubsequentCancellation"
import erdDispensed from "./data/erdDispensed"
import erdLineItemCancelled from "./data/erdLineItemCancelled"
import erdLineItemPendingCancellation from "./data/erdLineItemPendingCancellation"
import prescriptionNotFound from "./data/prescriptionNotFound"

const logger: Logger = new Logger({serviceName: "clinicalView", logLevel: "DEBUG"})

/**
 * Gets the latest filteredHistory entry based on the highest SCN value.
 */
const getLatestFilteredHistory = (
  filteredHistory: FilteredHistoryDetails | Array<FilteredHistoryDetails>
): FilteredHistoryDetails | undefined => {
  if (!Array.isArray(filteredHistory)) return filteredHistory
  return filteredHistory.reduce((prev, current) => (prev.SCN > current.SCN ? prev : current), filteredHistory[0])
}

// Define test cases
const testCases = [
  {
    name: "acute released prescription",
    data: acuteReleased,
    expected: {
      requestGroupDetails: {
        prescriptionId: "F20764-A83008-EEA31D",
        prescriptionStatus: "0002"
      },
      patientDetails: {
        nhsNumber: "5839945242",
        prefix: "MS",
        given: "STACEY",
        family: "TWITCHETT",
        suffix: "",
        administrativeGenderCode: 2,
        birthDate: "19480430",
        patientAddress: {
          line: [
            "10 HEATHFIELD",
            "COBHAM",
            "SURREY"
          ],
          postalCode: "KT11 2QY"
        }
      },
      productLineItems: [
        {
          order: 1,
          medicationName: "Amoxicillin 250mg capsules",
          quantity: "20",
          dosageInstructions: "2 times a day for 10 days"
        }
      ]
    }
  },
  {
    name: "acute dispensed prescription",
    data: acuteDispensed,
    expected: {
      requestGroupDetails: {
        prescriptionId: "D1419E-A83008-A3641P",
        prescriptionStatus: "0006"
      },
      dispenseNotification: {
        dispensingOrganization: "FA565"
      }
    }
  },
  {
    name: "acute cancelled prescription",
    data: acuteCancelled,
    expected: {
      requestGroupDetails: {
        prescriptionId: "D76B46-A83008-D600EO",
        prescriptionStatus: "0005"
      }
    }
  },
  {
    name: "acute prescription with a dispenser",
    data: acuteWithDispenser,
    expected: {
      requestGroupDetails: {
        prescriptionId: "9D4C80-A83008-5EA4D3",
        prescriptionStatus: "0006"
      },
      dispenseNotification: {
        dispensingOrganization: "FA565"
      }
    }
  },
  {
    name: "eRD dispensed prescription",
    data: erdDispensed,
    expected: {
      requestGroupDetails: {
        prescriptionId: "A68248-A83008-08350Z",
        prescriptionStatus: "0006"
      },
      dispenseNotification: {
        dispensingOrganization: "FA565"
      },
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
          quantity: "20",
          dosageInstructions: "2 times a day for 10 days"
        },
        {
          order: 3,
          medicationName: "Pseudoephedrine hydrochloride 60mg tablets",
          quantity: "30",
          dosageInstructions: "3 times a day for 10 days"
        },
        {
          order: 4,
          medicationName: "Azithromycin 250mg capsules",
          quantity: "30",
          dosageInstructions: "3 times a day for 10 days"
        }
      ]
    }
  },
  {
    name: "eRD line item cancelled prescription",
    data: erdLineItemCancelled,
    expected: {
      requestGroupDetails: {
        prescriptionId: "EC5ACF-A83008-733FD3",
        prescriptionStatus: "0002"
      },
      latestSCN: 4,
      latestLineItem: {
        toStatus: "0005",
        cancellationReason: "Clinical grounds",
        order: 3
      }
    }
  },
  {
    name: "eRD line item pending cancellation",
    data: erdLineItemPendingCancellation,
    expected: {
      requestGroupDetails: {
        prescriptionId: "ECD9BE-A83008-753A71",
        prescriptionStatus: "0002"
      },
      latestSCN: 7,
      latestLineItem: {
        toStatus: "0008",
        cancellationReason: "Pending: At the Pharmacist's request",
        order: 2
      }
    }
  },
  {
    name: "acute subsequent cancellation",
    data: acuteSubsequentCancellation,
    expected: {
      requestGroupDetails: {
        prescriptionId: "4EABC3-A83008-91927K",
        prescriptionStatus: "0001"
      },
      latestSCN: 6,
      latestLineItem: {
        fromStatus: "0008",
        toStatus: "0005",
        cancellationReason: "Clinical grounds",
        order: 1
      },
      filteredHistory: {
        agentPersonOrgCode: "VNE51"
      }
    }
  },
  {
    name: "prescription not found",
    data: prescriptionNotFound,
    expected: {
      error: {
        status: "404",
        description: "The requested prescription resource could not be found."
      }
    }
  }
]

describe("Test parseSpineResponse", () => {
  testCases.forEach(({name, data, expected}) => {
    it(`returns correctly parsed response for ${name}`, async () => {
      const result: Prescription = parseSpineResponse(data, logger)

      if (expected.error) {
        expect(result.error).toBeDefined()
        expect(result.error?.status).toBe(expected.error.status)
        expect(result.error?.description).toBe(expected.error.description)
      } else {
        expect(result.error).toBeUndefined()

        // Request Group Details
        if (expected.requestGroupDetails) {
          expect(result.requestGroupDetails?.prescriptionId).toBe(expected.requestGroupDetails.prescriptionId)
          expect(result.requestGroupDetails?.prescriptionStatus).toBe(expected.requestGroupDetails.prescriptionStatus)
        }

        // Patient Details
        if (expected.patientDetails) {
          expect(result.patientDetails?.nhsNumber).toBe(expected.patientDetails.nhsNumber)
          expect(result.patientDetails?.prefix).toBe(expected.patientDetails.prefix)
          expect(result.patientDetails?.given).toBe(expected.patientDetails.given)
          expect(result.patientDetails?.family).toBe(expected.patientDetails.family)
          expect(result.patientDetails?.suffix).toBe(expected.patientDetails.suffix)
          expect(result.patientDetails?.gender).toBe(expected.patientDetails.administrativeGenderCode)
          expect(result.patientDetails?.birthDate).toBe(expected.patientDetails.birthDate)
        }

        // Address
        if (expected.patientDetails?.patientAddress) {
          expect(result.patientDetails?.address?.[0].line).toEqual(expected.patientDetails.patientAddress.line)
          expect(result.patientDetails?.address?.[0].postalCode).toBe(expected.patientDetails.patientAddress.postalCode)
        }

        // Product Line Items
        if (expected.productLineItems) {
          expected.productLineItems.forEach((item, index) => {
            expect(result.productLineItems?.[index].order).toBe(item.order)
            expect(result.productLineItems?.[index].medicationName).toBe(item.medicationName)
            expect(result.productLineItems?.[index].quantity).toBe(item.quantity)
            expect(result.productLineItems?.[index].dosageInstructions).toBe(item.dosageInstructions)
          })
        }

        // Dispense Notification
        if (expected.dispenseNotification) {
          expect(result.dispenseNotificationDetails?.dispensingOrganization)
            .toBe(expected.dispenseNotification.dispensingOrganization)
        }

        // Filtered History
        if (expected.latestSCN !== undefined) {
          const latestHistory = getLatestFilteredHistory(result.filteredHistory ?? [])
          expect(latestHistory?.SCN).toBe(expected.latestSCN)

          // Find the correct line item dynamically based on order
          const expectedLine = latestHistory?.lineStatusChangeDict?.line
            .find(line => line.order === expected.latestLineItem.order)
          expect(expectedLine).toBeDefined()

          expect(expectedLine?.toStatus).toBe(expected.latestLineItem.toStatus)
          expect(expectedLine?.cancellationReason).toBe(expected.latestLineItem.cancellationReason)

          if (expected.filteredHistory?.agentPersonOrgCode) {
            expect(latestHistory?.agentPersonOrgCode).toBe(expected.filteredHistory.agentPersonOrgCode)
          }
        }
      }
    })
  })
})
