import {jest} from "@jest/globals"
import {Logger} from "@aws-lambda-powertools/logger"
import {validateRequest} from "../src/validateRequest"

// Types
import {APIGatewayProxyEvent, APIGatewayProxyEventHeaders, APIGatewayProxyEventPathParameters} from "aws-lambda"
import {ClinicalViewParams} from "@NHSDigital/eps-spine-client/lib/live-spine-client"
import {ServiceError} from "@cpt-common/common-types/service"

const logger: Logger = new Logger({serviceName: "clinicalView", logLevel: "DEBUG"})

const mockHeaders: APIGatewayProxyEventHeaders = {
  "x-request-id": "REQ-123-456-789",
  "nhsd-organization-uuid": "ORG-123-456-789",
  "nhsd-session-urid": "SESS-123-456-789",
  "nhsd-identity-uuid": "ID-123-456-789",
  "nhsd-session-jobrole": "JOB-123-456-789"
}

const mockPathParameters: APIGatewayProxyEventPathParameters = {
  prescriptionId: "54F746-A83008-E8A05J"
}

describe("Test validateRequest for ClinicalView Lambda", () => {

  it("updates the logger when called with a valid request", async () => {
    const appendKeySpy = jest.spyOn(Logger.prototype, "appendKeys")
    const mockEvent = {
      headers: mockHeaders,
      pathParameters: mockPathParameters
    } as unknown as APIGatewayProxyEvent

    validateRequest(mockEvent, logger)
    expect(appendKeySpy).toHaveBeenLastCalledWith({
      "x-request-id": "REQ-123-456-789"
    })
  })

  it("returns correct search parameters when called with a valid request", async () => {
    const mockEvent = {
      headers: mockHeaders,
      pathParameters: mockPathParameters
    } as unknown as APIGatewayProxyEvent

    const expected: ClinicalViewParams = {
      prescriptionId: "54F746-A83008-E8A05J",
      requestId: "REQ-123-456-789",
      organizationId: "ORG-123-456-789",
      sdsRoleProfileId: "SESS-123-456-789",
      sdsId: "ID-123-456-789",
      jobRoleCode: "JOB-123-456-789"
    }

    const [actualParameters, actualErrors]: [ClinicalViewParams, Array<ServiceError>] =
      validateRequest(mockEvent, logger)
    expect(actualParameters).toEqual(expected)
    expect(actualErrors).toEqual([])
  })

  it("returns correct search parameters when called with a valid request with optional parameters", async () => {
    const mockEvent = {
      headers: mockHeaders,
      pathParameters: mockPathParameters,
      queryStringParameters: {issueNumber: "1"}
    } as unknown as APIGatewayProxyEvent

    const expected: ClinicalViewParams = {
      prescriptionId: "54F746-A83008-E8A05J",
      repeatNumber: "1",
      requestId: "REQ-123-456-789",
      organizationId: "ORG-123-456-789",
      sdsRoleProfileId: "SESS-123-456-789",
      sdsId: "ID-123-456-789",
      jobRoleCode: "JOB-123-456-789"
    }

    const [actualParameters]: [ClinicalViewParams, Array<ServiceError>] = validateRequest(mockEvent, logger)
    expect(actualParameters).toEqual(expected)
  })

  it("returns the correct error when prescriptionId is missing", async () => {
    const mockEvent = {
      headers: mockHeaders,
      pathParameters: {}
    } as unknown as APIGatewayProxyEvent

    const expectedErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "Missing required path parameter: prescriptionId."
      },
      {
        status: 400,
        severity: "error",
        description: "prescriptionId does not match required format."
      },
      {
        status: 400,
        severity: "error",
        description: "prescriptionId checksum is invalid."
      }
    ]

    const [, actualError]: [ClinicalViewParams, Array<ServiceError>] = validateRequest(mockEvent, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("returns the correct errors when the prescriptionId is in a invalid format", async () => {
    const mockEvent = {
      headers: mockHeaders,
      pathParameters: {
        prescriptionId: "54746-A8308-E8A05J"
      }
    } as unknown as APIGatewayProxyEvent

    const expectedErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "prescriptionId does not match required format."
      },
      {
        status: 400,
        severity: "error",
        description: "prescriptionId checksum is invalid."
      }
    ]

    const [, actualError]: [ClinicalViewParams, Array<ServiceError>] = validateRequest(mockEvent, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("returns the correct error when the prescriptionId checksum is invalid", async () => {
    const mockEvent = {
      headers: mockHeaders,
      pathParameters: {
        prescriptionId: "CBEF44-000X26-41E1B1"
      }
    } as unknown as APIGatewayProxyEvent

    const expectedErrors: Array<ServiceError> = [{
      status: 400,
      severity: "error",
      description: "prescriptionId checksum is invalid."
    }]

    const [, actualError]: [ClinicalViewParams, Array<ServiceError>] = validateRequest(mockEvent, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("returns the correct error when x-request-id is missing", async () => {
    const headers: APIGatewayProxyEventHeaders = {...mockHeaders, "x-request-id": undefined}
    const event = {
      headers: headers,
      pathParameters: mockPathParameters
    } as unknown as APIGatewayProxyEvent

    const expectedErrors: Array<ServiceError> = [{
      status: 400,
      severity: "error",
      description: "Missing required header, x-request-id."
    }]

    const [, actualError]: [ClinicalViewParams, Array<ServiceError>] = validateRequest(event, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("returns the correct error when nhsd-organization-uuid is missing", async () => {
    const headers: APIGatewayProxyEventHeaders = {...mockHeaders, "nhsd-organization-uuid": undefined}
    const event = {
      headers: headers,
      pathParameters: mockPathParameters
    } as unknown as APIGatewayProxyEvent

    const expectedErrors: Array<ServiceError> = [{
      status: 400,
      severity: "error",
      description: "Missing required header, nhsd-organization-uuid."
    }]

    const [, actualError]: [ClinicalViewParams, Array<ServiceError>] = validateRequest(event, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("returns the correct error when nhsd-session-urid is missing", async () => {
    const headers: APIGatewayProxyEventHeaders = {...mockHeaders, "nhsd-session-urid": undefined}
    const event = {
      headers: headers,
      pathParameters: mockPathParameters
    } as unknown as APIGatewayProxyEvent

    const expectedErrors: Array<ServiceError> = [{
      status: 400,
      severity: "error",
      description: "Missing required header, nhsd-session-urid."
    }]

    const [, actualError]: [ClinicalViewParams, Array<ServiceError>] = validateRequest(event, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("returns the correct error when nhsd-identity-uuid is missing", async () => {
    const headers: APIGatewayProxyEventHeaders = {...mockHeaders, "nhsd-identity-uuid": undefined}
    const event = {
      headers: headers,
      pathParameters: mockPathParameters
    } as unknown as APIGatewayProxyEvent

    const expectedErrors: Array<ServiceError> = [{
      status: 400,
      severity: "error",
      description: "Missing required header, nhsd-identity-uuid."
    }]

    const [, actualError]: [ClinicalViewParams, Array<ServiceError>] = validateRequest(event, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("returns the correct error when nhsd-session-jobrole is missing", async () => {
    const headers: APIGatewayProxyEventHeaders = {...mockHeaders, "nhsd-session-jobrole": undefined}
    const event = {
      headers: headers,
      pathParameters: mockPathParameters
    } as unknown as APIGatewayProxyEvent

    const expectedErrors: Array<ServiceError> = [{
      status: 400,
      severity: "error",
      description: "Missing required header, nhsd-session-jobrole."
    }]

    const [, actualError]: [ClinicalViewParams, Array<ServiceError>] = validateRequest(event, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("returns a list of errors when multiple required headers are missing", async () => {
    const event = {
      headers: {},
      pathParameters: mockPathParameters
    } as unknown as APIGatewayProxyEvent

    const expectedErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "Missing required header, x-request-id."
      },
      {
        status: 400,
        severity: "error",
        description: "Missing required header, nhsd-organization-uuid."
      },
      {
        status: 400,
        severity: "error",
        description: "Missing required header, nhsd-session-urid."
      },
      {
        status: 400,
        severity: "error",
        description: "Missing required header, nhsd-identity-uuid."
      },
      {
        status: 400,
        severity: "error",
        description: "Missing required header, nhsd-session-jobrole."
      }
    ]

    const [, actualError]: [ClinicalViewParams, Array<ServiceError>] = validateRequest(event, logger)
    expect(actualError).toEqual(expectedErrors)
  })
})
