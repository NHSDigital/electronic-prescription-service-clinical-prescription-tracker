import {LogLevel} from "@aws-lambda-powertools/logger/types"
import {Logger} from "@aws-lambda-powertools/logger"
import {injectLambdaContext} from "@aws-lambda-powertools/logger/middleware"
import {
  APIGatewayEvent,
  APIGatewayProxyEventHeaders,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyEventPathParameters
} from "aws-lambda"
import inputOutputLogger from "@middy/input-output-logger"
import middy from "@middy/core"
import errorHandler from "@nhs/fhir-middy-error-handler"
import {createSpineClient} from "@NHSDigital/eps-spine-client"
import {SpineClient} from "@NHSDigital/eps-spine-client/lib/spine-client"
import {ClinicalViewParams} from "@NHSDigital/eps-spine-client/lib/live-spine-client"
import {DOMParser} from "@xmldom/xmldom"
import {AxiosResponse} from "axios"
import {BundleEntry} from "fhir/r4"
import {v4 as uuidv4} from "uuid"
import {prescriptionNotFoundResponse, badRequest} from "./utils/responses"

// Set up logger with log level from environment variables
const LOG_LEVEL = process.env.LOG_LEVEL as LogLevel
export const logger = new Logger({serviceName: "clinicalView", logLevel: LOG_LEVEL})

// Create the default Spine client instance
const defaultSpineClient = createSpineClient(logger)

type HandlerParams = {
  logger: Logger,
  spineClient: SpineClient
}

type HandlerResponse = {
  resourceType?: string,
  type?: string,
  entry: {
    prescriptionId: string,
    prescriptionStatus?: string,
    error?: string
  },
  status: number
}

/**
 * Handles API Gateway requests and calls Spine to fetch prescription details.
 */
export const apiGatewayHandler = async (params: HandlerParams, event: APIGatewayEvent): Promise<HandlerResponse> => {
  logger.info("Received API request", {event})

  // Extract headers, query parameters, and path parameters
  const inboundHeaders = event.headers
  const queryStringParameters = event.queryStringParameters ?? {}
  const pathParameters = event.pathParameters ?? {}
  const prescriptionId = event.pathParameters?.prescriptionId ?? ""

  logger.info("Extracted parameters", {
    prescriptionId,
    headers: inboundHeaders,
    queryStringParameters: queryStringParameters,
    pathParameters: pathParameters
  })

  // Handle missing prescriptionId
  if (!prescriptionId) {
    const errorMessage = "Missing required query parameter: prescriptionId"
    logger.error(errorMessage)
    const entry: BundleEntry = badRequest(errorMessage)
    logger.info("Bad Request", {entry})
  }

  // Build parameters required for Spine API request
  const clinicalViewParams = buildClinicalViewParams(inboundHeaders, queryStringParameters, pathParameters)

  logger.info("Built clinicalViewParams for Spine request", {clinicalViewParams})

  // Calls the SpineClient to interact with the Spine
  let spineResponse
  spineResponse = await params.spineClient.clinicalView(inboundHeaders, clinicalViewParams)

  logger.info("Received response from Spine", {status: spineResponse.status, entry: spineResponse.data})

  return handleSpineResponse(spineResponse, prescriptionId)
}

/**
 * Builds the parameters required for the Spine clinical view request.
 */
const buildClinicalViewParams = (
  inboundHeaders: APIGatewayProxyEventHeaders,
  queryStringParameters: APIGatewayProxyEventQueryStringParameters,
  pathParameters: APIGatewayProxyEventPathParameters
): ClinicalViewParams => {
  // Generate a unique request ID if not provided
  const requestId = inboundHeaders["apigw-request-id"] ?? uuidv4()

  // Extract necessary values from headers
  const organizationId = inboundHeaders["nhsd-organization-uuid"] ?? ""
  const sdsRoleProfileId = inboundHeaders["nhsd-session-urid"] ?? ""
  const sdsId = inboundHeaders["nhsd-identity-uuid"] ?? ""
  const jobRoleCode = inboundHeaders["nhsd-session-jobrole"] ?? ""

  // Extract query parameters
  const repeatNumber = queryStringParameters?.repeatNumber
  const prescriptionId = pathParameters?.prescriptionId ?? ""

  logger.info("Constructed ClinicalViewParams", {
    requestId,
    prescriptionId,
    organizationId,
    repeatNumber,
    sdsRoleProfileId,
    sdsId,
    jobRoleCode
  })

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

/**
 * Processes the response received from Spine and extracts relevant information.
 */
const handleSpineResponse = (spineResponse: AxiosResponse<string, unknown>, prescriptionId: string) => {
  logger.info("Processing Spine SOAP response", {responseData: spineResponse.data})

  // Parse SOAP response
  const soap_response = (new DOMParser()).parseFromString(spineResponse.data, "text/xml")

  // Extract acknowledgment and check if it's a success
  const acknowledgement = soap_response.getElementsByTagName("acknowledgement").item(0)
  const acknowledgementTypeCode = acknowledgement?.getAttribute("typeCode")

  if (acknowledgementTypeCode !== "AA") {
    return prescriptionNotFoundResponse(prescriptionId)
  }

  // Extract prescription status from the response
  const prescriptionStatus = soap_response.getElementsByTagName("prescriptionStatus")?.item(0)?.textContent

  if (!prescriptionStatus) {
    return prescriptionNotFoundResponse(prescriptionId)
  }

  logger.info("Successfully retrieved prescription status", {
    prescriptionId,
    prescriptionStatus
  })

  const resourceType = "Bundle"
  const type = "collection"

  const response = {
    prescriptionId,
    prescriptionStatus
  }

  return {
    resourceType: resourceType,
    type: type,
    entry: response,
    status: spineResponse.status
  }
}

/**
 * Wraps the API handler with middleware for better logging and error handling.
 */
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

// Default handler configuration
const DEFAULT_HANDLER_PARAMS: HandlerParams = {logger: logger, spineClient: defaultSpineClient}
export const handler = newHandler(DEFAULT_HANDLER_PARAMS)
