// Types
import {APIGatewayEvent, APIGatewayProxyEventPathParameters} from "aws-lambda"
import {Logger} from "@aws-lambda-powertools/logger"
import {ClinicalViewParams} from "@NHSDigital/eps-spine-client/lib/live-spine-client"
import {validateCommonHeaders} from "@cpt-common/common-utils"
import {CommonHeaderParameters, ServiceError} from "@cpt-common/common-types"

export interface PathParameters {
  prescriptionId?: string
}

export const validateRequest = (
  event: APIGatewayEvent, logger: Logger): [ClinicalViewParams, Array<ServiceError>] => {

  logger.info("Validating path parameters...")
  const [pathParameters, pathParameterErrors]:
    [PathParameters, Array<ServiceError>] = validatePathParameters(event.pathParameters, logger)

  logger.info("Validating headers...")
  const [headerParameters, headerErrors]:
    [CommonHeaderParameters, Array<ServiceError>] = validateCommonHeaders(event.headers, logger)

  const errors: Array<ServiceError> = [...pathParameterErrors, ...headerErrors]
  const clinicalViewParameters = {
    ...pathParameters,
    ...headerParameters
  } as unknown as ClinicalViewParams

  return [clinicalViewParameters, errors]
}

const validatePathParameters = (
  eventPathParameters: APIGatewayProxyEventPathParameters | null, logger: Logger):
  [PathParameters, Array<ServiceError>] => {

  const errors: Array<ServiceError> = []

  const prescriptionId: string | undefined = eventPathParameters?.prescriptionId

  if (!prescriptionId) {
    logger.error("Missing required path parameter; prescriptionId.")
    errors.push({
      status: "400",
      severity: "error",
      description: "Missing required path parameter: prescriptionId."
    })
  }

  const pathParameters: PathParameters = {prescriptionId: prescriptionId}

  return [pathParameters, errors]
}
