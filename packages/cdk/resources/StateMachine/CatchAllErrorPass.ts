import {Pass} from "aws-cdk-lib/aws-stepfunctions"
import {Construct} from "constructs"

const severErrorOperationOutcome = {
  ResourceType: "OperationOutcome",
  meta: {
    lastUpdated: "{% $now() %}"
  },
  issue: [
    {
      code: "exception",
      severity: "fatal",
      diagnostics: "Unknown Error.",
      details: {
        coding: [
          {
            system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
            code: "SERVER_ERROR",
            display: "500: The Server has encountered an error processing the request."
          }
        ]
      }
    }
  ]
}

export class CatchAllErrorPass extends Construct {
  public readonly state

  public constructor(scope: Construct, id: string) {
    super(scope, id)

    const state = new Pass(this, "Catch All Error", {
      assign: {
        bodyTemplate: severErrorOperationOutcome
      },
      outputs: {
        Payload: {
          statusCode: 500,
          headers: {
            "Content-Type": "application/fhir+json",
            "Cache-Control": "co-cache"
          },
          body: "{% $string($bodyTemplate) %}"
        }
      }
    })

    this.state = state
  }
}
