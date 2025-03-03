import {Logger} from "@aws-lambda-powertools/logger"
import {parseSpineResponse} from "../src/utils/parseSpineResponse"
import {ParsedSpineResponse} from "../src/utils/types"

// Import test data
import acuteReleased from "./data/acuteReleased"
import acuteDispensed from "./data/acuteDispensed"
import acuteCancelled from "./data/acuteCancelled"
import acuteWithDispenser from "./data/acuteWithDispenser"
import erdDispensed from "./data/erdDispensed"

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

  it("returns error response for an invalid SOAP response", async () => {
    const invalidResponse = "<SOAP:Envelope><SOAP:Body></SOAP:Body></SOAP:Envelope>"
    const result: ParsedSpineResponse = parseSpineResponse(invalidResponse, logger)
    expect(result.error).toBeDefined()
    expect(result.error?.status).toBe("500")
  })
})
