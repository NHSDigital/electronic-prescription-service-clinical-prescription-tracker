import {Logger} from "@aws-lambda-powertools/logger"
import {parseSpineResponse} from "../src/utils/parseSpineResponse"
import {ParsedSpineResponse, FilteredHistoryDetails} from "../src/utils/types"

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
      prescriptionId: "F20764-A83008-EEA31D",
      prescriptionStatus: "0002"
    }
  },
  {
    name: "acute dispensed prescription",
    data: acuteDispensed,
    expected: {
      prescriptionId: "D1419E-A83008-A3641P",
      prescriptionStatus: "0006",
      dispensingOrganization: "FA565"
    }
  },
  {
    name: "acute cancelled prescription",
    data: acuteCancelled,
    expected: {
      prescriptionId: "D76B46-A83008-D600EO",
      prescriptionStatus: "0005"
    }
  },
  {
    name: "acute prescription with a dispenser",
    data: acuteWithDispenser,
    expected: {
      prescriptionId: "9D4C80-A83008-5EA4D3",
      prescriptionStatus: "0006",
      dispensingOrganization: "FA565"
    }
  },
  {
    name: "eRD dispensed prescription",
    data: erdDispensed,
    expected: {
      prescriptionId: "A68248-A83008-08350Z",
      prescriptionStatus: "0006",
      maxRepeats: 7,
      dispensingOrganization: "FA565"
    }
  },
  {
    name: "eRD line item cancelled prescription",
    data: erdLineItemCancelled,
    expected: {
      prescriptionId: "EC5ACF-A83008-733FD3",
      prescriptionStatus: "0002",
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
      prescriptionId: "ECD9BE-A83008-753A71",
      prescriptionStatus: "0002",
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
      prescriptionId: "4EABC3-A83008-91927K",
      prescriptionStatus: "0001",
      latestSCN: 6,
      latestLineItem: {
        fromStatus: "0008",
        toStatus: "0005",
        cancellationReason: "Clinical grounds",
        order: 1
      },
      agentPersonOrgCode: "VNE51"
    }
  },
  {
    name: "prescription not found",
    data: prescriptionNotFound,
    expected: {
      error: {
        status: "404",
        code: "0001",
        detailsDisplay: "The requested prescription resource could not be found."
      }
    }
  }
]

describe("Test parseSpineResponse", () => {
  testCases.forEach(({name, data, expected}) => {
    it(`returns correctly parsed response for ${name}`, async () => {
      const result: ParsedSpineResponse = parseSpineResponse(data, logger)

      if (expected.error) {
        expect(result.error).toBeDefined()
        expect(result.error?.status).toBe(expected.error.status)
        expect(result.error?.description).toBe(expected.error.detailsDisplay)
      } else {
        expect(result.error).toBeUndefined()
        expect(result.requestGroupDetails?.prescriptionId).toBe(expected.prescriptionId)
        expect(result.requestGroupDetails?.prescriptionStatus).toBe(expected.prescriptionStatus)

        if (expected.maxRepeats !== undefined) {
          expect(result.requestGroupDetails?.maxRepeats).toBe(expected.maxRepeats)
        }

        if (expected.dispensingOrganization) {
          expect(result.dispenseNotificationDetails?.dispensingOrganization).toBe(expected.dispensingOrganization)
        }

        if (expected.latestSCN !== undefined) {
          const latestHistory = getLatestFilteredHistory(result.filteredHistory ?? [])
          expect(latestHistory?.SCN).toBe(expected.latestSCN)

          // Find the correct line item dynamically based on order
          const expectedLine = latestHistory?.lineStatusChangeDict?.line
            .find(line => line.order === expected.latestLineItem.order)
          expect(expectedLine).toBeDefined()

          expect(expectedLine?.toStatus).toBe(expected.latestLineItem.toStatus)
          expect(expectedLine?.cancellationReason).toBe(expected.latestLineItem.cancellationReason)

          if (expected.agentPersonOrgCode) {
            expect(latestHistory?.agentPersonOrgCode).toBe(expected.agentPersonOrgCode)
          }
        }
      }
    })
  })
})
