import {Logger} from "@aws-lambda-powertools/logger"
import {OperationOutcome, OperationOutcomeIssue} from "fhir/r4"
import {ErrorMap, SearchError} from "./types"

const errorMap: ErrorMap = {
  400: {
    status: "400 Bad Request",
    code: "value",
    detailsCode: "BAD_REQUEST",
    detailsDisplay: "400: The request could not be understood or was missing required parameters."
  },
  401: {
    status: "401 Unauthorized",
    code: "security",
    detailsCode: "UNAUTHORIZED",
    detailsDisplay: "401: Authentication is required and has failed or has not yet been provided."
  },
  403: {
    status: "403 Forbidden",
    code: "forbidden",
    detailsCode: "FORBIDDEN",
    detailsDisplay: "403: The server understood the request, but access is forbidden."
  },
  404: {
    status: "404 Not Found",
    code: "not-found",
    detailsCode: "NOT_FOUND",
    detailsDisplay: "404: The requested prescription resource could not be found."
  },
  500: {
    status: "500 Internal Server Error",
    code: "exception",
    detailsCode: "SERVER_ERROR",
    detailsDisplay: "500: The server encountered an unexpected condition."
  },
  504: {
    status: "504 Gateway Timeout",
    code: "timeout",
    detailsCode: "TIMEOUT",
    detailsDisplay: "504: The server has timed out whilst processing the request."
  }
}

/**
 * Generates a FHIR OperationOutcome response for ClinicalView Lambda errors.
 */
export const generateFhirErrorResponse = (errors: Array<SearchError>, logger: Logger): OperationOutcome => {
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
  for (const error of errors) {
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
