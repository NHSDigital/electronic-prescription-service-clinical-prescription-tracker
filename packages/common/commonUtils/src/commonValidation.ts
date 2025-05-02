import {APIGatewayProxyEventHeaders} from "aws-lambda"
import {Logger} from "@aws-lambda-powertools/logger"
import {ServiceError, CommonHeaderParameters} from "@cpt-common/common-types"

export const validateCommonHeaders = (
  eventHeaders: APIGatewayProxyEventHeaders, logger: Logger): [CommonHeaderParameters, Array<ServiceError>] => {

  const errors: Array<ServiceError> = []

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

  const headerParameters: CommonHeaderParameters = {
    requestId,
    organizationId,
    sdsRoleProfileId,
    sdsId,
    jobRoleCode
  }

  return [headerParameters, errors]
}
