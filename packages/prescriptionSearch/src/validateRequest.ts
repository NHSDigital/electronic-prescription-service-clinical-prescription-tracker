import {APIGatewayEvent, APIGatewayProxyEventHeaders, APIGatewayProxyEventQueryStringParameters} from "aws-lambda"
import {SearchError, QueryStringSearchParameters, HeaderSearchParameters} from "./types"
import {PrescriptionSearchParams} from "@NHSDigital/eps-spine-client/lib/live-spine-client"

export const validateRequest = (event: APIGatewayEvent): [PrescriptionSearchParams, Array<SearchError>] => {
  const [queryStringSearchParameters, queryStringParameterErrors]:
    [QueryStringSearchParameters, Array<SearchError>] = validateQueryStringParameters(event.queryStringParameters)

  const [headerSearchParameters, headerErrors]:
    [HeaderSearchParameters, Array<SearchError>] = validateHeaders(event.headers)

  const errors: Array<SearchError> = [...queryStringParameterErrors, ...headerErrors]
  const searchParameters = {
    ...queryStringSearchParameters,
    ...headerSearchParameters
  } as unknown as PrescriptionSearchParams
  return [searchParameters, errors]
}

const validateQueryStringParameters = (eventQueryStringParameters: APIGatewayProxyEventQueryStringParameters | null):
  [QueryStringSearchParameters, Array<SearchError>] => {
  const errors: Array<SearchError> = []

  const prescriptionId: string | undefined = eventQueryStringParameters?.prescriptionId
  const nhsNumber: string | undefined = eventQueryStringParameters?.nhsNumber
  if(!prescriptionId && !nhsNumber){
    errors.push({
      status: "400",
      severity: "error",
      description: "Missing required query string parameter; either prescriptionId or nhsNumber must be included."
    })
  }

  if (prescriptionId && nhsNumber){
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

const validateHeaders = (eventHeaders: APIGatewayProxyEventHeaders): [HeaderSearchParameters, Array<SearchError>] => {
  const errors: Array<SearchError> = []

  const requestId: string | undefined = eventHeaders?.["x-request-id"]
  if(!requestId) {
    errors.push({
      status: "400",
      severity: "error",
      description: "Missing required header, x-request-id."
    })
  }

  const organizationId: string | undefined = eventHeaders?.["nhsd-organization-uuid"]
  if(!organizationId) {
    errors.push({
      status: "400",
      severity: "error",
      description: "Missing required header, nhsd-organization-uuid."
    })
  }

  const sdsRoleProfileId: string | undefined = eventHeaders?.["nhsd-session-urid"]
  if(!sdsRoleProfileId) {
    errors.push({
      status: "400",
      severity: "error",
      description: "Missing required header, nhsd-session-urid."
    })
  }

  const sdsId: string | undefined = eventHeaders?.["nhsd-identity-uuid"]
  if(!sdsId) {
    errors.push({
      status: "400",
      severity: "error",
      description: "Missing required header, nhsd-identity-uuid."
    })
  }

  const jobRoleCode: string | undefined = eventHeaders?.["nhsd-session-jobrole"]
  if(!jobRoleCode) {
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
