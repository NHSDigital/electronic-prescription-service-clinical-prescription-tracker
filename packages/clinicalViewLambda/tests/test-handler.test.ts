import {expect, describe, it} from "@jest/globals"
import {newHandler} from "../src/handler"
import MockAdapter from "axios-mock-adapter"
import axios from "axios"
import {APIGatewayEvent, Context} from "aws-lambda"
import {MiddyfiedHandler} from "@middy/core"
import {Logger} from "@aws-lambda-powertools/logger"
import {LogLevel} from "@aws-lambda-powertools/logger/types"
import {createSpineClient} from "@nhsdigital/eps-spine-client"
import prescriptionFoundResponse from "./data/prescriptionFoundResponse"
import prescriptionNotFoundResponse from "./data/prescriptionNotFoundResponse"

const mock = new MockAdapter(axios)

const MOCK_EVENT: APIGatewayEvent = {
  "headers": {
    "apigw-request-id": "2aecdad4-1a4a-44de-977e-c0a2964f23dd",
    "nhsd-organization-uuid": "A83008",
    "nhsd-session-urid": "123456123456",
    "nhsd-identity-uuid": "123456123456",
    "nhsd-session-jobrole": "123456123456"
  },
  "queryStringParameters": {
    "prescriptionId": "9AD427-A83008-2E461K"
  }
} as unknown as APIGatewayEvent

const CLINICAL_VIEW_URL = `https://live/syncservice-pds/pds`

describe("clinical view", () => {
  let handler: MiddyfiedHandler

  beforeEach(() => {
    mock.reset()
    process.env.TargetSpineServer = "live"

    const LOG_LEVEL = process.env.LOG_LEVEL as LogLevel
    const logger = new Logger({serviceName: "clinicalViewLambda", logLevel: LOG_LEVEL})
    const spineClient = createSpineClient(logger)
    const HandlerParams = {logger, spineClient}
    handler = newHandler(HandlerParams)
  })

  it("makes a call to the clinical view interaction", async () => {
    mock.onPost(CLINICAL_VIEW_URL).reply(200, `<some>xml</some>`)

    const event = {...MOCK_EVENT} as unknown as APIGatewayEvent
    const context = {} as unknown as Context

    await handler(event, context)

    expect(mock.history.post.length).toBe(1)
  })

  it("extracts prescription status from spine response", async () => {
    mock.onPost(CLINICAL_VIEW_URL).reply(200, prescriptionFoundResponse)

    const event = {...MOCK_EVENT} as unknown as APIGatewayEvent
    const context = {} as unknown as Context

    const response = await handler(event, context)

    expect(mock.history.post.length).toBe(1)
    expect(response.status).toBe(200)
    expect(response.data).toEqual({
      prescriptionId: "9AD427-A83008-2E461K",
      prescriptionStatus: "0001"
    })
  })

  it("handles a prescription not found response", async () => {
    mock.onPost(CLINICAL_VIEW_URL).reply(200, prescriptionNotFoundResponse)

    const event = {...MOCK_EVENT} as unknown as APIGatewayEvent
    const context = {} as unknown as Context

    const response = await handler(event, context)

    expect(mock.history.post.length).toBe(1)
    expect(response.status).toBe(404)
    expect(response.data).toEqual({
      prescriptionId: "9AD427-A83008-2E461K",
      error: "Not Found"
    })
  })

  it("handles a non-200 response from spine", async () => {
    mock.onPost(CLINICAL_VIEW_URL).reply(500, "<some>xml</some>")

    const event = {...MOCK_EVENT} as unknown as APIGatewayEvent
    const context = {} as unknown as Context

    const response = await handler(event, context)

    // Spine client retries 3 times
    expect(mock.history.post.length).toBe(4)
    expect(response.status).toBe(500)
    expect(response.data).toEqual({
      prescriptionId: "9AD427-A83008-2E461K",
      error: "Internal Server Error"
    })
  })
})
