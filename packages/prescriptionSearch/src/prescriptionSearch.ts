import {SpineClient} from "@NHSDigital/eps-spine-client/lib/spine-client"
import {LogLevel} from "@aws-lambda-powertools/logger/types"
import {Logger} from "@aws-lambda-powertools/logger"
import {injectLambdaContext} from "@aws-lambda-powertools/logger/middleware"
import inputOutputLogger from "@middy/input-output-logger"
import {createSpineClient} from "@NHSDigital/eps-spine-client"
import errorHandler from "@nhs/fhir-middy-error-handler"
import {APIGatewayEvent, APIGatewayProxyResult} from "aws-lambda"
import middy from "@middy/core"
import {PrescriptionSearchParams} from "@NHSDigital/eps-spine-client/lib/live-spine-client"
import {bundleSchema, outcomeSchema} from "./schema/response"
import {Bundle} from "fhir/r4"
// import {badRequest} from "./utils/responses"
import {validateRequest} from "./validateRequest"
import {Prescription, SearchError} from "./types"
import {generateFhirErrorResponse, generateFhirResponse} from "./generateFhirResponse"
import {parseSpineResponse} from "./parseSpineResponse"

export const LOG_LEVEL = process.env.LOG_LEVEL as LogLevel
export const logger = new Logger({serviceName: "prescriptionSearch", logLevel: LOG_LEVEL})
const spineClient = createSpineClient(logger)

type HandlerParams = {
  logger: Logger,
  spineClient: SpineClient
}

// TODO: logging
// TODO: tests
export const apiGatewayHandler = async (
  params: HandlerParams, event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const [searchParameters, validationErrors]:
    [PrescriptionSearchParams, Array<SearchError>] = validateRequest(event)

  if(validationErrors){
    const errorResponseBundle: Bundle = generateFhirErrorResponse(validationErrors)
    return {
      statusCode: 400,
      body: JSON.stringify(errorResponseBundle)
    }
  }

  try{
    const spineResponse = await params.spineClient.prescriptionSearch(event.headers, searchParameters)
    const [prescriptions, searchError]: [Array<Prescription> | undefined,
      SearchError | undefined] = parseSpineResponse(spineResponse.data)

    if (searchError){
      const errorResponseBundle: Bundle = generateFhirErrorResponse([searchError])
      return {
        statusCode: 500,
        body: JSON.stringify(errorResponseBundle)
      }
    }

    if (!prescriptions && !searchError){
      // TODO: what about no results?
      return {
        statusCode: 200,
        body: ""
      }
    }

    const responseBundle = generateFhirResponse(prescriptions as Array<Prescription>)
    return{
      statusCode: 200,
      body: JSON.stringify(responseBundle)
    }
  } catch {
    // catch all error
    const errorResponseBundle: Bundle = generateFhirErrorResponse(
      [{status: "500", severity: "fatal", description: "Unknown error."}])
    return {
      statusCode: 500,
      body: JSON.stringify(errorResponseBundle)
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
