import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda"
import {handler} from "../scr/prescriptionSearch"
import {expect, describe, it} from "@jest/globals"


describe('Always Passing Test Suite', () => {
  it('should always pass', async () => {
    const dummyEvent: APIGatewayProxyEvent = {} as APIGatewayProxyEvent
    const dummyContext: any = {}
    const result: APIGatewayProxyResult = await handler(dummyEvent, dummyContext)
    expect(true).toBe(true)
  })
})
