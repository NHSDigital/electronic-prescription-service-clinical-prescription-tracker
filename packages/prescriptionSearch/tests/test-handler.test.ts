import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda"
import {handler} from "../scr/prescriptionSearch"
import {expect, describe, it} from "@jest/globals"
import {
  mockAPIGatewayProxyEvent,
  test_append_trace_ids,
  test_mime_type,
  helloworldContext
} from "@clinicaltracker_common/testing"

const dummyContext = helloworldContext
const mockEvent: APIGatewayProxyEvent = mockAPIGatewayProxyEvent

describe('Always True Test Suite', () => {
  it('should always pass', async () => {
    const event: APIGatewayProxyEvent = {
      ...mockEvent,
    }
    const result: APIGatewayProxyResult = await handler(event, dummyContext)
    expect(true).toBe(true)
  })
})
