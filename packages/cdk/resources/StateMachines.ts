import {Construct} from "constructs"
import {ExpressStateMachine} from "../constructs/StateMachine"
import {LambdaFunction} from "../constructs/LambdaFunction"
import {ClinicalView} from "./StateMachineDefinitions/ClinicalView"
import {Function} from "aws-cdk-lib/aws-lambda"
import {Fn} from "aws-cdk-lib"
import {ManagedPolicy, PolicyStatement} from "aws-cdk-lib/aws-iam"

export interface StateMachinesProps {
  readonly stackName: string
  readonly logRetentionInDays: number
  functions: {[key: string]: LambdaFunction}
}

export class StateMachines extends Construct {
  stateMachines: {[key: string]: ExpressStateMachine}

  public constructor(scope: Construct, id: string, props: StateMachinesProps){
    super(scope, id)

    // Imports
    const getStatusUpdates = Function.fromFunctionArn(
      this, "GetStatusUpdates", `${Fn.importValue("psu:functions:GetStatusUpdates:FunctionArn")}:$LATEST`)

    const clinicalView = new ClinicalView(this, "ClinicalViewStateMachineDefinition", {
      clinicalViewFunction: props.functions.clinicalView.function,
      getStatusUpdatesFunction: getStatusUpdates
    })
    const callLambdasManagedPolicy = new ManagedPolicy(this, "ClinicalViewCallLambdasManagedPolicy", {
      description: `call lambdas from clinical view state machine`,
      statements: [
        new PolicyStatement({
          actions: [
            "lambda:InvokeFunction"
          ],
          resources: [
            props.functions.clinicalView.function.functionArn,
            getStatusUpdates.functionArn
          ]
        })
      ]
    })
    const clinicalViewStateMachine = new ExpressStateMachine(this, "ClinicalViewStateMachine", {
      stackName: props.stackName,
      stateMachineName: `${props.stackName}-ClinicalView`,
      definition: clinicalView.definition,
      logRetentionInDays: props.logRetentionInDays,
      additionalPolicies: [callLambdasManagedPolicy]
    })

    this.stateMachines = {
      clinicalView: clinicalViewStateMachine
    }
  }
}
