import {BundleEntry} from "fhir/r4"

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
