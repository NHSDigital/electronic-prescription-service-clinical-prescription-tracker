// Types
import {APIGatewayEvent, APIGatewayProxyEventHeaders, APIGatewayProxyEventPathParameters} from "aws-lambda"
import {Logger} from "@aws-lambda-powertools/logger"
import {ClinicalViewParams} from "@NHSDigital/eps-spine-client/lib/live-spine-client"
import {SearchError, PathParameters, HeaderSearchParameters} from "./types"

export const validateRequest = (
  event: APIGatewayEvent, logger: Logger): [ClinicalViewParams, Array<SearchError>] => {

  logger.info("Validating the path parameter...")
  const [pathParameters, pathParameterErrors]:
    [PathParameters, Array<SearchError>] = validatePathParameters(event.pathParameters, logger)

  logger.info("Validating headers...")
  const [headerSearchParameters, headerErrors]:
    [HeaderSearchParameters, Array<SearchError>] = validateHeaders(event.headers, logger)

  const errors: Array<SearchError> = [...pathParameterErrors, ...headerErrors]
  const searchParameters = {
    ...pathParameters,
    ...headerSearchParameters
  } as unknown as ClinicalViewParams

  return [searchParameters, errors]
}

const validatePathParameters = (
  eventPathParameters: APIGatewayProxyEventPathParameters | null, logger: Logger):
  [PathParameters, Array<SearchError>] => {

  const errors: Array<SearchError> = []

  const prescriptionId: string = eventPathParameters?.prescriptionId ?? ""

  if (!prescriptionId) {
    logger.error("Missing required path parameter: prescriptionId.")
    errors.push({
      status: "400",
      severity: "error",
      description: "Missing required path parameter: prescriptionId."
    })
  }

  const searchParameters: PathParameters = {prescriptionId: prescriptionId}

  return [searchParameters, errors]
}

const validateHeaders = (
  eventHeaders: APIGatewayProxyEventHeaders, logger: Logger): [HeaderSearchParameters, Array<SearchError>] => {

  const errors: Array<SearchError> = []

  const requestId: string | undefined = eventHeaders?.["x-request-id"]
  if (!requestId) {
    logger.error("Missing required header, x-request-id.")
    errors.push({
      status: "400",
      severity: "error",
      description: "Missing required header, x-request-id."
    })
  }
  logger.appendKeys({"x-request-id": requestId})

  const organizationId: string | undefined = eventHeaders?.["nhsd-organization-uuid"]
  if (!organizationId) {
    logger.error("Missing required header, nhsd-organization-uuid.")
    errors.push({
      status: "400",
      severity: "error",
      description: "Missing required header, nhsd-organization-uuid."
    })
  }

  const sdsRoleProfileId: string | undefined = eventHeaders?.["nhsd-session-urid"]
  if (!sdsRoleProfileId) {
    logger.error("Missing required header, nhsd-session-urid.")
    errors.push({
      status: "400",
      severity: "error",
      description: "Missing required header, nhsd-session-urid."
    })
  }

  const sdsId: string | undefined = eventHeaders?.["nhsd-identity-uuid"]
  if (!sdsId) {
    logger.error("Missing required header, nhsd-identity-uuid.")
    errors.push({
      status: "400",
      severity: "error",
      description: "Missing required header, nhsd-identity-uuid."
    })
  }

  const jobRoleCode: string | undefined = eventHeaders?.["nhsd-session-jobrole"]
  if (!jobRoleCode) {
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
