import {
  expect,
  describe,
  it,
  jest
} from "@jest/globals"
import {newHandler} from "../src/handler"
import MockAdapter from "axios-mock-adapter"
import axios from "axios"
import {APIGatewayEvent, Context} from "aws-lambda"
import {MiddyfiedHandler} from "@middy/core"
import {Logger} from "@aws-lambda-powertools/logger"
import {LogLevel} from "@aws-lambda-powertools/logger/types"
import {createSpineClient} from "@nhsdigital/eps-spine-client"
import prescriptionFoundResponse from "./data/prescriptionFoundResponse"

const mock = new MockAdapter(axios)

const MOCK_EVENT: APIGatewayEvent = {
  headers: {
    "apigw-request-id": "2aecdad4-1a4a-44de-977e-c0a2964f23dd",
    "nhsd-organization-uuid": "A83008",
    "nhsd-session-urid": "123456123456",
    "nhsd-identity-uuid": "123456123456",
    "nhsd-session-jobrole": "123456123456"
  },
  pathParameters: {
    prescriptionId: "9AD427-A83008-2E461K"
  }
} as unknown as APIGatewayEvent

const CLINICAL_VIEW_URL = `https://live/syncservice-pds/pds`

describe("clinicalView Handler", () => {
  let handler: MiddyfiedHandler
  let logger: Logger

  beforeEach(() => {
    mock.reset()
    process.env.TargetSpineServer = "live"

    const LOG_LEVEL = process.env.LOG_LEVEL as LogLevel
    logger = new Logger({serviceName: "clinicalView", logLevel: LOG_LEVEL})
    jest.spyOn(logger, "error")
    const spineClient = createSpineClient(logger)
    const HandlerParams = {logger, spineClient}
    handler = newHandler(HandlerParams)
  })

  it("Builds FHIR RequestGroup from Spine prescription response", async () => {
    mock.onPost(CLINICAL_VIEW_URL).reply(200, prescriptionFoundResponse)

    const event = {...MOCK_EVENT} as unknown as APIGatewayEvent
    const context = {} as unknown as Context

    const response = await handler(event, context)

    expect(mock.history.post[0].data).toContain("9AD427-A83008-2E461K")
    expect(response.resourceType).toBe("RequestGroup")
    expect(response.id).toBe("example-requestgroup")
  })

  it("Handles a missing prescriptionId request", async () => {
    const event = {...MOCK_EVENT, pathParameters: {}} as unknown as APIGatewayEvent
    const context = {} as unknown as Context

    const response = await handler(event, context)

    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body)).toMatchObject([
      {
        response: {
          status: "400 Bad Request",
          outcome: {
            resourceType: "OperationOutcome",
            meta: {
              lastUpdated: expect.any(String)
            },
            issue: [
              {
                code: "value",
                severity: "error",
                diagnostics: "Missing required query parameter: prescriptionId"
              }
            ]
          }
        }
      }
    ])
  })
})
