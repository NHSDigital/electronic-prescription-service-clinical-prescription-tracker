/* eslint-disable @typescript-eslint/no-unused-vars */
// TODO: reorder?
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
import {generateFhirErrorResponse} from "@cpt-common/common-utils"
import {requestGroupSchema} from "./schemas/requestGroupSchema"
// import {parseSpineResponse} from "./utils/parseSpineResponse"
// import {generateFhirResponse} from "./utils/generateFhirResponse"
import {validateRequest} from "./validateRequest"

import {ServiceError} from "@cpt-common/common-types"
// import {ParsedSpineResponse} from "./utils/parseSpineResponse"

// Config
const LOG_LEVEL = process.env.LOG_LEVEL as LogLevel
export const logger = new Logger({serviceName: "clinicalView", logLevel: LOG_LEVEL})
const spineClient: SpineClient = createSpineClient(logger)

const commonHeaders = {
  "Content-Type": "application/fhir+json",
  "Cache-Control": "no-cache"
}

// Types
export interface HandlerParams {
  logger: Logger
  spineClient: SpineClient
}

export const apiGatewayHandler = async (
  params: HandlerParams, event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  logger.appendKeys({
    "nhsd-correlation-id": event.headers?.["nhsd-correlation-id"],
    "nhsd-request-id": event.headers?.["nhsd-request-id"],
    "x-correlation-id": event.headers?.["x-correlation-id"],
    "apigw-request-id": event.requestContext.requestId // Change to event.headers?.["apigw-request-id"] when SM
  })

  const [searchParameters, validationErrors]:
    [ClinicalViewParams, Array<ServiceError>] = validateRequest(event, logger)

  const responseHeaders = {
    ...commonHeaders,
    "x-request-id": searchParameters.requestId,
    "x-correlation-id": event.headers?.["x-correlation-id"] ?? ""
  }

  if (validationErrors.length > 0) {
    logger.error("Error validating request.")
    logger.info("Generating FHIR error response...")
    const errorResponseBundle: OperationOutcome = generateFhirErrorResponse(validationErrors, logger)

    logger.info("Returning FHIR error response.")
    return {
      statusCode: 400,
      body: JSON.stringify(errorResponseBundle),
      headers: responseHeaders
    }
  }

  // try {
  logger.info("Calling Spine clinical view interaction...")
  const spineResponse = await params.spineClient.clinicalView(event.headers, searchParameters)
  logger.debug("Spine response received.", {response: spineResponse})

  //   logger.info("Parsing Spine response...")
  //   const {prescription, spineError}: ParsedSpineResponse = parseSpineResponse(spineResponse.data, logger)

  //   //////////////////////////////////////////////
  //   if (spineError) {
  //     logger.error("Spine response contained an error.", {error: spineError.description})
  //     logger.info("Generating FHIR error response...")
  //     const errorResponseBundle: OperationOutcome = generateFhirErrorResponse([extractedData.error], logger)

  //     logger.info("Returning FHIR error response.")
  //     return {
  //       statusCode: parseInt(extractedData.error.status, 10), // Convert error status to integer HTTP code
  //       body: JSON.stringify(errorResponseBundle),
  //       headers
  //     }
  //   }

  //   // Generate a valid FHIR response from the extracted data
  //   const fhirResponse: RequestGroup = generateFhirResponse(extractedData, logger)
  //   logger.info("Generated FHIR response.", {fhirResponse})

  //   return {
  //     statusCode: 200, // Successful response
  //     body: JSON.stringify(fhirResponse),
  //     headers
  //   }
  // } catch(err) {
  //   // Catch all errors and return a generic FHIR error response
  //   logger.error("An unknown error occurred whilst processing the request", {error: err})
  //   logger.info("Generating FHIR error response...")
  //   const errorResponseBundle: OperationOutcome = generateFhirErrorResponse(
  //     [{status: "500", severity: "fatal", description: "Unknown Error."}], logger
  //   )

  //   logger.info("Returning FHIR error response.")
  //   return {
  //     statusCode: 500,
  //     body: JSON.stringify(errorResponseBundle),
  //     headers
  //   }
  // }
  return {
    statusCode: 200,
    body: "test"
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
