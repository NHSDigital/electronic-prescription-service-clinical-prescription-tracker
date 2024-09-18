import {expect, describe, it} from "@jest/globals"
import {newHandler} from "../src/handler"
import MockAdapter from "axios-mock-adapter"
import axios from "axios"
import {APIGatewayEvent, Context} from "aws-lambda"
import {MiddyfiedHandler} from "@middy/core"
import {Logger} from "@aws-lambda-powertools/logger"
import {LogLevel} from "@aws-lambda-powertools/logger/types"
import {createSpineClient} from "@nhsdigital/eps-spine-client"

const mock = new MockAdapter(axios)

const MOCK_EVENT: APIGatewayEvent = {
  headers:{}
} as unknown as APIGatewayEvent

describe("clinical view", () => {
  let handler: MiddyfiedHandler

  beforeEach(() => {
    mock.reset()
    process.env.TargetSpineServer = "live"

    const LOG_LEVEL = process.env.LOG_LEVEL as LogLevel
    const logger = new Logger({serviceName: "getMyPrescriptions", logLevel: LOG_LEVEL})
    const spineClient = createSpineClient(logger)
    const HandlerParams = {logger, spineClient}
    handler = newHandler(HandlerParams)
  })

  it("makes a call to the clinical view interaction", async () => {
    const clinicalViewUrl = `https://live/syncservice-pds/pds`

    mock.onPost(clinicalViewUrl).reply(200, {data: "success"})

    const event = {...MOCK_EVENT} as unknown as APIGatewayEvent
    const context = {} as unknown as Context

    const response = await handler(event, context)

    expect(mock.history.post.length).toBe(1)
    expect(response.data).toEqual({data: "success"})
  })
})
