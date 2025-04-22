import {OperationOutcome, OperationOutcomeIssue} from "fhir/r4"
import {Logger} from "@aws-lambda-powertools/logger"
import {ServiceError} from "@cpt-common/common-types"

interface FhirErrorDetails {
  status: string
  code: string
  detailsCode: string
  detailsDisplay: string
}

interface ErrorMap {
  [key: string]: FhirErrorDetails
}

const errorMap: ErrorMap = {
  400: {
    status: "400 Bad Request",
    code: "value",
    detailsCode: "BAD_REQUEST",
    detailsDisplay: "400: The Server was unable to process the request."
  },
  401: {
    status: "401 Unauthorized",
    code: "forbidden",
    detailsCode: "UNAUTHORIZED",
    detailsDisplay: "401: The Server deemed you unauthorized to make this request."
  },
  403: {
    status: "403 Forbidden",
    code: "forbidden",
    detailsCode: "FORBIDDEN",
    detailsDisplay: "403: Failed to Authenticate with the Server."
  },
  404: {
    status: "404 Not Found",
    code: "not-found",
    detailsCode: "NOT_FOUND",
    detailsDisplay: "404: The Server was unable to find the specified resource."
  },
  500: {
    status: "500 Internal Server Error",
    code: "exception",
    detailsCode: "SERVER_ERROR",
    detailsDisplay: "500: The Server has encountered an error processing the request."
  },
  504: {
    status: "504 Gateway Timeout",
    code: "timeout",
    detailsCode: "TIMEOUT",
    detailsDisplay: "504: The server has timed out whilst processing the request."
  }
}

export const generateFhirErrorResponse = (errors: Array<ServiceError>, logger: Logger): OperationOutcome => {
  logger.info("Generating the OperationOutcome wrapper...")
  // Generate the OperationOutcome wrapper
  const operationOutcome: OperationOutcome = {
    resourceType: "OperationOutcome",
    meta: {
      lastUpdated: new Date().toISOString()
    },
    issue: []
  }

  // For each error generate an issue
  for(const error of errors){
    logger.info("Generating Issue for error...")
    const issue: OperationOutcomeIssue = {
      code: errorMap[error.status].code,
      severity: error.severity,
      diagnostics: error.description,
      details: {
        coding: [{
          system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
          code: errorMap[error.status].detailsCode,
          display: errorMap[error.status].detailsDisplay
        }]
      }
    }

    operationOutcome.issue.push(issue)
  }

  return operationOutcome
}
