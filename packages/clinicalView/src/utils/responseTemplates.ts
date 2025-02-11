import {BundleEntry, OperationOutcome} from "fhir/r4"

/**
 * Generates a 404 FHIR OperationOutcome response when a prescription is not found.
 */
export const prescriptionNotFoundResponse = () => {
  const operationOutcome: OperationOutcome = {
    resourceType: "OperationOutcome",
    issue: [
      {
        severity: "error",
        code: "not-found",
        details: {
          coding: [
            {
              system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
              code: "RESOURCE_NOT_FOUND",
              display: "404: Prescription not found"
            }
          ]
        },
        diagnostics: "No prescription found in the Spine response."
      }
    ]
  }

  return {
    statusCode: 404,
    body: JSON.stringify(operationOutcome),
    headers: {
      "Content-Type": "application/fhir+json",
      "Cache-Control": "no-cache"
    }
  }
}

export function badRequest(diagnostics: string, fullUrl: string | undefined = undefined): BundleEntry {
  const bundleEntry: BundleEntry = {
    response: {
      status: "400 Bad Request",
      outcome: {
        resourceType: "OperationOutcome",
        meta: {
          lastUpdated: new Date().toISOString()
        },
        issue: [
          {
            code: "value",
            severity: "error",
            diagnostics: diagnostics
          }
        ]
      }
    }
  }
  if (fullUrl) {
    bundleEntry.fullUrl = fullUrl
  }
  return bundleEntry
}
