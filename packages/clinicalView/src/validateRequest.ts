import {Logger} from "@aws-lambda-powertools/logger"
import {CommonHeaderParameters, ServiceError} from "@cpt-common/common-types/service"
import {validateCommonHeaders, validatePrescriptionId} from "@cpt-common/common-utils"
import {ClinicalViewParams} from "@NHSDigital/eps-spine-client/lib/live-spine-client"
import {
  APIGatewayEvent,
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyEventQueryStringParameters
} from "aws-lambda"

export interface PathParameters {
  prescriptionId?: string
}

export interface QueryStringParameters {
  repeatNumber? : string
}

export const validateRequest = (
  event: APIGatewayEvent, logger: Logger): [ClinicalViewParams, Array<ServiceError>] => {

  logger.info("Validating path parameters...")
  const [pathParameters, pathParameterErrors]:
    [PathParameters, Array<ServiceError>] = validatePathParameters(event.pathParameters, logger)

  logger.info("Validating query string parameters...")
  const queryStringParameters: QueryStringParameters =
  validateQueryStringParameters(event.queryStringParameters)

  logger.info("Validating headers...")
  const [headerParameters, headerErrors]:
    [CommonHeaderParameters, Array<ServiceError>] = validateCommonHeaders(event.headers, logger)

  const errors: Array<ServiceError> = [...pathParameterErrors, ...headerErrors]
  const clinicalViewParameters = {
    ...pathParameters,
    ...queryStringParameters,
    ...headerParameters
  } as unknown as ClinicalViewParams

  return [clinicalViewParameters, errors]
}

const validatePathParameters = (
  eventPathParameters: APIGatewayProxyEventPathParameters | null, logger: Logger):
  [PathParameters, Array<ServiceError>] => {

  let errors: Array<ServiceError> = []

  let prescriptionId: string | undefined = eventPathParameters?.prescriptionId
  if (!prescriptionId) {
    logger.error("Missing required path parameter; prescriptionId.")
    errors.push({
      status: 400,
      severity: "error",
      description: "Missing required path parameter: prescriptionId."
    })
  }

  const prescriptionIdErrors = validatePrescriptionId(prescriptionId ? prescriptionId.toUpperCase() : "", logger)
  errors = [...errors, ...prescriptionIdErrors]

  const pathParameters: PathParameters = {
    prescriptionId
  }

  return [pathParameters, errors]
}

const validateQueryStringParameters = (
  eventQueryStringParameters: APIGatewayProxyEventQueryStringParameters | null): QueryStringParameters => {

  const repeatNumber: string | undefined = eventQueryStringParameters?.issueNumber
  const queryStringParameters = {
    repeatNumber
  }

  return queryStringParameters
}
