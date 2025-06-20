import {jest} from "@jest/globals"
import {Logger} from "@aws-lambda-powertools/logger"
import {generateFhirErrorResponse} from "../src/commonFhir"
import {ServiceError} from "@cpt-common/common-types/service"
import {OperationOutcomeIssueType, OperationOutcomeType} from "@cpt-common/common-types/schema"

const logger: Logger = new Logger({serviceName: "commonUtils", logLevel: "DEBUG"})

describe("Test generateFhirErrorResponse", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2015-04-09T12:34:56.001Z"))
  })

  it("returns a OperationOutcome when called", async () => {
    const expected: OperationOutcomeType = {
      resourceType: "OperationOutcome",
      meta: {
        lastUpdated: "2015-04-09T12:34:56.001Z"
      },
      issue: []
    }

    const actual: OperationOutcomeType = generateFhirErrorResponse([], logger)
    expect(actual).toEqual(expected)
  })

  it("returns a correct issue on the OperationOutcome when called with an error", async () => {
    const mockError: ServiceError = {
      status: 500,
      severity: "error",
      description: "An unknown error."
    }

    const expected: OperationOutcomeIssueType = {
      code: "exception",
      severity: "error",
      diagnostics: "An unknown error.",
      details: {
        coding: [{
          system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
          code: "SERVER_ERROR",
          display: "500: The Server has encountered an error processing the request."
        }]
      }
    }

    const actualIssues = generateFhirErrorResponse([mockError], logger).issue as Array<OperationOutcomeIssueType>
    const actualOperationOutcome = actualIssues[0]
    expect(actualOperationOutcome).toEqual(expected)
  })

  it("returns a correct OperationOutcome with multiple issues when called with a list errors", async () => {
    const mockErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "Header A missing."
      },
      {
        status: 400,
        severity: "error",
        description: "Header B missing."
      },
      {
        status: 400,
        severity: "error",
        description: "Header C missing."
      }
    ]

    const expected: OperationOutcomeType = {
      resourceType: "OperationOutcome",
      meta: {
        lastUpdated: "2015-04-09T12:34:56.001Z"
      },
      issue: [
        {
          code: "value",
          severity: "error",
          diagnostics: "Header A missing.",
          details: {
            coding: [{
              system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
              code: "BAD_REQUEST",
              display: "400: The Server was unable to process the request."
            }]
          }
        },
        {
          code: "value",
          severity: "error",
          diagnostics: "Header B missing.",
          details: {
            coding: [{
              system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
              code: "BAD_REQUEST",
              display: "400: The Server was unable to process the request."
            }]
          }
        },
        {
          code: "value",
          severity: "error",
          diagnostics: "Header C missing.",
          details: {
            coding: [{
              system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
              code: "BAD_REQUEST",
              display: "400: The Server was unable to process the request."
            }]
          }
        }
      ]
    }
    const actual = generateFhirErrorResponse(mockErrors, logger) as OperationOutcomeType
    expect(actual).toEqual(expected)
  })
})
