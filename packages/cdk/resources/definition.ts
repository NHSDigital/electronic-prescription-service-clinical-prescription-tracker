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
        clinicalViewResponse: "{% $parse($states.result.Payload.body) %}"
      }
    })
    invokeClinicalView.addCatch(catchAllError.state)

    const invokeGetStatusUpdates = new LambdaInvoke(this, "Invoke Get Status Updates", {
      lambdaFunction: getStatusUpdates,
      payload: TaskInput.fromObject({
        schemaVersion: 2,
        prescriptions: [{
          prescriptionID: "{% $clinicalViewResponse.identifier[0].value %}",
          odsCode: "{% $clinicalViewResponse.author.identifier.value %}"
        }]
      }),
      assign: {
        getStatusUpdatesResponse: "{% states.result.Payload %}"
      }
    })
    invokeGetStatusUpdates.addCatch(catchAllError.state)

    const enrichResponse = new Pass(this, "Enrich Response", {
      outputs: {

      }
    })

    // Definition Chain
    const definition = Chain
      .start(invokeClinicalView)
      .next(new Choice(this, "Clinical View Result")
        .when(Condition.jsonata("{% $state.input.Payload.statusCode = 200 %}"), invokeGetStatusUpdates
          .next(enrichResponse))
        .afterwards())
      .next(new Pass(this, "Return response"))

    this.definition = definition
  }
}
