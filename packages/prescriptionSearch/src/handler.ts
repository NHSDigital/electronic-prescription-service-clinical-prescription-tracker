import {Logger} from "@aws-lambda-powertools/logger"
import {injectLambdaContext} from "@aws-lambda-powertools/logger/middleware"
import {LogLevel} from "@aws-lambda-powertools/logger/types"
import {operationOutcome, OperationOutcomeType} from "@cpt-common/common-types/schema"
import {ServiceError} from "@cpt-common/common-types/service"
import {generateFhirErrorResponse} from "@cpt-common/common-utils"
import middy from "@middy/core"
import httpHeaderNormalizer from "@middy/http-header-normalizer"
import inputOutputLogger from "@middy/input-output-logger"
import errorHandler from "@nhs/fhir-middy-error-handler"
import {createSpineClient} from "@NHSDigital/eps-spine-client"
import {PrescriptionSearchParams} from "@NHSDigital/eps-spine-client/lib/live-spine-client"
import {SpineClient} from "@NHSDigital/eps-spine-client/lib/spine-client"
import {APIGatewayEvent, APIGatewayProxyResult} from "aws-lambda"
import {generateFhirResponse} from "./generateFhirResponse"
import {ParsedSpineResponse, parseSpineResponse, Prescription} from "./parseSpineResponse"
import {BundleType} from "./schema/bundle"
import {validateRequest} from "./validateRequest"
import {requestGroup} from "./schema/requestGroup"

// Config
export const LOG_LEVEL = process.env.LOG_LEVEL as LogLevel
export const logger = new Logger({serviceName: "prescriptionSearch", logLevel: LOG_LEVEL})
const spineClient = createSpineClient(logger)

const commonHeaders = {
  "Content-Type": "application/fhir+json",
  "Cache-Control": "no-cache"
}

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
    "apigw-request-id": event.requestContext.requestId
  })

  const [searchParameters, validationErrors]:
    [PrescriptionSearchParams, Array<ServiceError>] = validateRequest(event, logger)

  const responseHeaders = {
    ...commonHeaders,
    "x-request-id": searchParameters.requestId,
    "x-correlation-id": event.headers?.["x-correlation-id"] ?? ""
  }

  if(validationErrors.length > 0){
    logger.error("Error validating request.")
    logger.info("Generating FHIR error response...")
    const errorResponseBundle: OperationOutcomeType = generateFhirErrorResponse(validationErrors, logger)

    logger.info("Returning FHIR error response.")
    return {
      statusCode: 400,
      body: JSON.stringify(errorResponseBundle),
      headers: responseHeaders
    }
  }

  logger.info("Calling Spine prescription search interaction...")
  const spineResponse = await params.spineClient.prescriptionSearch(event.headers, searchParameters)
  logger.debug("spine response", {response: spineResponse})

  logger.info("Parsing Spine Response...")
  const parsedSpineResponse: ParsedSpineResponse = parseSpineResponse(spineResponse.data, logger)

  if ("spineError" in parsedSpineResponse) {
    logger.error("Spine response contained an error.", {error: parsedSpineResponse.spineError.description})
    logger.info("Generating FHIR error response...")
    const errorResponseBundle: OperationOutcomeType =
      generateFhirErrorResponse([parsedSpineResponse.spineError], logger)

    logger.info("Returning FHIR error response.")
    return {
      statusCode: parsedSpineResponse.spineError.status,
      body: JSON.stringify(errorResponseBundle),
      headers: responseHeaders
    }
  }

  logger.info("Generating FHIR response...")
  const responseBundle: BundleType =
    generateFhirResponse(parsedSpineResponse.prescriptions as Array<Prescription>, logger)

  logger.info("Retuning FHIR response.")
  return{
    statusCode: 200,
    body: JSON.stringify(responseBundle),
    headers: responseHeaders
  }
}

export const newHandler = (params: HandlerParams) => {
  const newHandler = middy((event: APIGatewayEvent) => apiGatewayHandler(params, event))
    .use(injectLambdaContext(logger, {clearState: true}))
    .use(httpHeaderNormalizer())
    .use(
      inputOutputLogger({
        logger: (request) => {
          logger.info(request)
        }
      })
    )
    .use(errorHandler({logger}))
  return newHandler
}

const DEFAULT_HANDLER_PARAMS: HandlerParams = {logger, spineClient}
export const handler = newHandler(DEFAULT_HANDLER_PARAMS)

// TODO: fix schema generation, use from /schema and common rather than importing and re-exporting here
export {
  requestGroup as requestGroupBundleSchema,
  operationOutcome as operationOutcomeSchema
}
