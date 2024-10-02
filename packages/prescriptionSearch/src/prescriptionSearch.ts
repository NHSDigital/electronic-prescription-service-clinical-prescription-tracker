import {SpineClient} from "@nhsdigital/eps-spine-client/lib/spine-client"
import {LogLevel} from "@aws-lambda-powertools/logger/types"
import {Logger} from "@aws-lambda-powertools/logger"
import {createSpineClient} from "@nhsdigital/eps-spine-client"
import {APIGatewayEvent, APIGatewayProxyResult} from "aws-lambda"
import middy from "@middy/core"
import {PrescriptionSearchParams} from "@nhsdigital/eps-spine-client/lib/live-spine-client"
import {bundleSchema} from "./schema/request"
import {bundleSchema as responseBundleSchema, outcomeSchema} from "./schema/response"

export const LOG_LEVEL = process.env.LOG_LEVEL as LogLevel
export const logger = new Logger({serviceName: "prescriptionSearch", logLevel: LOG_LEVEL})
const spineClient = createSpineClient(logger)

type HandlerParams = {
  logger: Logger,
  spineClient: SpineClient
}

export const apiGatewayHandler = async (
  params: HandlerParams,
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const inboundHeaders = event.headers

  const requestId = inboundHeaders["apigw-request-id"] ?? ""
  const organizationId = inboundHeaders["nhsd-organization-uuid"] ?? ""
  const sdsRoleProfileId = inboundHeaders["nhsd-session-urid"] ?? ""
  const sdsId = inboundHeaders["nhsd-identity-uuid"] ?? ""
  const jobRoleCode = inboundHeaders["nhsd-session-jobrole"] ?? ""

  const prescriptionId = event.queryStringParameters?.prescriptionId ?? ""

  // Handle missing prescriptionId
  if (!prescriptionId) {
    return {
      statusCode: 400,
      body: JSON.stringify({message: "Missing required query parameter: prescriptionId"})
    }
  }

  const nhsNumber = event.queryStringParameters?.nhsNumber
  const lowDate = event.queryStringParameters?.lowDate
  const highDate = event.queryStringParameters?.highDate
  const creationDateRange = (lowDate || highDate) ? {lowDate, highDate} : undefined

  const prescriptionSearchParams: PrescriptionSearchParams = {
    requestId,
    prescriptionId,
    organizationId,
    sdsRoleProfileId,
    sdsId,
    jobRoleCode,
    nhsNumber,
    creationDateRange
  }

  const response = await params.spineClient.prescriptionSearch(inboundHeaders, prescriptionSearchParams)

  return {
    statusCode: response.status,
    body: response.data
  }
}

export const newHandler = (params: HandlerParams) => {
  const newHandler = middy((event: APIGatewayEvent) => apiGatewayHandler(params, event))
  return newHandler
}

const DEFAULT_HANDLER_PARAMS: HandlerParams = {logger, spineClient}
export const handler = newHandler(DEFAULT_HANDLER_PARAMS)

export {bundleSchema, responseBundleSchema, outcomeSchema}
