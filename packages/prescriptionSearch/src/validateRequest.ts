// Types
import {Logger} from "@aws-lambda-powertools/logger"
import {CommonHeaderParameters, ServiceError} from "@cpt-common/common-types/service"
import {validateCommonHeaders, validateNhsNumber, validatePrescriptionId} from "@cpt-common/common-utils"
import {PrescriptionSearchParams} from "@NHSDigital/eps-spine-client/lib/live-spine-client"
import {APIGatewayEvent, APIGatewayProxyEventQueryStringParameters} from "aws-lambda"

export interface QueryStringSearchParameters {
  prescriptionID?: string
  nhsNumber?: string
  creationDateRange?: {
    lowDate?: string
    highDate?: string
  }
}

export const validateRequest = (
  event: APIGatewayEvent, logger: Logger):[PrescriptionSearchParams, Array<ServiceError>] => {

  logger.info("Validating query string parameters...")
  const [queryStringSearchParameters, queryStringParameterErrors]:
    [QueryStringSearchParameters, Array<ServiceError>] = validateQueryStringParameters(
      event.queryStringParameters, logger)

  logger.info("Validating headers...")
  const [headerParameters, headerErrors]:
    [CommonHeaderParameters, Array<ServiceError>] = validateCommonHeaders(event.headers, logger)

  const errors: Array<ServiceError> = [...queryStringParameterErrors, ...headerErrors]
  const searchParameters = {
    ...queryStringSearchParameters,
    ...headerParameters
  } as unknown as PrescriptionSearchParams

  return [searchParameters, errors]
}

const validateQueryStringParameters = (
  eventQueryStringParameters: APIGatewayProxyEventQueryStringParameters | null, logger: Logger):
  [QueryStringSearchParameters, Array<ServiceError>] => {

  let errors: Array<ServiceError> = []

  let prescriptionId: string | undefined = eventQueryStringParameters?.prescriptionId
  let nhsNumber: string | undefined = eventQueryStringParameters?.nhsNumber
  if(!prescriptionId && !nhsNumber){
    logger.error("Missing required query string parameter; prescriptionId or nhsNumber.")
    errors.push({
      status: 400,
      severity: "error",
      description: "Missing required query string parameter; either prescriptionId or nhsNumber must be included."
    })
  }

  if (prescriptionId && nhsNumber){
    logger.error("Invalid query string parameters, prescriptionId and nhsNumber both provided.")
    errors.push({
      status: 400,
      severity: "error",
      description: "Invalid query string parameters; only prescriptionId or nhsNumber must be provided, not both."
    })
  }

  if (prescriptionId){
    prescriptionId = prescriptionId.toUpperCase()
    const prescriptionIdErrors = validatePrescriptionId(prescriptionId, logger)
    errors = [...errors, ...prescriptionIdErrors]
  }

  if (nhsNumber){
    const nhsNumberErrors = validateNhsNumber(nhsNumber, logger)
    errors = [...errors, ...nhsNumberErrors]
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
