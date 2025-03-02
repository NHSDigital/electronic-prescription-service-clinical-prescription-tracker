import {describe, it, expect} from "@jest/globals"
import {Logger} from "@aws-lambda-powertools/logger"
import {parseSpineResponse} from "../src/utils/parseSpineResponse"
import prescriptionFoundResponse from "./data/prescriptionFoundResponse"

const logger = new Logger({serviceName: "clinicalView"})

describe("parseSpineResponse", () => {
  it("should correctly parse a valid prescription response", () => {
    const parsed = parseSpineResponse(prescriptionFoundResponse, logger)

    expect(parsed).toHaveProperty("patientDetails")
    expect(parsed.patientDetails?.nhsNumber).toBe("9449304130")
    expect(parsed.patientDetails?.gender).toBe(2)
    expect(parsed.requestGroupDetails?.prescriptionId).toBe("9AD427-A83008-2E461K")
    expect(parsed.productLineItems?.length).toBe(4)
  })
})
