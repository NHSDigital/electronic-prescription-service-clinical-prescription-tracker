// Types
import {APIGatewayEvent, APIGatewayProxyEventHeaders, APIGatewayProxyEventQueryStringParameters} from "aws-lambda"
import {Logger} from "@aws-lambda-powertools/logger"
import {PrescriptionSearchParams} from "@NHSDigital/eps-spine-client/lib/live-spine-client"
import {SearchError} from "./parseSpineResponse"

export interface QueryStringSearchParameters {
  prescriptionID?: string
  nhsNumber?: string
  creationDateRange?: {
    lowDate?: string
    highDate?: string
  }
}

export interface HeaderSearchParameters {
  requestId?: string
  correlationId?: string
  organizationId?: string
  sdsRoleProfileId?: string
  sdsId?: string
  jobRoleCode?: string
}

export const validateRequest = (
  event: APIGatewayEvent, logger: Logger):[PrescriptionSearchParams, Array<SearchError>] => {

  logger.info("Validating query string parameters...")
  const [queryStringSearchParameters, queryStringParameterErrors]:
    [QueryStringSearchParameters, Array<SearchError>] = validateQueryStringParameters(
      event.queryStringParameters, logger)

  logger.info("Validating headers...")
  const [headerSearchParameters, headerErrors]:
    [HeaderSearchParameters, Array<SearchError>] = validateHeaders(event.headers, logger)

  const errors: Array<SearchError> = [...queryStringParameterErrors, ...headerErrors]
  const searchParameters = {
    ...queryStringSearchParameters,
    ...headerSearchParameters
  } as unknown as PrescriptionSearchParams

  return [searchParameters, errors]
}

const validateQueryStringParameters = (
  eventQueryStringParameters: APIGatewayProxyEventQueryStringParameters | null, logger: Logger):
  [QueryStringSearchParameters, Array<SearchError>] => {

  const errors: Array<SearchError> = []

  const prescriptionId: string | undefined = eventQueryStringParameters?.prescriptionId
  const nhsNumber: string | undefined = eventQueryStringParameters?.nhsNumber
  if(!prescriptionId && !nhsNumber){
    logger.error("Missing required query string parameter; prescriptionId or nhsNumber.")
    errors.push({
      status: "400",
      severity: "error",
      description: "Missing required query string parameter; either prescriptionId or nhsNumber must be included."
    })
  }

  if (prescriptionId && nhsNumber){
    logger.error("Invalid query string parameters, prescriptionId and nhsNumber both provided.")
    errors.push({
      status: "400",
      severity: "error",
      description: "Invalid query string parameters; only prescriptionId or nhsNumber must be provided, not both."
    })
  }

  const lowDate: string | undefined = eventQueryStringParameters?.lowDate
  const highDate: string | undefined = eventQueryStringParameters?.highDate
  const creationDateRange = (lowDate || highDate) ? {lowDate, highDate} : undefined

  const searchParameters = {
    prescriptionId,
    nhsNumber,
    creationDateRange
  }

  return [searchParameters, errors]
}

const validateHeaders = (
  eventHeaders: APIGatewayProxyEventHeaders, logger: Logger): [HeaderSearchParameters, Array<SearchError>] => {

  const errors: Array<SearchError> = []

  const requestId: string | undefined = eventHeaders?.["x-request-id"]
  if(!requestId) {
    logger.error("Missing required header, x-request-id.")
    errors.push({
      status: "400",
      severity: "error",
      description: "Missing required header, x-request-id."
    })
  }
  logger.appendKeys({"x-request-id": requestId})

  const organizationId: string | undefined = eventHeaders?.["nhsd-organization-uuid"]
  if(!organizationId) {
    logger.error("Missing required header, nhsd-organization-uuid.")
    errors.push({
      status: "400",
      severity: "error",
      description: "Missing required header, nhsd-organization-uuid."
    })
  }

  const sdsRoleProfileId: string | undefined = eventHeaders?.["nhsd-session-urid"]
  if(!sdsRoleProfileId) {
    logger.error("Missing required header, nhsd-session-urid.")
    errors.push({
      status: "400",
      severity: "error",
      description: "Missing required header, nhsd-session-urid."
    })
  }

  const sdsId: string | undefined = eventHeaders?.["nhsd-identity-uuid"]
  if(!sdsId) {
    logger.error("Missing required header, nhsd-identity-uuid.")
    errors.push({
      status: "400",
      severity: "error",
      description: "Missing required header, nhsd-identity-uuid."
    })
  }

  const jobRoleCode: string | undefined = eventHeaders?.["nhsd-session-jobrole"]
  if(!jobRoleCode) {
    logger.error("Missing required header, nhsd-session-jobrole.")
    errors.push({
      status: "400",
      severity: "error",
      description: "Missing required header, nhsd-session-jobrole."
    })
  }

  const searchParameters: HeaderSearchParameters = {
    requestId,
    organizationId,
    sdsRoleProfileId,
    sdsId,
    jobRoleCode
  }

  return [searchParameters, errors]
}
