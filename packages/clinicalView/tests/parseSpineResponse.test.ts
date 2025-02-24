import {describe, it, expect} from "@jest/globals"
import {Logger} from "@aws-lambda-powertools/logger"
import {parseSpineResponse} from "../src/utils/parseSpineResponse"
import prescriptionFoundResponse from "./data/prescriptionFoundResponse"

const logger = new Logger({serviceName: "clinicalView"})

describe("parseSpineResponse", () => {
  it("should correctly parse a valid prescription response", () => {
    const parsed = parseSpineResponse(prescriptionFoundResponse, logger)

    expect(parsed).toHaveLength(1)
    expect(parsed[0].patientDetails?.nhsNumber).toBe("9449304130")
    expect(parsed[0].patientDetails?.gender).toBe(2)
    expect(parsed[0].requestGroupDetails?.prescriptionId).toBe("9AD427-A83008-2E461K")
    expect(parsed[0].productLineItems?.length).toBe(4)
  })

  it("should throw an error for unknown errors", () => {
    expect(() => parseSpineResponse("<invalid-xml>", logger)).toThrowError("Unknown Error")
  })
})
