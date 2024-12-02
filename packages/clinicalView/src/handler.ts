import {SpineClient} from "@NHSDigital/eps-spine-client/lib/spine-client"
import {LogLevel} from "@aws-lambda-powertools/logger/types"
import {Logger} from "@aws-lambda-powertools/logger"
import {injectLambdaContext} from "@aws-lambda-powertools/logger/middleware"
import inputOutputLogger from "@middy/input-output-logger"

import {createSpineClient} from "@NHSDigital/eps-spine-client"
import {APIGatewayEvent, APIGatewayProxyEventHeaders, APIGatewayProxyEventQueryStringParameters} from "aws-lambda"
import middy from "@middy/core"
import {ClinicalViewParams} from "@NHSDigital/eps-spine-client/lib/live-spine-client"
import {DOMParser} from "@xmldom/xmldom"
import {AxiosResponse} from "axios"
import errorHandler from "@nhs/fhir-middy-error-handler"

const LOG_LEVEL = process.env.LOG_LEVEL as LogLevel
export const logger = new Logger({serviceName: "clinicalView", logLevel: LOG_LEVEL})
const defaultSpineClient = createSpineClient(logger)

type HandlerParams = {
  logger: Logger,
  spineClient: SpineClient
}

type HandlerResponse = {
  data: {
    prescriptionId: string,
    prescriptionStatus?: string,
    error?: string
  },
  status: number
}

export const apiGatewayHandler = async (params: HandlerParams, event: APIGatewayEvent): Promise<HandlerResponse> => {
  const inboundHeaders = event.headers
  const queryStringParameters = event.queryStringParameters ?? {}
  const prescriptionId = event.queryStringParameters?.prescriptionId ?? ""

  const clinicalViewParams = buildClinicalViewParams(inboundHeaders, queryStringParameters)

  let spineResponse
  spineResponse = await params.spineClient.clinicalView(inboundHeaders, clinicalViewParams)

  return handleSpineResponse(spineResponse, prescriptionId)
}

const buildClinicalViewParams = (
  inboundHeaders: APIGatewayProxyEventHeaders,
  queryStringParameters: APIGatewayProxyEventQueryStringParameters
): ClinicalViewParams => {
  const requestId = inboundHeaders["apigw-request-id"] ?? ""
  const organizationId = inboundHeaders["nhsd-organization-uuid"] ?? ""
  const sdsRoleProfileId = inboundHeaders["nhsd-session-urid"] ?? ""
  const sdsId = inboundHeaders["nhsd-identity-uuid"] ?? ""
  const jobRoleCode = inboundHeaders["nhsd-session-jobrole"] ?? ""

  const repeatNumber = queryStringParameters?.repeatNumber
  const prescriptionId = queryStringParameters?.prescriptionId ?? ""

  return {
    requestId,
    prescriptionId,
    organizationId,
    repeatNumber,
    sdsRoleProfileId,
    sdsId,
    jobRoleCode
  }
}

const handleSpineResponse = (spineResponse: AxiosResponse<string, unknown>, prescriptionId: string) => {
  const soap_response = (new DOMParser()).parseFromString(spineResponse.data, "text/xml")
  const acknowledgement = soap_response.getElementsByTagName("acknowledgement").item(0)
  const acknowledgementTypeCode = acknowledgement?.getAttribute("typeCode")

  if (acknowledgementTypeCode !== "AA") {
    return prescriptionNotFoundResponse(prescriptionId)
  }

  const prescriptionStatus = soap_response.getElementsByTagName("prescriptionStatus")?.item(0)?.textContent

  if (!prescriptionStatus) {
    return prescriptionNotFoundResponse(prescriptionId)
  }

  const response = {
    prescriptionId,
    prescriptionStatus
  }

  return {
    data: response,
    status: spineResponse.status
  }
}

const prescriptionNotFoundResponse = (prescriptionId: string) => {
  return {
    data: {
      prescriptionId,
      error: "Not Found"
    },
    status: 404
  }
}

export const newHandler = (params: HandlerParams) => {
  const newHandler = middy((event: APIGatewayEvent) => apiGatewayHandler(params, event))
    .use(injectLambdaContext(logger, {clearState: true}))
    .use(
      inputOutputLogger({
        logger: (request) => {
          logger.info(request)
        }
      })
    )
    .use(errorHandler({logger: logger}))
  return newHandler
}

const DEFAULT_HANDLER_PARAMS: HandlerParams = {logger: logger, spineClient: defaultSpineClient}
export const handler = newHandler(DEFAULT_HANDLER_PARAMS)
