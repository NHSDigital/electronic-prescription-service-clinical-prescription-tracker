/* eslint-disable max-len */

import {jest} from "@jest/globals"
import MockAdapter from "axios-mock-adapter"
import axios from "axios"
import {MiddyfiedHandler} from "@middy/core"
import {Logger} from "@aws-lambda-powertools/logger"
import {createSpineClient} from "@NHSDigital/eps-spine-client"
import {APIGatewayProxyEvent, APIGatewayProxyEventHeaders, Context} from "aws-lambda"
import {SpineClient} from "@NHSDigital/eps-spine-client/lib/spine-client"

const clinicalViewUrl = `https://live/syncservice-pds/pds`
const mockAxios = new MockAdapter(axios)
const mockHeaders: APIGatewayProxyEventHeaders = {
  "nhsd-correlation-id": "NHSD-COR-123-456",
  "nhsd-request-id": "NHSD-REQ-123-345",
  "x-correlation-id": "COR-123-456",
  "x-request-id": "REQ-123-456-789",
  "nhsd-organization-uuid": "ORG-123-456-789",
  "nhsd-session-urid": "SESS-123-456-789",
  "nhsd-identity-uuid": "ID-123-456-789",
  "nhsd-session-jobrole": "JOB-123-456-789"
}
const mockEvent = {
  headers: mockHeaders,
  pathParameters: {
    prescriptionId: "PRES-1234-5678"
  },
  requestContext: {
    requestId: "API-GW-REQ-123"
  }
} as unknown as APIGatewayProxyEvent
const mockContext = {} as unknown as Context

let mockValidate = jest.fn()
jest.unstable_mockModule("../src/validateRequest", () => {
  return {
    validateRequest: mockValidate
  }
})

let mockParseSpineResponse = jest.fn()
jest.unstable_mockModule("../src/parseSpineResponse", () => {
  return {
    parseSpineResponse: mockParseSpineResponse
  }
})

let mockGenerateFhirResponse = jest.fn()
jest.unstable_mockModule("../src/generateFhirResponse", () => {
  return {
    generateFhirResponse: mockGenerateFhirResponse
  }
})

let mockGenerateFhirErrorResponse = jest.fn()
jest.unstable_mockModule("@cpt-common/common-utils", () => {
  return {
    generateFhirErrorResponse: mockGenerateFhirErrorResponse
  }
})

const {newHandler} = await import("../src/handler")
const {validateRequest} = await import("../src/validateRequest")
const {parseSpineResponse} = await import("../src/parseSpineResponse")
const {generateFhirResponse} = await import("../src/generateFhirResponse")
const {generateFhirErrorResponse} = await import("@cpt-common/common-utils")

