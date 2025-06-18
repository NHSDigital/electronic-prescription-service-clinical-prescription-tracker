import {Function, IFunction} from "aws-cdk-lib/aws-lambda"
import {LambdaInvoke} from "aws-cdk-lib/aws-stepfunctions-tasks"
import {Construct} from "constructs"
import {
  Chain,
  Choice,
  Condition,
  IChainable,
  Pass,
  TaskInput
} from "aws-cdk-lib/aws-stepfunctions"
import {Fn} from "aws-cdk-lib"
import {CatchAllErrorPass} from "../../constructs/StateMachine/CatchAllErrorPass"
import {
  extractPrescriptionIdExpression,
  extractAuthorOdsCodeExpression,
  enrichResponseExpression
} from "../../../clinicalView/src/enrichResponseJsonata.cjs"

export interface DefinitionProps {
  readonly clinicalViewFunction: IFunction
}

export class ClinicalView extends Construct {
  public readonly definition: IChainable

  public constructor(scope: Construct, id: string, props: DefinitionProps){
    super(scope, id)

    // Imports
    const getStatusUpdates = Function.fromFunctionArn(
      this, "GetStatusUpdates", `${Fn.importValue("psu:functions:GetStatusUpdates:FunctionArn")}:$LATEST`)

    // States
    const catchAllError = new CatchAllErrorPass(this, "Catch All Error")

    const invokeClinicalView = new LambdaInvoke(this, "Invoke Clinical View", {
      lambdaFunction: props.clinicalViewFunction,
      assign: {
        /* $parse is a Step Function specific jsonata function and handles JSON deserializing,
        this is usually handled by $eval in standard jsonata however this is not supported
        in Step Functions workflows. */
        clinicalViewResponseBody: "{% $parse($states.result.Payload.body) %}",
        responseHeaders: "{% $states.result.Payload.headers %}"
      }
    })
    invokeClinicalView.addCatch(catchAllError.state)

    const invokeGetStatusUpdates = new LambdaInvoke(this, "Invoke Get Status Updates", {
      lambdaFunction: getStatusUpdates,
      payload: TaskInput.fromObject({
        schemaVersion: 1,
        prescriptions: [{
          prescriptionID: `{% ${extractPrescriptionIdExpression} %}`,
          odsCode: `{% ${extractAuthorOdsCodeExpression} %}`
        }]
      }),
      assign: {
        getStatusUpdatesResponse: "{% $states.result.Payload %}",
        prescriptionId: `{% ${extractPrescriptionIdExpression} %}`
      }

    })
    invokeGetStatusUpdates.addCatch(catchAllError.state)

    const enrichResponse = new Pass(this, "Enrich Response", {
      outputs: {
        Payload:{
          statusCode: 200,
          headers: "{% $responseHeaders %}",
          body: `{% ${enrichResponseExpression} %}`
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
