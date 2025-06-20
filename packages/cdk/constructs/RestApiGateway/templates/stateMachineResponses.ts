/* eslint-disable max-len */
export const stateMachine200ResponseTemplate = `#set($payload = $util.parseJson($input.path('$.output')))
#set($context.responseOverride.status = $payload.Payload.statusCode)
#set($allHeaders = $payload.Payload.headers)
#foreach($headerName in $allHeaders.keySet())
    #set($context.responseOverride.header[$headerName] = $allHeaders.get($headerName))
#end
$payload.Payload.body`

interface ErrorMap {
    [key: string]: {
        code: string
        severity: string
        diagnostics :string
        codingCode: string
        codingDisplay: string
    }
}

const getOperationOutcome = (status: string) => {
  const errorMap: ErrorMap = {
    400: {
      code: "value",
      severity: "error",
      diagnostics: "Invalid request.",
      codingCode: "BAD_REQUEST",
      codingDisplay: "400: The Server was unable to process the request"
    },
    500: {
      code: "exception",
      severity: "fatal",
      diagnostics: "Unknown Error.",
      codingCode: "SERVER_ERROR",
      codingDisplay: "500: The Server has encountered an error processing the request."
    }
  }

  return JSON.stringify( {
    ResourceType: "OperationOutcome",
    issue: [
      {
        code: errorMap[status].code,
        severity: errorMap[status].severity,
        diagnostics: errorMap[status],
        details: {
          coding: [
            {
              system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
              code: errorMap[status].codingCode,
              display: errorMap[status].codingDisplay
            }
          ]
        }
      }
    ]
  })

}

export const stateMachineErrorResponseTemplate = (status: string) => `#set($context.responseOverride.header["Content-Type"] ="application/fhir+json")
${getOperationOutcome(status)}`
