import {IFunction} from "aws-cdk-lib/aws-lambda"
import {LambdaInvoke} from "aws-cdk-lib/aws-stepfunctions-tasks"
import {Construct} from "constructs"
import {CatchAllErrorPass} from "./StateMachine/CatchAllErrorPass"
import {
  Chain,
  Choice,
  Condition,
  IChainable,
  Pass
} from "aws-cdk-lib/aws-stepfunctions"

export interface DefinitionProps {
  readonly clinicalViewFunction: IFunction
}

//states
export class ClinicalViewStateMachineDefinition extends Construct {
  public readonly definition: IChainable

  public constructor(scope: Construct, id: string, props: DefinitionProps){
    super(scope, id)

    // States
    const invokeClinicalView = new LambdaInvoke(this, "Invoke Clinical View", {
      lambdaFunction: props.clinicalViewFunction
    })
    invokeClinicalView.addCatch(new CatchAllErrorPass(this, "Catch All Error").state)

    const invokeGsul = new LambdaInvoke(this, "Invoke GSUL", {
      lambdaFunction: "placeholder"
    })

    const pass = new Pass(this, "Pass response")

    const continueChoice = new Choice(this, "test")

    // Definition
    const definition = Chain
      .start(invokeClinicalView)
      .next(continueChoice
        .when(Condition.jsonata(""), invokeGsul
          .next(pass))
        .afterwards())
      .next(pass)

    this.definition = definition
  }
}
