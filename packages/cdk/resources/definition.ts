import {Function, IFunction} from "aws-cdk-lib/aws-lambda"
import {LambdaInvoke} from "aws-cdk-lib/aws-stepfunctions-tasks"
import {Construct} from "constructs"
import {CatchAllErrorPass} from "./StateMachine/CatchAllErrorPass"
import {
  Chain,
  Choice,
  Condition,
  IChainable,
  Pass,
  TaskInput
} from "aws-cdk-lib/aws-stepfunctions"
import {Fn} from "aws-cdk-lib"

export interface DefinitionProps {
  readonly clinicalViewFunction: IFunction
}

//states
export class ClinicalViewStateMachineDefinition extends Construct {
  public readonly definition: IChainable

  public constructor(scope: Construct, id: string, props: DefinitionProps){
    super(scope, id)

    // Imports
    const getStatusUpdates = Function.fromFunctionArn(
      this, "GetStatusUpdates", `${Fn.importValue("psu:GetStatusUpdates:FunctionArn")}:$LATEST`)

    // States
    const catchAllError = new CatchAllErrorPass(this, "Catch All Error")

    const invokeClinicalView = new LambdaInvoke(this, "Invoke Clinical View", {
      lambdaFunction: props.clinicalViewFunction,
      assign: {
        clinicalViewResponseBody: "{% $parse($states.result.Payload.body) %}",
        responseHeaders: "{% $states.result.Payload.headers %}"
      }
    })
    invokeClinicalView.addCatch(catchAllError.state)

    const invokeGetStatusUpdates = new LambdaInvoke(this, "Invoke Get Status Updates", {
      lambdaFunction: getStatusUpdates,
      payload: TaskInput.fromObject({
        schemaVersion: 2,
        prescriptions: [{
          prescriptionID: "{% $clinicalViewResponseBody.identifier[0].value %}",
          odsCode: "{% $clinicalViewResponseBody.author.identifier.value %}"
        }]
      }),
      assign: {
        getStatusUpdatesResponse: "{% $states.result.Payload %}"
      }
    })
    invokeGetStatusUpdates.addCatch(catchAllError.state)

    const enrichResponse = new Pass(this, "Enrich Response", {
      outputs: {
        Payload:{
          statusCode: 200,
          headers: "{% $responseHeaders %}",
          body: `{% $string(
          $clinicalViewResponseBody ~> | contained[resourceType="MedicationRequest"]) |
          id@$id
          {
            "extension": [
                extension,
                {
                  "url": "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory",
                  "extension": [
                    {
                      "url": "status",
                      "valueCoding: {
                        "system": "https://fhir.nhs.uk/ValueSet/DM-prescription-task-status-reason",
                        "code": "$getStatusUpdatesResponse.items[itemId=$id].latestStatus,
                      }
                    },
                    {
                      "url": "statusDate",
                      "valueDateTime": $getStatusUpdatesResponse.items[itemId=$id].lastUpdatedDateTime
                    }
                  ]
                }
              ]
          }|) %}`
        }
      }
    })

    const statusOK = Condition.jsonata("{% $state.input.Payload.statusCode = 200 %}")
    const checkClinicalViewResult = new Choice(this, "Check Clinical View Result")
    const checkGetStatusUpdatesResult = new Choice(this, "Check Get Status Updates Result")
    const returnResponse = new Pass(this, "Return response")

    // Definition Chain
    const definition = Chain
      .start(invokeClinicalView)
      .next(checkClinicalViewResult
        .when(statusOK, invokeGetStatusUpdates
          .next(checkGetStatusUpdatesResult
            .when(statusOK, enrichResponse)
            .afterwards()))
        .afterwards())
      .next(returnResponse)

    this.definition = definition
  }
}
