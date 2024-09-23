import {SpineClient} from "@nhsdigital/eps-spine-client/lib/spine-client"
import {LogLevel} from "@aws-lambda-powertools/logger/types"
import {Logger} from "@aws-lambda-powertools/logger"
import {createSpineClient} from "@nhsdigital/eps-spine-client"
import {APIGatewayEvent, APIGatewayProxyEventHeaders, APIGatewayProxyEventQueryStringParameters} from "aws-lambda"
import middy from "@middy/core"
import {ClinicalViewParams} from "@nhsdigital/eps-spine-client/lib/live-spine-client"
import {DOMParser} from "xmldom"
import {AxiosResponse} from "axios"

const LOG_LEVEL = process.env.LOG_LEVEL as LogLevel
export const defaultLogger = new Logger({serviceName: "clinicalViewLambda", logLevel: LOG_LEVEL})
const defaultSpineClient = createSpineClient(defaultLogger)

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
  const logger = params.logger

  const inboundHeaders = event.headers
  const queryStringParameters = event.queryStringParameters ?? {}
  const prescriptionId = event.queryStringParameters?.prescriptionId ?? ""

  const clinicalViewParams = buildClinicalViewParams(inboundHeaders, queryStringParameters)

  let spineResponse
  try {
    spineResponse = await params.spineClient.clinicalView(inboundHeaders, clinicalViewParams)
  } catch (error) {
    logger.error({message: "Error in Spine Client", error})
    return spineClientErrorResponse(prescriptionId)
  }

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
  const soap_response = (new DOMParser()).parseFromString(spineResponse.data)
  const acknowledgement = soap_response.getElementsByTagName("acknowledgement").item(0)
  const acknowledgementTypeCode = acknowledgement?.getAttribute("typeCode")

  if (acknowledgementTypeCode !== "AA"){
    return prescriptionNotFoundResponse(prescriptionId)
  }

  const prescriptionStatus = soap_response.getElementsByTagName("prescriptionStatus")?.item(0)?.textContent

  if (!prescriptionStatus){
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

const spineClientErrorResponse = (prescriptionId: string) => {
  return {
    data: {
      prescriptionId,
      error: "Internal Server Error"
    },
    status: 500
  }
}

export const newHandler = (params: HandlerParams) => {
  const newHandler = middy((event: APIGatewayEvent) => apiGatewayHandler(params, event))
  return newHandler
}

const DEFAULT_HANDLER_PARAMS: HandlerParams = {logger: defaultLogger, spineClient: defaultSpineClient}
export const handler = newHandler(DEFAULT_HANDLER_PARAMS)
