import middy from "@middy/core"
import inputOutputLogger from "@middy/input-output-logger"
import {Logger} from "@aws-lambda-powertools/logger"
import {injectLambdaContext} from "@aws-lambda-powertools/logger/middleware"
import errorHandler from "@nhs/fhir-middy-error-handler"

import {createSpineClient} from "@NHSDigital/eps-spine-client"

import {validateRequest} from "./validateRequest"
import {parseSpineResponse} from "./parseSpineResponse"
import {generateFhirErrorResponse, generateFhirResponse} from "./generateFhirResponse"
import {bundleSchema, outcomeSchema} from "./schema/response"

// Types
import {LogLevel} from "@aws-lambda-powertools/logger/types"
import {APIGatewayEvent, APIGatewayProxyResult} from "aws-lambda"
import {PrescriptionSearchParams} from "@NHSDigital/eps-spine-client/lib/live-spine-client"
import {SpineClient} from "@NHSDigital/eps-spine-client/lib/spine-client"
import {Bundle, OperationOutcome} from "fhir/r4"
import {
  HandlerParams,
  ParsedSpineResponse,
  Prescription,
  SearchError
} from "./types"

// Config
export const LOG_LEVEL = process.env.LOG_LEVEL as LogLevel
export const logger: Logger = new Logger({serviceName: "prescriptionSearch", logLevel: LOG_LEVEL})
const spineClient: SpineClient = createSpineClient(logger)

// TODO: tests
export const apiGatewayHandler = async (
  params: HandlerParams, event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  logger.appendKeys({
    "nhsd-correlation-id": event.headers?.["nhsd-correlation-id"],
    "nhsd-request-id": event.headers?.["nhsd-request-id"],
    "x-correlation-id": event.headers?.["x-correlation-id"],
    "apigw-request-id": event.requestContext.requestId
  })

  const [searchParameters, validationErrors]:
    [PrescriptionSearchParams, Array<SearchError>] = validateRequest(event, logger)

  if(validationErrors.length > 0){
    logger.error("Error validating request.")
    logger.info("Generating FHIR error response...")
    const errorResponseBundle: OperationOutcome = generateFhirErrorResponse(validationErrors, logger)

    logger.info("Returning FHIR error response.")
    return {
      statusCode: 400,
      body: JSON.stringify(errorResponseBundle),
      headers: {
        "Content-Type": "application/fhir+json",
        "Cache-Control": "no-cache"
      }
    }
  }

  try{
    logger.info("Calling Spine prescription search interaction...")
    const spineResponse = await params.spineClient.prescriptionSearch(event.headers, searchParameters)

    logger.info("Parsing Spine Response...")
    const [prescriptions, searchError]: ParsedSpineResponse = parseSpineResponse(spineResponse.data, logger)

    if (searchError){
      logger.error("Spine response contained an error.", {error: searchError.description})
      logger.info("Generating FHIR error response...")
      const errorResponseBundle: OperationOutcome = generateFhirErrorResponse([searchError], logger)

      logger.info("Returning FHIR error response.")
      return {
        statusCode: 500,
        body: JSON.stringify(errorResponseBundle),
        headers: {
          "Content-Type": "application/fhir+json",
          "Cache-Control": "no-cache"
        }
      }
    }

    logger.info("Generating FHIR response...")
    const responseBundle: Bundle = generateFhirResponse(prescriptions as Array<Prescription>, logger)

    logger.info("Retuning FHIR response.")
    return{
      statusCode: 200,
      body: JSON.stringify(responseBundle),
      headers: {
        "Content-Type": "application/fhir+json",
        "Cache-Control": "no-cache"
      }
    }
  } catch {
    // catch all error
    logger.error("An unknown error occurred whilst processing the request")
    logger.info("Generating FHIR error response...")
    const errorResponseBundle: OperationOutcome = generateFhirErrorResponse(
      [{status: "500", severity: "fatal", description: "Unknown Error."}],
      logger
    )

    logger.info("Returning FHIR error response.")
    return {
      statusCode: 500,
      body: JSON.stringify(errorResponseBundle),
      headers: {
        "Content-Type": "application/fhir+json",
        "Cache-Control": "no-cache"
      }
    }
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

const DEFAULT_HANDLER_PARAMS: HandlerParams = {logger, spineClient}
export const handler = newHandler(DEFAULT_HANDLER_PARAMS)

export {bundleSchema, outcomeSchema}
