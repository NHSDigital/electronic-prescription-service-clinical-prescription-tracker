import {LogLevel} from "@aws-lambda-powertools/logger/types"
import {Logger} from "@aws-lambda-powertools/logger"
import {injectLambdaContext} from "@aws-lambda-powertools/logger/middleware"
import {APIGatewayEvent, APIGatewayProxyEventHeaders} from "aws-lambda"
import middy from "@middy/core"
import inputOutputLogger from "@middy/input-output-logger"
import errorHandler from "@nhs/fhir-middy-error-handler"
import {createSpineClient} from "@nhsdigital/eps-spine-client"
import {SpineClient} from "@nhsdigital/eps-spine-client/lib/spine-client"
import {ClinicalViewParams} from "@nhsdigital/eps-spine-client/lib/live-spine-client"
import {AxiosResponse} from "axios"
import {Bundle, BundleEntry, FhirResource} from "fhir/r4"
import {v4 as uuidv4} from "uuid"
import {extractPrescriptionData, FhirResponseParams} from "./utils/prescriptionDataParser"
import {buildFhirResponse} from "./utils/fhirResponseBuilder"
import {prescriptionNotFoundResponse, badRequest} from "./utils/responseTemplates"
import {requestGroupBundleSchema} from "./schemas/requestGroupBundle"

// Test the fast-xml-parser
import {parseSpineResponse} from "./utils/parseSpineResponse"

// Set up logger with log level from environment variables
const LOG_LEVEL = process.env.LOG_LEVEL as LogLevel
export const logger = new Logger({serviceName: "clinicalView", logLevel: LOG_LEVEL})

// Create the default Spine client instance
const defaultSpineClient = createSpineClient(logger)

type HandlerParams = {
  logger: Logger,
  spineClient: SpineClient
}

type HandlerResponse =
  | Bundle<FhirResource>
  | {data: {prescriptionId: string; error: string}}
  | {statusCode: number; body: string}

/**
 * Handles API Gateway requests and calls Spine to fetch prescription details.
 */
export const apiGatewayHandler = async (params: HandlerParams, event: APIGatewayEvent): Promise<HandlerResponse> => {
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

  // Handle missing prescriptionId by collecting error response entries
  let responseEntries: Array<BundleEntry> = []
  if (!prescriptionId) {
    const errorMessage = "Missing required query parameter: prescriptionId"
    logger.error(errorMessage)
    responseEntries.push(badRequest(errorMessage))
  }

  if (responseEntries.length > 0) {
    return {
      statusCode: 400,
      body: JSON.stringify(responseEntries)
    }
  }

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
): HandlerResponse => {
  logger.info("Processing Spine SOAP response", {responseData: spineResponse.data})

  // Extract relevant data from SOAP response
  const extractedData: FhirResponseParams = extractPrescriptionData(spineResponse.data)

  // Check if the response was acknowledged successfully
  if (extractedData.acknowledgementTypeCode !== "AA") {
    return prescriptionNotFoundResponse()
  }

  // Check if prescription status is valid
  if (!extractedData.statusCode) {
    return prescriptionNotFoundResponse()
  }

  logger.info("Successfully retrieved prescription data from Spine", {"extractedData": extractedData})

  // Build the FHIR response bundle
  const fhirResponse = buildFhirResponse(extractedData)

  logger.info("Generated FHIR response bundle", {fhirResponse})

  // Test the fast-xml-parser
  logger.info("Parsing Spine Response using the fast-xml-parser...")
  const extractedDataFastXmlParser = parseSpineResponse(spineResponse.data, logger)
  logger.info("Successfully retrieved prescription data from Spine using fast-xml-parser",
    {"extractedDataFastXmlParser": extractedDataFastXmlParser})

  return fhirResponse
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

export {requestGroupBundleSchema}
