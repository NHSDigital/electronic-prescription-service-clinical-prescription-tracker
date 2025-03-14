/* eslint-disable max-len */
import {jest} from "@jest/globals"
import {Logger} from "@aws-lambda-powertools/logger"
import {validateRequest} from "../src/validateRequest"

// Types
import {APIGatewayProxyEvent, APIGatewayProxyEventHeaders, APIGatewayProxyEventQueryStringParameters} from "aws-lambda"
import {PrescriptionSearchParams} from "@NHSDigital/eps-spine-client/lib/live-spine-client"
import {SearchError} from "../src/parseSpineResponse"

const logger: Logger = new Logger({serviceName: "prescriptionSearch", logLevel: "DEBUG"})
const mockHeaders: APIGatewayProxyEventHeaders = {
  "x-request-id": "REQ-123-456-789",
  "nhsd-organization-uuid": "ORG-123-456-789",
  "nhsd-session-urid": "SESS-123-456-789",
  "nhsd-identity-uuid": "ID-123-456-789",
  "nhsd-session-jobrole": "JOB-123-456-789"
}
const mockQueryStringParameters: APIGatewayProxyEventQueryStringParameters = {
  prescriptionId : "PRES-1234-5678"
}

describe("Test validateRequest", () => {

  it("updates the logger when called with a valid request", async () => {
    const appendKeySpy = jest.spyOn(Logger.prototype, "appendKeys")
    const mockEvent = {
      headers: mockHeaders,
      queryStringParameters: mockQueryStringParameters
    } as unknown as APIGatewayProxyEvent

    validateRequest(mockEvent, logger)
    expect(appendKeySpy).toHaveBeenLastCalledWith({
      "x-request-id": "REQ-123-456-789"
    })
  })

  it("returns correct search parameters when called with a valid request with prescriptionId", async () => {
    const mockEvent = {
      headers: mockHeaders,
      queryStringParameters: mockQueryStringParameters
    } as unknown as APIGatewayProxyEvent

    const expected: PrescriptionSearchParams = {
      prescriptionId: "PRES-1234-5678",
      nhsNumber: undefined,
      creationDateRange: undefined,
      requestId: "REQ-123-456-789",
      organizationId: "ORG-123-456-789",
      sdsRoleProfileId: "SESS-123-456-789",
      sdsId: "ID-123-456-789",
      jobRoleCode: "JOB-123-456-789"
    }

    const [actualParameters]: [PrescriptionSearchParams, Array<SearchError>] = validateRequest(mockEvent, logger)
    expect(actualParameters).toEqual(expected)
  })

  it("returns correct search parameters when called with a valid request with nhsNumber", async () => {
    const mockEvent = {
      headers: mockHeaders,
      queryStringParameters: {nhsNumber: "123-456-7890"}
    } as unknown as APIGatewayProxyEvent

    const expectedParameters: PrescriptionSearchParams ={
      prescriptionId: undefined,
      nhsNumber: "123-456-7890",
      creationDateRange: undefined,
      requestId: "REQ-123-456-789",
      organizationId: "ORG-123-456-789",
      sdsRoleProfileId: "SESS-123-456-789",
      sdsId: "ID-123-456-789",
      jobRoleCode: "JOB-123-456-789"
    }

    const [actualParameters]: [PrescriptionSearchParams, Array<SearchError>] = validateRequest(mockEvent, logger)
    expect(actualParameters).toEqual(expectedParameters)
  })

  it("returns correct search parameters when called with a valid request with an optional low date", async () => {
    const mockEvent = {
      headers: mockHeaders,
      queryStringParameters: {...mockQueryStringParameters, ...{lowDate: "2025-01-01"}}
    } as unknown as APIGatewayProxyEvent

    const expected: PrescriptionSearchParams = {
      prescriptionId: "PRES-1234-5678",
      nhsNumber: undefined,
      creationDateRange: {
        lowDate: "2025-01-01"
      },
      requestId: "REQ-123-456-789",
      organizationId: "ORG-123-456-789",
      sdsRoleProfileId: "SESS-123-456-789",
      sdsId: "ID-123-456-789",
      jobRoleCode: "JOB-123-456-789"
    }

    const [actualParameters]: [PrescriptionSearchParams, Array<SearchError>] = validateRequest(mockEvent, logger)
    expect(actualParameters).toEqual(expected)
  })

  it("returns correct search parameters when called with a valid request with an optional high date", async () => {
    const mockEvent = {
      headers: mockHeaders,
      queryStringParameters: {...mockQueryStringParameters, ...{highDate: "2025-02-02"}}
    } as unknown as APIGatewayProxyEvent

    const expected: PrescriptionSearchParams = {
      prescriptionId: "PRES-1234-5678",
      nhsNumber: undefined,
      creationDateRange: {
        highDate: "2025-02-02"
      },
      requestId: "REQ-123-456-789",
      organizationId: "ORG-123-456-789",
      sdsRoleProfileId: "SESS-123-456-789",
      sdsId: "ID-123-456-789",
      jobRoleCode: "JOB-123-456-789"
    }

    const [actualParameters]: [PrescriptionSearchParams, Array<SearchError>] = validateRequest(mockEvent, logger)
    expect(actualParameters).toEqual(expected)
  })

  it("returns correct search parameters when called with a valid request with optional high and low dates", async () => {
    const mockEvent = {
      headers: mockHeaders,
      queryStringParameters: {...mockQueryStringParameters, ...{lowDate: "2025-01-01", highDate: "2025-02-02"}}
    } as unknown as APIGatewayProxyEvent

    const expected: PrescriptionSearchParams = {
      prescriptionId: "PRES-1234-5678",
      nhsNumber: undefined,
      creationDateRange: {
        lowDate: "2025-01-01",
        highDate: "2025-02-02"
      },
      requestId: "REQ-123-456-789",
      organizationId: "ORG-123-456-789",
      sdsRoleProfileId: "SESS-123-456-789",
      sdsId: "ID-123-456-789",
      jobRoleCode: "JOB-123-456-789"
    }

    const [actualParameters]: [PrescriptionSearchParams, Array<SearchError>] = validateRequest(mockEvent, logger)
    expect(actualParameters).toEqual(expected)
  })

  it("returns the correct error when prescriptionId and nhsNumber are missing from the requests query string parameters", async () => {
    const mockEvent = {
      headers: mockHeaders,
      queryStringParameters: {}
    } as unknown as APIGatewayProxyEvent

    const expectedErrors: Array<SearchError> = [{
      status: "400",
      severity: "error",
      description: "Missing required query string parameter; either prescriptionId or nhsNumber must be included."
    }]

    const [, actualError]: [PrescriptionSearchParams, Array<SearchError>] = validateRequest(mockEvent, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("returns the correct error when prescriptionId and nhsNumber are both included in the requests query string params", async () => {
    const mockEvent = {
      headers: mockHeaders,
      queryStringParameters: {...mockQueryStringParameters, ...{nhsNumber: "123-456-7890"}}
    } as unknown as APIGatewayProxyEvent

    const expectedErrors: Array<SearchError> = [{
      status: "400",
      severity: "error",
      description: "Invalid query string parameters; only prescriptionId or nhsNumber must be provided, not both."
    }]

    const [, actualError]: [PrescriptionSearchParams, Array<SearchError>] = validateRequest(mockEvent, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("returns the correct error when x-request-id is missing from the requests headers", async () => {
    const headers: APIGatewayProxyEventHeaders = {...mockHeaders, "x-request-id": undefined}
    const event = {
      headers: headers,
      queryStringParameters: {prescriptionId : "PRES-1234-5678"}
    } as unknown as APIGatewayProxyEvent

    const expectedErrors: Array<SearchError> = [{
      status: "400",
      severity: "error",
      description: "Missing required header, x-request-id."
    }]

    const [, actualError]: [PrescriptionSearchParams, Array<SearchError>] = validateRequest(event, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("returns the correct error when nhsd-organization-uuid is missing from the requests headers", async () => {
    const headers: APIGatewayProxyEventHeaders = {...mockHeaders, "nhsd-organization-uuid": undefined}
    const event = {
      headers: headers,
      queryStringParameters: {prescriptionId : "PRES-1234-5678"}
    } as unknown as APIGatewayProxyEvent

    const expectedErrors: Array<SearchError> = [{
      status: "400",
      severity: "error",
      description: "Missing required header, nhsd-organization-uuid."
    }]

    const [, actualError]: [PrescriptionSearchParams, Array<SearchError>] = validateRequest(event, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("returns the correct error when nhsd-session-urid is missing from the requests headers", async () => {
    const headers: APIGatewayProxyEventHeaders = {...mockHeaders, "nhsd-session-urid": undefined}
    const event = {
      headers: headers,
      queryStringParameters: {prescriptionId : "PRES-1234-5678"}
    } as unknown as APIGatewayProxyEvent

    const expectedErrors: Array<SearchError> = [{
      status: "400",
      severity: "error",
      description: "Missing required header, nhsd-session-urid."
    }]

    const [, actualError]: [PrescriptionSearchParams, Array<SearchError>] = validateRequest(event, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("returns the correct error when nhsd-identity-uuid is missing from the requests headers", async () => {
    const headers: APIGatewayProxyEventHeaders = {...mockHeaders, "nhsd-identity-uuid": undefined}
    const event = {
      headers: headers,
      queryStringParameters: {prescriptionId : "PRES-1234-5678"}
    } as unknown as APIGatewayProxyEvent

    const expectedErrors: Array<SearchError> = [{
      status: "400",
      severity: "error",
      description: "Missing required header, nhsd-identity-uuid."
    }]

    const [, actualError]: [PrescriptionSearchParams, Array<SearchError>] = validateRequest(event, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("returns the correct error when nhsd-session-jobrole is missing from the requests headers", async () => {
    const headers: APIGatewayProxyEventHeaders = {...mockHeaders, "nhsd-session-jobrole": undefined}
    const event = {
      headers: headers,
      queryStringParameters: {prescriptionId : "PRES-1234-5678"}
    } as unknown as APIGatewayProxyEvent

    const expectedErrors: Array<SearchError> = [{
      status: "400",
      severity: "error",
      description: "Missing required header, nhsd-session-jobrole."
    }]

    const [, actualError]: [PrescriptionSearchParams, Array<SearchError>] = validateRequest(event, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("returns a list of errors when multiple required headers are missing from the request", async () => {
    const event = {
      headers: {},
      queryStringParameters: {prescriptionId : "PRES-1234-5678"}
    } as unknown as APIGatewayProxyEvent

    const expectedErrors: Array<SearchError> = [
      {
        status: "400",
        severity: "error",
        description: "Missing required header, x-request-id."
      },
      {
        status: "400",
        severity: "error",
        description: "Missing required header, nhsd-organization-uuid."
      },
      {
        status: "400",
        severity: "error",
        description: "Missing required header, nhsd-session-urid."
      },
      {
        status: "400",
        severity: "error",
        description: "Missing required header, nhsd-identity-uuid."
      },
      {
        status: "400",
        severity: "error",
        description: "Missing required header, nhsd-session-jobrole."
      }
    ]

    const [, actualError]: [PrescriptionSearchParams, Array<SearchError>] = validateRequest(event, logger)
    expect(actualError).toEqual(expectedErrors)
  })
})
