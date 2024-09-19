import {SpineClient} from "@nhsdigital/eps-spine-client/lib/spine-client"
import {LogLevel} from "@aws-lambda-powertools/logger/types"
import {Logger} from "@aws-lambda-powertools/logger"
import {createSpineClient} from "@nhsdigital/eps-spine-client"
import {APIGatewayEvent, APIGatewayProxyResult} from "aws-lambda"
import middy from "@middy/core"
import {v4 as uuidv4} from "uuid"
import {PrescriptionSearchParams} from "@nhsdigital/eps-spine-client/lib/live-spine-client"

// Set log level from environment variable
export const LOG_LEVEL = process.env.LOG_LEVEL as LogLevel

// Initialize logger and Spine Client
export const logger = new Logger({serviceName: "prescriptionSearch", logLevel: LOG_LEVEL})
const spineClient = createSpineClient(logger)

// Define handler parameters type
type HandlerParams = {
  logger: Logger,
  spineClient: SpineClient
}

// Main handler logic to process API Gateway event
export const apiGatewayHandler = async (
  params: HandlerParams,
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const inboundHeaders = event.headers || {}

  // Provide fallbacks for missing headers
  const requestId = inboundHeaders["apigw-request-id"] || "default-request-id"
  const organizationId = inboundHeaders["nhsd-organization-uuid"] || ""
  const sdsRoleProfileId = inboundHeaders["nhsd-session-urid"] || ""
  const sdsId = inboundHeaders["nhsd-identity-uuid"] || ""
  const jobRoleCode = inboundHeaders["nhsd-session-jobrole"] || ""

  // Extract required query parameter or default to empty string
  const prescriptionId = event.queryStringParameters?.prescriptionId ?? ""

  // Handle missing prescriptionId
  if (!prescriptionId) {
    return {
      statusCode: 400,
      body: JSON.stringify({message: "Missing required query parameter: prescriptionId"})
    }
  }

  // Extract optional query parameters
  const nhsNumber = event.queryStringParameters?.nhsNumber
  const lowDate = event.queryStringParameters?.lowDate
  const highDate = event.queryStringParameters?.highDate

  // Build creationDateRange if any date is provided
  const creationDateRange = (lowDate || highDate) ? {lowDate, highDate} : undefined

  // Build the prescription search parameters object
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

  // Add wsa:MessageID header
  const headers = {
    ...inboundHeaders,
    "wsa:MessageID": uuidv4()
  }

  try {
    // Call the Spine Client's prescriptionSearch method with headers and parameters
    const response = await params.spineClient.prescriptionSearch(headers, prescriptionSearchParams)
    return {
      statusCode: response.status,
      body: JSON.stringify(response.data)
    }
  } catch (error) {
    params.logger.error("Error during Spine prescription search", {error})
    return {
      statusCode: 500,
      body: JSON.stringify({message: "Internal server error"})
    }
  }
}

// Wrap handler with middleware using middy
export const newHandler = (params: HandlerParams) => {
  return middy((event: APIGatewayEvent) => apiGatewayHandler(params, event))
}

// Define default handler parameters
const DEFAULT_HANDLER_PARAMS: HandlerParams = {logger, spineClient}

// Export the final handler
export const handler = newHandler(DEFAULT_HANDLER_PARAMS)
