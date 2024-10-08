import {expect, describe, test} from "@jest/globals"
import {newHandler, LOG_LEVEL} from "../src/prescriptionSearch"
import MockAdapter from "axios-mock-adapter"
import axios from "axios"
import {APIGatewayEvent, Context} from "aws-lambda"
import {MiddyfiedHandler} from "@middy/core"
import {Logger} from "@aws-lambda-powertools/logger"
import {createSpineClient} from "@nhsdigital/eps-spine-client"

const mock = new MockAdapter(axios)

const MOCK_EVENT: APIGatewayEvent = {
  headers: {},
  queryStringParameters: {}
} as unknown as APIGatewayEvent

const prescriptionStatusUrl = `https://live/syncservice-pds/pds`

describe("Unit test for app handler", () => {
  let handler: MiddyfiedHandler

  beforeEach(() => {
    mock.reset()
    process.env.TargetSpineServer = "live"
    const logger = new Logger({serviceName: "prescriptionSearch", logLevel: LOG_LEVEL})
    const spineClient = createSpineClient(logger)
    const HandlerParams = {logger, spineClient}
    handler = newHandler(HandlerParams)
  })

  test("should successfully call the prescription search interaction", async () => {
    mock.onPost(prescriptionStatusUrl).reply(200, {data: "success"})

    const event = {...MOCK_EVENT, queryStringParameters: {prescriptionId: "12345"}} as unknown as APIGatewayEvent
    const context = {} as unknown as Context

    const response = await handler(event, context)

    expect(mock.history.post.length).toBe(1)
    expect(response.body).toEqual({data: "success"})
  })

  test("should handle missing required query parameter (prescriptionId)", async () => {
    const event = {...MOCK_EVENT, queryStringParameters: {}} as unknown as APIGatewayEvent
    const context = {} as unknown as Context

    const response = await handler(event, context)

    expect(mock.history.post.length).toBe(0)
    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({message: "Missing required query parameter: prescriptionId"})
    })
  })

  test("should handle optional query parameters correctly", async () => {
    const event = {
      ...MOCK_EVENT,
      queryStringParameters: {
        prescriptionId: "6FC23E-A83008-FEE8BK",
        nhsNumber: "9449304130",
        lowDate: "2023-01-01",
        highDate: "2023-12-31"
      }
    } as unknown as APIGatewayEvent

    const context = {} as unknown as Context

    mock.onPost(prescriptionStatusUrl).reply(200, {data: "success"})

    const response = await handler(event, context)

    expect(mock.history.post.length).toBe(1)
    expect(response.body).toEqual({data: "success"})
  })

  test("should build creationDateRange when dates are provided", async () => {
    const event = {
      ...MOCK_EVENT,
      queryStringParameters: {
        prescriptionId: "6FC23E-A83008-FEE8BK",
        lowDate: "2023-01-01",
        highDate: "2023-12-31"
      }
    } as unknown as APIGatewayEvent

    const context = {} as unknown as Context

    mock.onPost(prescriptionStatusUrl).reply(200, {data: "success"})

    const response = await handler(event, context)

    expect(mock.history.post.length).toBe(1)
    expect(response.body).toEqual({data: "success"})
  })

  test("should initialize the logger with correct parameters", () => {
    const logger = new Logger({serviceName: "prescriptionSearch", logLevel: LOG_LEVEL})
    expect(logger).toBeDefined()
  })

  test("should create a spine client", () => {
    const spineClient = createSpineClient(new Logger({serviceName: "prescriptionSearch", logLevel: LOG_LEVEL}))
    expect(spineClient).toBeDefined()
  })
})
