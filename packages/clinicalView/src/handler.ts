import {LogLevel} from "@aws-lambda-powertools/logger/types"
import {Logger} from "@aws-lambda-powertools/logger"
import {injectLambdaContext} from "@aws-lambda-powertools/logger/middleware"
import {APIGatewayEvent, APIGatewayProxyResult} from "aws-lambda"
import middy from "@middy/core"
import inputOutputLogger from "@middy/input-output-logger"
import errorHandler from "@nhs/fhir-middy-error-handler"
import {createSpineClient} from "@NHSDigital/eps-spine-client"
import {SpineClient} from "@NHSDigital/eps-spine-client/lib/spine-client"
import {ClinicalViewParams} from "@NHSDigital/eps-spine-client/lib/live-spine-client"
import {RequestGroup, OperationOutcome} from "fhir/r4"
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

// Default HTTP headers for FHIR responses
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

  // Validate request parameters and headers
  const [searchParameters, validationErrors]:
    [ClinicalViewParams, Array<SearchError>] = validateRequest(event, logger)

  // If validation fails, return a FHIR-compliant error response
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

  try {
    // Make a request to Spine API to retrieve prescription details
    logger.info("Calling Spine ClinicalView interaction...")
    const spineResponse = await params.spineClient.clinicalView(event.headers, searchParameters)

    logger.info("Received response from Spine.", {status: spineResponse.status, entry: spineResponse.data})

    // Parse the SOAP response from Spine
    const extractedData = parseSpineResponse(spineResponse.data, logger)
    logger.info("Extracted data from Spine response.", {extractedData})

    /// If an error was detected in the parsed response, return an appropriate FHIR error
    if (extractedData.error) {
      logger.error("Spine response contained an error.", {error: extractedData.error.description})
      logger.info("Generating FHIR error response...")
      const errorResponseBundle: OperationOutcome = generateFhirErrorResponse([extractedData.error], logger)

      logger.info("Returning FHIR error response.")
      return {
        statusCode: parseInt(extractedData.error.status, 10), // Convert error status to integer HTTP code
        body: JSON.stringify(errorResponseBundle),
        headers
      }
    }

    // Generate a valid FHIR response from the extracted data
    const fhirResponse: RequestGroup = generateFhirResponse(extractedData, logger)
    logger.info("Generated FHIR response.", {fhirResponse})

    return {
      statusCode: 200, // Successful response
      body: JSON.stringify(fhirResponse),
      headers
    }
  } catch(err) {
    // Catch all errors and return a generic FHIR error response
    logger.error("An unknown error occurred whilst processing the request", {error: err})
    logger.info("Generating FHIR error response...")
    const errorResponseBundle: OperationOutcome = generateFhirErrorResponse(
      [{status: "500", severity: "fatal", description: "Unknown Error."}], logger
    )

    logger.info("Returning FHIR error response.")
    return {
      statusCode: 500,
      body: JSON.stringify(errorResponseBundle),
      headers
    }
  }
}

/**
 * Wraps the API handler with middleware for better logging and error handling.
 */
export const newHandler = (params: HandlerParams) => {
  const newHandler = middy((event: APIGatewayEvent) => apiGatewayHandler(params, event))
    .use(injectLambdaContext(logger, {clearState: true}))
    .use(inputOutputLogger({logger: (request) => logger.info(request)}))
    .use(errorHandler({logger}))
  return newHandler
}

// Configure the default handler parameters
const DEFAULT_HANDLER_PARAMS: HandlerParams = {logger, spineClient}
export const handler = newHandler(DEFAULT_HANDLER_PARAMS)

// Export schema definitions for validation
export {requestGroupSchema}
