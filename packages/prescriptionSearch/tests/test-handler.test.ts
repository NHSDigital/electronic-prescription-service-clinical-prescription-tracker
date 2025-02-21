import {jest} from "@jest/globals"
import MockAdapter from "axios-mock-adapter"
import axios from "axios"
import {MiddyfiedHandler} from "@middy/core"
import {Logger} from "@aws-lambda-powertools/logger"
import {createSpineClient} from "@NHSDigital/eps-spine-client"

// Types
import {APIGatewayProxyEvent, APIGatewayProxyEventHeaders, Context} from "aws-lambda"
import {SpineClient} from "@NHSDigital/eps-spine-client/lib/spine-client"

const prescriptionStatusUrl = `https://live/syncservice-pds/pds`
const mockAxios = new MockAdapter(axios)
const mockHeaders: APIGatewayProxyEventHeaders = {
  "nhsd-correlation-id": "NHSD-COR-123-456",
  "nhsd-request-id":  "NHSD-REQ-123-345",
  "x-correlation-id": "COR-123-456",
  "x-request-id": "REQ-123-456-789",
  "nhsd-organization-uuid": "ORG-123-456-789",
  "nhsd-session-urid": "SESS-123-456-789",
  "nhsd-identity-uuid": "ID-123-456-789",
  "nhsd-session-jobrole": "JOB-123-456-789"
}
const mockEvent = {
  headers: mockHeaders,
  queryStringParameters: {
    prescriptionId : "PRES-1234-5678"
  },
  requestContext: {
    requestId: "API-GW-REQ-123"
  }
} as unknown as APIGatewayProxyEvent
const mockContext = {} as unknown as Context

let mockValidate = jest.fn()
jest.unstable_mockModule("../src/validateRequest", () => {
  return{
    validateRequest: mockValidate
  }
})

const {newHandler} = await import("../src/prescriptionSearch")
const {validateRequest} = await import("../src/validateRequest")

describe("test handler", () => {
  let handler: MiddyfiedHandler

  beforeAll(() => {
    process.env.TargetSpineServer = "live"
  })
  beforeEach(() => {
    jest.resetAllMocks()
    mockAxios.reset()
    // TODO: can these be in the before all?
    const logger: Logger = new Logger({serviceName: "prescriptionSearch", logLevel: "DEBUG"})
    const spineClient: SpineClient = createSpineClient(logger)
    handler = newHandler({logger, spineClient})
  })

  it("correctly configures the logger when called", async () => {})

  it("validates the request when called", async () => {
    mockValidate.mockReturnValue([{}, []])
    mockAxios.onPost(prescriptionStatusUrl).reply(200, {data: "success"})

    await handler(mockEvent, mockContext)
    expect(validateRequest).toHaveBeenCalled()
  })

  // test("should successfully call the prescription search interaction", async () => {
  //   mockAxios.onPost(prescriptionStatusUrl).reply(200, {data: "success"})

  //   const event = {...MOCK_EVENT, queryStringParameters: {prescriptionId: "12345"}} as unknown as APIGatewayEvent
  //   const context = {} as unknown as Context

  //   const response = await handler(event, context)

  //   expect(mockAxios.history.post.length).toBe(1)
  //   expect(response.body).toEqual({data: "success"})
  // })

  // test("should handle missing required query parameter (prescriptionId)", async () => {
  //   const event = {...MOCK_EVENT, queryStringParameters: {}} as unknown as APIGatewayEvent
  //   const context = {} as unknown as Context

  //   const response = await handler(event, context)

  //   expect(mockAxios.history.post.length).toBe(0)
  //   expect(response.statusCode).toEqual(400)
  //   expect(JSON.parse(response.body)).toEqual(
  //     [
  //       {"response": {
  //         "outcome": {
  //           "issue": [{
  //             "code": "value",
  //             "diagnostics": "Missing required query parameter: prescriptionId",
  //             "severity": "error"
  //           }],
  //           "meta": {
  //             "lastUpdated": expect.any(String)
  //           },
  //           "resourceType": "OperationOutcome"
  //         }, "status": "400 Bad Request"
  //       }}]
  //   )
  // })

  // test("should initialize the logger with correct parameters", () => {
  //   const logger = new Logger({serviceName: "prescriptionSearch", logLevel: LOG_LEVEL})
  //   expect(logger).toBeDefined()
  // })

  // test("should create a spine client", () => {
  //   const spineClient = createSpineClient(new Logger({serviceName: "prescriptionSearch", logLevel: LOG_LEVEL}))
  //   expect(spineClient).toBeDefined()
  // })

  // it("when x-request-id header is missing, expect 400 status code and relevant error message", async () => {
  //   const event = {...MOCK_EVENT, queryStringParameters: {prescriptionId: "12345"}} as unknown as APIGatewayEvent
  //   const context = {} as unknown as Context
  //   event.headers["x-request-id"] = undefined
  //   const response = await handler(event, context)

  //   expect(response.statusCode).toEqual(400)
  //   expect(JSON.parse(response.body)).toEqual(
  //     [
  //       {"response": {
  //         "outcome": {
  //           "issue": [{
  //             "code": "value",
  //             "diagnostics": "Missing or empty x-request-id header",
  //             "severity": "error"
  //           }],
  //           "meta": {
  //             "lastUpdated": expect.any(String)
  //           },
  //           "resourceType": "OperationOutcome"
  //         }, "status": "400 Bad Request"
  //       }}]
  //   )

  // })
})
