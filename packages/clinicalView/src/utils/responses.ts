import {BundleEntry} from "fhir/r4"

/**
 * Generates a 404 response when a prescription is not found.
 */
export const prescriptionNotFoundResponse = (prescriptionId: string) => {
  return {
    data: {
      prescriptionId,
      error: "Not Found"
    },
    status: 404
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
