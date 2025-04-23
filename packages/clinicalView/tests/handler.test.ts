// import {
//   expect,
//   describe,
//   it,
//   jest
// } from "@jest/globals"
// import {newHandler} from "../src/handler"
// import MockAdapter from "axios-mock-adapter"
// import axios from "axios"
// import {APIGatewayEvent, Context} from "aws-lambda"
// import {MiddyfiedHandler} from "@middy/core"
// import {Logger} from "@aws-lambda-powertools/logger"
// import {LogLevel} from "@aws-lambda-powertools/logger/types"
// import {createSpineClient} from "@NHSDigital/eps-spine-client"
// import acuteDispensed from "./data/acuteDispensed"

// const mock = new MockAdapter(axios)

// const MOCK_EVENT: APIGatewayEvent = {
//   headers: {
//     "apigw-request-id": "2aecdad4-1a4a-44de-977e-c0a2964f23dd",
//     "nhsd-organization-uuid": "A83008",
//     "nhsd-session-urid": "123456123456",
//     "nhsd-identity-uuid": "123456123456",
//     "nhsd-session-jobrole": "123456123456",
//     "x-request-id": "123456123456"
//   },
//   pathParameters: {
//     prescriptionId: "9AD427-A83008-2E461K"
//   }
// } as unknown as APIGatewayEvent

// const CLINICAL_VIEW_URL = `https://live/syncservice-pds/pds`

// describe("clinicalView Handler", () => {
//   let handler: MiddyfiedHandler
//   let logger: Logger

//   beforeEach(() => {
//     mock.reset()
//     process.env.TargetSpineServer = "live"

//     const LOG_LEVEL = process.env.LOG_LEVEL as LogLevel
//     logger = new Logger({serviceName: "clinicalView", logLevel: LOG_LEVEL})
//     jest.spyOn(logger, "error")
//     const spineClient = createSpineClient(logger)
//     const HandlerParams = {logger, spineClient}
//     handler = newHandler(HandlerParams)
//   })

//   it("Builds FHIR RequestGroup from Spine prescription response", async () => {
//     mock.onPost(CLINICAL_VIEW_URL).reply(200, acuteDispensed)

//     const event = {...MOCK_EVENT} as unknown as APIGatewayEvent
//     const context = {} as unknown as Context

//     const response = await handler(event, context)

//     // Parse the FHIR response from the API Gateway response body
//     const parsedResponse = JSON.parse(response.body)

//     expect(mock.history.post[0].data).toContain("9AD427-A83008-2E461K")
//     expect(parsedResponse.resourceType).toBe("RequestGroup")
//     expect(parsedResponse.id).toBeDefined()
//   })

//   it("Returns multiple errors when all required headers are missing", async () => {
//     const event = {...MOCK_EVENT, headers: {}} as unknown as APIGatewayEvent
//     const context = {} as unknown as Context

//     const response = await handler(event, context)
//     expect(response.statusCode).toBe(400)

//     const parsedBody = JSON.parse(response.body)
//     expect(parsedBody.issue).toHaveLength(5)

//     const expectedErrors = [
//       "Missing required header, nhsd-organization-uuid.",
//       "Missing required header, nhsd-session-urid.",
//       "Missing required header, nhsd-identity-uuid.",
//       "Missing required header, nhsd-session-jobrole.",
//       "Missing required header, x-request-id."
//     ]

//     expectedErrors.forEach((errorMessage) => {
//       expect(parsedBody.issue).toEqual(
//         expect.arrayContaining([
//           expect.objectContaining({diagnostics: errorMessage})
//         ])
//       )
//     })
//   })

//   it.each([
//     ["nhsd-organization-uuid"],
//     ["nhsd-session-urid"],
//     ["nhsd-identity-uuid"],
//     ["nhsd-session-jobrole"],
//     ["x-request-id"]
//   ])("Returns an error when %s is missing", async (missingHeader) => {
//     const event = {
//       ...MOCK_EVENT,
//       headers: {
//         ...MOCK_EVENT.headers,
//         [missingHeader]: undefined
//       }
//     } as unknown as APIGatewayEvent

//     const context = {} as unknown as Context
//     const response = await handler(event, context)

//     expect(response.statusCode).toBe(400)
//     expect(JSON.parse(response.body).issue).toEqual(
//       expect.arrayContaining([
//         expect.objectContaining({
//           diagnostics: `Missing required header, ${missingHeader}.`
//         })
//       ])
//     )
//   })

//   it("Returns an error when prescriptionId is missing", async () => {
//     const event = {...MOCK_EVENT, pathParameters: {}} as unknown as APIGatewayEvent
//     const context = {} as unknown as Context

//     const response = await handler(event, context)

//     expect(response.statusCode).toBe(400)
//     expect(JSON.parse(response.body).issue).toEqual(
//       expect.arrayContaining([
//         expect.objectContaining({
//           diagnostics: "Missing required path parameter: prescriptionId."
//         })
//       ])
//     )
//   })
// })
