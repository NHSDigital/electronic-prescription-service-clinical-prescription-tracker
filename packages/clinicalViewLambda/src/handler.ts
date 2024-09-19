import {SpineClient} from "@nhsdigital/eps-spine-client/lib/spine-client"
import {LogLevel} from "@aws-lambda-powertools/logger/types"
import {Logger} from "@aws-lambda-powertools/logger"
import {createSpineClient} from "@nhsdigital/eps-spine-client"
import {APIGatewayEvent} from "aws-lambda"
import middy from "@middy/core"
import {ClinicalViewParams} from "@nhsdigital/eps-spine-client/lib/live-spine-client"

const LOG_LEVEL = process.env.LOG_LEVEL as LogLevel
export const logger = new Logger({serviceName: "clinicalViewLambda", logLevel: LOG_LEVEL})
const spineClient = createSpineClient(logger)

type HandlerParams = {
    logger: Logger,
    spineClient: SpineClient
}

export const apiGatewayHandler = async (params: HandlerParams, event: APIGatewayEvent) => {
  const inboundHeaders = event.headers

  const requestId = inboundHeaders["apigw-request-id"] ?? ""
  const organizationId = inboundHeaders["nhsd-organization-uuid"] ?? ""
  const sdsRoleProfileId = inboundHeaders["nhsd-session-urid"] ?? ""
  const sdsId = inboundHeaders["nhsd-identity-uuid"] ?? ""
  const jobRoleCode = inboundHeaders["nhsd-session-jobrole"] ?? ""

  const prescriptionId = event.queryStringParameters?.prescriptionId ?? ""
  const repeatNumber = event.queryStringParameters?.repeatNumber

  const clinicalViewParams: ClinicalViewParams = {
    requestId,
    prescriptionId,
    organizationId,
    repeatNumber,
    sdsRoleProfileId,
    sdsId,
    jobRoleCode
  }

  const response = await params.spineClient.clinicalView(inboundHeaders, clinicalViewParams)

  return {
    data: response.data,
    status: response.status
  }
}

export const newHandler = (params: HandlerParams) => {
  const newHandler = middy((event: APIGatewayEvent) => apiGatewayHandler(params, event))
  return newHandler
}

const DEFAULT_HANDLER_PARAMS: HandlerParams = {logger, spineClient}
export const handler = newHandler(DEFAULT_HANDLER_PARAMS)