describe("test handler", () => {
  let handler: MiddyfiedHandler

  beforeAll(() => {
    process.env.TargetSpineServer = "live"
  })
  beforeEach(() => {
    jest.resetAllMocks()
    mockAxios.reset()
    const logger: Logger = new Logger({serviceName: "prescriptionSearch", logLevel: "DEBUG"})
    const spineClient: SpineClient = createSpineClient(logger)
    handler = newHandler({logger, spineClient})
  })

  it("correctly configures the logger when called", async () => {
    const appendKeySpy = jest.spyOn(Logger.prototype, "appendKeys")
    mockValidate.mockReturnValue([{}, []])
    mockAxios.onPost(clinicalViewUrl).reply(200, {data: "success"})
    mockParseSpineResponse.mockReturnValue({})
    mockGenerateFhirResponse.mockReturnValue({})

    await handler(mockEvent, mockContext)
    expect(appendKeySpy).toHaveBeenLastCalledWith({
      "nhsd-correlation-id": "NHSD-COR-123-456",
      "nhsd-request-id": "NHSD-REQ-123-345",
      "x-correlation-id": "COR-123-456",
      "apigw-request-id": "API-GW-REQ-123"
    })
  })

  it("validates the request when called", async () => {
    mockValidate.mockReturnValue([{}, []])
    mockAxios.onPost(clinicalViewUrl).reply(200, {data: "success"})
    mockParseSpineResponse.mockReturnValue({})
    mockGenerateFhirResponse.mockReturnValue({})

    await handler(mockEvent, mockContext)
    expect(validateRequest).toHaveBeenCalled()
  })

  it("calls the spine clinical view interaction when called", async () => {
    mockValidate.mockReturnValue([{}, []])
    mockAxios.onPost(clinicalViewUrl).reply(200, {data: "success"})
    mockParseSpineResponse.mockReturnValue({})
    mockGenerateFhirResponse.mockReturnValue({})

    await handler(mockEvent, mockContext)
    expect(mockAxios.history.post.length).toEqual(1)
    expect(mockAxios.history.post[0].url).toEqual(clinicalViewUrl)
    expect(mockAxios.history.post[0].data).toContain("<wsa:Action>urn:nhs:names:services:mmquery/QURX_IN000005UK98</wsa:Action>")
  })

  it("parses the spine response when spine returns a successful response", async () => {
    mockValidate.mockReturnValue([{}, []])
    mockAxios.onPost(clinicalViewUrl).reply(200, {data: "success"})
    mockParseSpineResponse.mockReturnValue({})
    mockGenerateFhirResponse.mockReturnValue({})

    await handler(mockEvent, mockContext)
    expect(parseSpineResponse).toHaveBeenCalled()
  })

  it("generates the FHIR RequestGroup when spine returns a successful response", async () => {
    mockValidate.mockReturnValue([{}, []])
    mockAxios.onPost(clinicalViewUrl).reply(200, {data: "success"})
    mockParseSpineResponse.mockReturnValue({})
    mockGenerateFhirResponse.mockReturnValue({})

    await handler(mockEvent, mockContext)
    expect(generateFhirResponse).toHaveBeenCalled()
  })

  it("returns the FHIR RequestGroup and a 200 response when pine returns a successful response", async () => {
    mockValidate.mockReturnValue([{requestId: "REQ-123-456-789"}, []])
    mockAxios.onPost(clinicalViewUrl).reply(200, {data: "success"})
    mockParseSpineResponse.mockReturnValue({})
    mockGenerateFhirResponse.mockReturnValue({
      resourceType: "RequestGroup",
      id: "RGROUP-123-567-890"
    })

    const expectedResponse = {
      statusCode: 200,
      body: "{\"resourceType\":\"RequestGroup\",\"id\":\"RGROUP-123-567-890\"}",
      headers: {
        "Content-Type": "application/fhir+json",
        "Cache-Control": "no-cache",
        "x-correlation-id": "COR-123-456",
        "x-request-id": "REQ-123-456-789"
      }
    }

    const actualResponse = await handler(mockEvent, mockContext)
    expect(actualResponse).toEqual(expectedResponse)
  })

  it("generates a OperationOutcome and returns it and a 400 response when there is an error validating the request", async () => {
    mockValidate.mockReturnValue([{requestId: "REQ-123-456-789"}, [{
      status: "400",
      severity: "error",
      description: "Missing required path parameter: prescriptionId."
    }]])
    const mockOperationOutcome = {
      resourceType: "OperationOutcome",
      meta: {
        lastUpdated: "2015-04-09T12:34:56.001Z"
      },
      issue: [{
        code: "400",
        severity: "error",
        diagnostics: "Missing required path parameter: prescriptionId.",
        details: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
            code: "400 Bad Request",
            display: "400: The Server was unable to process the request."
          }]
        }
      }]
    }
    mockGenerateFhirErrorResponse.mockReturnValue(mockOperationOutcome)

    const expectedResponse = {
      statusCode: 400,
      body: JSON.stringify(mockOperationOutcome),
      headers: {
        "Content-Type": "application/fhir+json",
        "Cache-Control": "no-cache",
        "x-correlation-id": "COR-123-456",
        "x-request-id": "REQ-123-456-789"
      }
    }

    const actualResponse = await handler(mockEvent, mockContext)
    expect(generateFhirErrorResponse).toHaveBeenCalled()
    expect(actualResponse).toEqual(expectedResponse)
  })

  it("generates a OperationOutcome and returns it and a 404 response when spine returns a not found error", async () => {
    mockValidate.mockReturnValue([{requestId: "REQ-123-456-789"}, []])
    mockAxios.onPost(clinicalViewUrl).reply(200, {data: "success"})
    mockParseSpineResponse.mockReturnValue({
      spineError: {
        status: 404,
        severity: "error",
        description: "Not Found"
      }
    })
    const mockOperationOutcome = {
      resourceType: "OperationOutcome",
      meta: {
        lastUpdated: "2015-04-09T12:34:56.001Z"
      },
      issue: [{
        code: "not-found",
        severity: "error",
        diagnostics: "Prescription not found",
        details: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
            code: "NOT_FOUND",
            display: "404: The Server was unable to find the specified resource."
          }]
        }
      }]
    }
    mockGenerateFhirErrorResponse.mockReturnValue(mockOperationOutcome)

    const expectedResponse = {
      statusCode: 404,
      body: JSON.stringify(mockOperationOutcome),
      headers: {
        "Content-Type": "application/fhir+json",
        "Cache-Control": "no-cache",
        "x-correlation-id": "COR-123-456",
        "x-request-id": "REQ-123-456-789"
      }
    }

    const actualResponse = await handler(mockEvent, mockContext)
    expect(generateFhirErrorResponse).toHaveBeenCalled()
    expect(actualResponse).toEqual(expectedResponse)
  })

  it("generates a OperationOutcome and returns it and a 500 response when spine returns any other error", async () => {
    mockValidate.mockReturnValue([{requestId: "REQ-123-456-789"}, []])
    mockAxios.onPost(clinicalViewUrl).reply(200, {data: "success"})
    mockParseSpineResponse.mockReturnValue({
      spineError: {
        status: 500,
        severity: "error",
        description: "Unknown Error."
      }
    })
    const mockOperationOutcome = {
      resourceType: "OperationOutcome",
      meta: {
        lastUpdated: "2015-04-09T12:34:56.001Z"
      },
      issue: [{
        code: "500",
        severity: "error",
        diagnostics: "Unknown Error.",
        details: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
            code: "500 Internal Server Error",
            display: "500: The Server has encountered an error processing the request."
          }]
        }
      }]
    }
    mockGenerateFhirErrorResponse.mockReturnValue(mockOperationOutcome)

    const expectedResponse = {
      statusCode: 500,
      body: JSON.stringify(mockOperationOutcome),
      headers: {
        "Content-Type": "application/fhir+json",
        "Cache-Control": "no-cache",
        "x-correlation-id": "COR-123-456",
        "x-request-id": "REQ-123-456-789"
      }
    }

    const actualResponse = await handler(mockEvent, mockContext)
    expect(generateFhirErrorResponse).toHaveBeenCalled()
    expect(actualResponse).toEqual(expectedResponse)
  })
})
