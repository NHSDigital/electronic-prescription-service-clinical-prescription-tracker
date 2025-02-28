import {LogLevel} from "@aws-lambda-powertools/logger/types"
import {Logger} from "@aws-lambda-powertools/logger"
import {injectLambdaContext} from "@aws-lambda-powertools/logger/middleware"
import middy from "@middy/core"
import inputOutputLogger from "@middy/input-output-logger"
import errorHandler from "@nhs/fhir-middy-error-handler"
import {createSpineClient} from "@NHSDigital/eps-spine-client"
import {SpineClient} from "@NHSDigital/eps-spine-client/lib/spine-client"
import {PrescriptionSearchParams} from "@NHSDigital/eps-spine-client/lib/live-spine-client"
import {APIGatewayEvent, APIGatewayProxyResult} from "aws-lambda"
import {bundleSchema, outcomeSchema} from "./schema/response"
import {BundleEntry} from "fhir/r4"
import {badRequest} from "./utils/responses"

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

  let responseEntries: Array<BundleEntry> = []
  const requestId = getRequiredHeader(event, "x-request-id", responseEntries)
  const organizationId = getRequiredHeader(event, "nhsd-organization-uuid", responseEntries)
  const sdsRoleProfileId = getRequiredHeader(event, "nhsd-session-urid", responseEntries)
  const sdsId = getRequiredHeader(event, "nhsd-identity-uuid", responseEntries)
  const jobRoleCode = getRequiredHeader(event, "nhsd-session-jobrole", responseEntries)

  const prescriptionId = event.queryStringParameters?.prescriptionId ?? ""

  // Handle missing prescriptionId
  if (!prescriptionId) {
    const errorMessage = "Missing required query parameter: prescriptionId"
    logger.error(errorMessage)
    const entry: BundleEntry = badRequest(errorMessage)
    responseEntries.push(entry)
  }

  if (responseEntries.length > 0) {
    return {
      statusCode: 400,
      body: JSON.stringify(responseEntries)
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

export function getRequiredHeader(
  event: APIGatewayEvent,
  headerName: string,
  responseEntries: Array<BundleEntry>): string {
  const headerValue = event.headers[headerName]
  if (!headerValue) {
    const errorMessage = `Missing or empty ${headerName} header`
    logger.error(errorMessage)
    const entry: BundleEntry = badRequest(errorMessage)
    responseEntries.push(entry)
    return ""
  }
  return headerValue
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

const DEFAULT_HANDLER_PARAMS: HandlerParams = {logger, spineClient}
export const handler = newHandler(DEFAULT_HANDLER_PARAMS)

export {bundleSchema, outcomeSchema}
