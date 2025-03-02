import {LogLevel} from "@aws-lambda-powertools/logger/types"
import {Logger} from "@aws-lambda-powertools/logger"
import {injectLambdaContext} from "@aws-lambda-powertools/logger/middleware"
import {APIGatewayEvent, APIGatewayProxyEventHeaders, APIGatewayProxyResult} from "aws-lambda"
import middy from "@middy/core"
import inputOutputLogger from "@middy/input-output-logger"
import errorHandler from "@nhs/fhir-middy-error-handler"
import {createSpineClient} from "@NHSDigital/eps-spine-client"
import {SpineClient} from "@NHSDigital/eps-spine-client/lib/spine-client"
import {ClinicalViewParams} from "@NHSDigital/eps-spine-client/lib/live-spine-client"
import {AxiosResponse} from "axios"
import {RequestGroup, OperationOutcome} from "fhir/r4"
import {v4 as uuidv4} from "uuid"
import {requestGroupSchema} from "./schemas/requestGroupSchema"
import {parseSpineResponse} from "./utils/parseSpineResponse"
import {generateFhirResponse} from "./utils/generateFhirResponse"
import {generateFhirErrorResponse} from "./utils/errorHandling"
import {validateRequest} from "./utils/validateRequest"
import {HandlerParams, SearchError} from "./utils/types"

// Set up logger with log level from environment variables
const LOG_LEVEL = process.env.LOG_LEVEL as LogLevel
export const logger = new Logger({serviceName: "clinicalView", logLevel: LOG_LEVEL})
const spineClient: SpineClient = createSpineClient(logger)

const headers = {
  "Content-Type": "application/fhir+json",
  "Cache-Control": "no-cache"
}

/**
 * Handles API Gateway requests and calls Spine to fetch prescription details.
 */
export const apiGatewayHandler = async (
  params: HandlerParams, event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  logger.info("Received API request", {event})

  // Extract headers and the path parameters from the event
  const inboundHeaders = event.headers
  const pathParameters = event.pathParameters ?? {}
  const prescriptionId = event.pathParameters?.prescriptionId ?? ""

  logger.info("Extracted parameters", {
    prescriptionId,
    headers: inboundHeaders,
    pathParameters: pathParameters
  })

  const [searchParameters, validationErrors]:
    [ClinicalViewParams, Array<SearchError>] = validateRequest(event, logger)

  // Check if the prescriptionId is missing from the request
  if (validationErrors.length > 0) {
    logger.error("Error validating request.")
    logger.info("Generating FHIR error response...")
    const errorResponseBundle: OperationOutcome = generateFhirErrorResponse(validationErrors, logger)

    logger.info("Returning FHIR error response.")
    return {
      statusCode: 400,
      body: JSON.stringify(errorResponseBundle),
      headers
    }
  }

  logger.info("searchParameters", {searchParameters})
  logger.info("validationErrors", {validationErrors})

  // Build parameters required for Spine API request
  const clinicalViewParams = buildClinicalViewParams(inboundHeaders, prescriptionId)

  logger.info("Built clinicalViewParams for Spine request", {clinicalViewParams})

  // Call the Spine API to fetch prescription details
  let spineResponse
  spineResponse = await params.spineClient.clinicalView(inboundHeaders, clinicalViewParams)

  logger.info("Received response from Spine", {status: spineResponse.status, entry: spineResponse.data})

  // Process the response from Spine
  return handleSpineResponse(spineResponse)
}

/**
 * Builds the parameters required for the Spine clinical view request.
 */
const buildClinicalViewParams = (
  inboundHeaders: APIGatewayProxyEventHeaders,
  prescriptionId: string
): ClinicalViewParams => {
  // Generate a unique request ID if not provided
  const requestId = inboundHeaders["apigw-request-id"] ?? uuidv4()

  // Extract necessary values from headers
  const organizationId = inboundHeaders["nhsd-organization-uuid"] ?? ""
  const sdsRoleProfileId = inboundHeaders["nhsd-session-urid"] ?? ""
  const sdsId = inboundHeaders["nhsd-identity-uuid"] ?? ""
  const jobRoleCode = inboundHeaders["nhsd-session-jobrole"] ?? ""

  logger.info("Constructed ClinicalViewParams", {
    requestId,
    prescriptionId,
    organizationId,
    sdsRoleProfileId,
    sdsId,
    jobRoleCode
  })

  return {
    requestId,
    prescriptionId,
    organizationId,
    sdsRoleProfileId,
    sdsId,
    jobRoleCode
  }
}

/**
 * Processes the response received from Spine and extracts relevant information.
 */
const handleSpineResponse = (
  spineResponse: AxiosResponse<string, unknown>
): APIGatewayProxyResult => { // Ensure the return type matches API Gateway expectations
  logger.info("Processing Spine SOAP response...")

  // Extract relevant data from SOAP response
  const extractedData = parseSpineResponse(spineResponse.data, logger)

  logger.info("Successfully retrieved prescription data from Spine", {extractedData})

  // Generate FHIR response
  const fhirResponse: RequestGroup = generateFhirResponse(extractedData, logger)

  logger.info("Generated FHIR response bundle", {fhirResponse})

  return {
    statusCode: 200, // API Gateway expects a status code
    body: JSON.stringify(fhirResponse), // Wrap the response in a stringified JSON
    headers
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
const DEFAULT_HANDLER_PARAMS: HandlerParams = {logger, spineClient}
export const handler = newHandler(DEFAULT_HANDLER_PARAMS)

export {requestGroupSchema}
