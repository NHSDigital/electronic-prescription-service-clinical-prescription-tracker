
import {jest} from "@jest/globals"
import {Logger} from "@aws-lambda-powertools/logger"
import {APIGatewayProxyEventHeaders} from "aws-lambda"
import {CommonHeaderParameters, ServiceError} from "@cpt-common/common-types/service"
import {validateCommonHeaders} from "../src/commonValidation"

const logger: Logger = new Logger({serviceName: "commonUtils", logLevel: "DEBUG"})
const mockHeaders: APIGatewayProxyEventHeaders = {
  "x-request-id": "REQ-123-456-789",
  "nhsd-organization-uuid": "ORG-123-456-789",
  "nhsd-session-urid": "SESS-123-456-789",
  "nhsd-identity-uuid": "ID-123-456-789",
  "nhsd-session-jobrole": "JOB-123-456-789"
}

describe("Test validateCommonHeaders", () => {
  it("returns the correct error when x-request-id is missing from the requests headers", async () => {
    const headers: APIGatewayProxyEventHeaders = {...mockHeaders, "x-request-id": undefined}

    const expectedErrors: Array<ServiceError> = [{
      status: 400,
      severity: "error",
      description: "Missing required header, x-request-id."
    }]

    const [, actualError]: [CommonHeaderParameters, Array<ServiceError>] = validateCommonHeaders(headers, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("updates the logger when called with a x-request-id header", async () => {
    const appendKeySpy = jest.spyOn(Logger.prototype, "appendKeys")

    validateCommonHeaders(mockHeaders, logger)
    expect(appendKeySpy).toHaveBeenLastCalledWith({
      "x-request-id": "REQ-123-456-789"
    })
  })

  it("returns the correct error when nhsd-organization-uuid is missing from the requests headers", async () => {
    const headers: APIGatewayProxyEventHeaders = {...mockHeaders, "nhsd-organization-uuid": undefined}

    const expectedErrors: Array<ServiceError> = [{
      status: 400,
      severity: "error",
      description: "Missing required header, nhsd-organization-uuid."
    }]

    const [, actualError]: [CommonHeaderParameters, Array<ServiceError>] = validateCommonHeaders(headers, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("returns the correct error when nhsd-session-urid is missing from the requests headers", async () => {
    const headers: APIGatewayProxyEventHeaders = {...mockHeaders, "nhsd-session-urid": undefined}

    const expectedErrors: Array<ServiceError> = [{
      status: 400,
      severity: "error",
      description: "Missing required header, nhsd-session-urid."
    }]

    const [, actualError]: [CommonHeaderParameters, Array<ServiceError>] = validateCommonHeaders(headers, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("returns the correct error when nhsd-identity-uuid is missing from the requests headers", async () => {
    const headers: APIGatewayProxyEventHeaders = {...mockHeaders, "nhsd-identity-uuid": undefined}

    const expectedErrors: Array<ServiceError> = [{
      status: 400,
      severity: "error",
      description: "Missing required header, nhsd-identity-uuid."
    }]

    const [, actualError]: [CommonHeaderParameters, Array<ServiceError>] = validateCommonHeaders(headers, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("returns the correct error when nhsd-session-jobrole is missing from the requests headers", async () => {
    const headers: APIGatewayProxyEventHeaders = {...mockHeaders, "nhsd-session-jobrole": undefined}

    const expectedErrors: Array<ServiceError> = [{
      status: 400,
      severity: "error",
      description: "Missing required header, nhsd-session-jobrole."
    }]

    const [, actualError]: [CommonHeaderParameters, Array<ServiceError>] = validateCommonHeaders(headers, logger)
    expect(actualError).toEqual(expectedErrors)
  })
})
