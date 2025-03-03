import {Logger} from "@aws-lambda-powertools/logger"
import {parseSpineResponse} from "../src/utils/parseSpineResponse"
import {ParsedSpineResponse} from "../src/utils/types"

// Import test data
import acuteReleased from "./data/acuteReleased"
import acuteDispensed from "./data/acuteDispensed"
import acuteCancelled from "./data/acuteCancelled"
import acuteWithDispenser from "./data/acuteWithDispenser"
import acuteSubsequentCancellation from "./data/acuteSubsequentCancellation"
import erdDispensed from "./data/erdDispensed"
import erdLineItemCancelled from "./data/erdLineItemCancelled"
import erdLineItemPendingCancellation from "./data/erdLineItemPendingCancellation"

const logger: Logger = new Logger({serviceName: "clinicalView", logLevel: "DEBUG"})

describe("Test parseSpineResponse", () => {
  it("returns correctly parsed response for an acute released prescription", async () => {
    const result: ParsedSpineResponse = parseSpineResponse(acuteReleased, logger)
    expect(result.error).toBeUndefined()
    expect(result.requestGroupDetails?.prescriptionId).toBe("F20764-A83008-EEA31D")
    expect(result.requestGroupDetails?.prescriptionStatus).toBe("0002")
  })

  it("returns correctly parsed response for an acute dispensed prescription", async () => {
    const result: ParsedSpineResponse = parseSpineResponse(acuteDispensed, logger)
    expect(result.error).toBeUndefined()
    expect(result.requestGroupDetails?.prescriptionId).toBe("D1419E-A83008-A3641P")
    expect(result.requestGroupDetails?.prescriptionStatus).toBe("0006")
    expect(result.dispenseNotificationDetails?.dispensingOrganization).toBe("FA565")
  })

  it("returns correctly parsed response for an acute cancelled prescription", async () => {
    const result: ParsedSpineResponse = parseSpineResponse(acuteCancelled, logger)
    expect(result.error).toBeUndefined()
    expect(result.requestGroupDetails?.prescriptionId).toBe("D76B46-A83008-D600EO")
    expect(result.requestGroupDetails?.prescriptionStatus).toBe("0005")
  })

  it("returns correctly parsed response for an acute prescription with a dispenser", async () => {
    const result: ParsedSpineResponse = parseSpineResponse(acuteWithDispenser, logger)
    expect(result.error).toBeUndefined()
    expect(result.requestGroupDetails?.prescriptionId).toBe("9D4C80-A83008-5EA4D3")
    expect(result.requestGroupDetails?.prescriptionStatus).toBe("0006")
    expect(result.dispenseNotificationDetails?.dispensingOrganization).toBe("FA565")
  })

  it("returns correctly parsed response for an eRD dispensed prescription", async () => {
    const result: ParsedSpineResponse = parseSpineResponse(erdDispensed, logger)
    expect(result.error).toBeUndefined()
    expect(result.requestGroupDetails?.prescriptionId).toBe("A68248-A83008-08350Z")
    expect(result.requestGroupDetails?.prescriptionStatus).toBe("0006")
    expect(result.requestGroupDetails?.maxRepeats).toBe(7)
    expect(result.dispenseNotificationDetails?.dispensingOrganization).toBe("FA565")
  })

  it("returns correctly parsed response for an eRD line item cancelled prescription", async () => {
    const result: ParsedSpineResponse = parseSpineResponse(erdLineItemCancelled, logger)
    expect(result.error).toBeUndefined()
    expect(result.requestGroupDetails?.prescriptionId).toBe("EC5ACF-A83008-733FD3")
    expect(result.requestGroupDetails?.prescriptionStatus).toBe("0002")
    expect(result.filteredHistory?.SCN).toBe(4)
    expect(result.filteredHistory?.lineStatusChangeDict?.line[2].toStatus).toBe("0005") // Item cancelled status
    expect(result.filteredHistory?.lineStatusChangeDict?.line[2].cancellationReason).toBe("Clinical grounds")
  })

  it("returns correctly parsed response for an eRD line item pending cancellation", async () => {
    const result: ParsedSpineResponse = parseSpineResponse(erdLineItemPendingCancellation, logger)
    expect(result.error).toBeUndefined()
    expect(result.requestGroupDetails?.prescriptionId).toBe("ECD9BE-A83008-753A71")
    expect(result.requestGroupDetails?.prescriptionStatus).toBe("0002")
    expect(result.filteredHistory?.SCN).toBe(7)
    expect(result.filteredHistory?.lineStatusChangeDict?.line[1].toStatus).toBe("0008") // Item with dispenser status
    expect(result.filteredHistory?.lineStatusChangeDict?.line[1].cancellationReason)
      .toBe("Pending: At the Pharmacist's request")
  })

  it("returns correctly parsed response for an acute subsequent cancellation", async () => {
    const result: ParsedSpineResponse = parseSpineResponse(acuteSubsequentCancellation, logger)
    expect(result.error).toBeUndefined()
    expect(result.requestGroupDetails?.prescriptionId).toBe("4EABC3-A83008-91927K")
    expect(result.requestGroupDetails?.prescriptionStatus).toBe("0001")

    // Ensure filteredHistory is defined and select the latest one based on SCN
    const latestHistory = Array.isArray(result.filteredHistory)
      ? result.filteredHistory.reduce((prev, current) => (prev.SCN > current.SCN ? prev : current),
        result.filteredHistory[0])
      : result.filteredHistory

    // Assertions based on the latest history entry
    expect(latestHistory?.SCN).toBe(6)
    expect(latestHistory?.agentPersonOrgCode).toBe("VNE51")
    expect(latestHistory?.lineStatusChangeDict?.line[0].fromStatus).toBe("0008") // Cancelled status
    expect(latestHistory?.lineStatusChangeDict?.line[0].toStatus).toBe("0005") // Cancelled status
    expect(latestHistory?.lineStatusChangeDict?.line[0].cancellationReason).toBe("Clinical grounds")
  })

  it("returns error response for an invalid SOAP response", async () => {
    const invalidResponse = "<SOAP:Envelope><SOAP:Body></SOAP:Body></SOAP:Envelope>"
    const result: ParsedSpineResponse = parseSpineResponse(invalidResponse, logger)
    expect(result.error).toBeDefined()
    expect(result.error?.status).toBe("500")
  })
})
