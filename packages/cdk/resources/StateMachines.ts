import {Construct} from "constructs"
import {ExpressStateMachine} from "../constructs/StateMachine"
import {TypescriptLambdaFunction} from "@nhsdigital/eps-cdk-constructs"
import {ClinicalView} from "./StateMachineDefinitions/ClinicalView"
import {Function} from "aws-cdk-lib/aws-lambda"
import {Fn} from "aws-cdk-lib"
import {ManagedPolicy, PolicyStatement} from "aws-cdk-lib/aws-iam"

export interface StateMachinesProps {
  readonly stackName: string
  readonly logRetentionInDays: number
  functions: {[key: string]: TypescriptLambdaFunction}
}

export class StateMachines extends Construct {
  stateMachines: {[key: string]: ExpressStateMachine}

  public constructor(scope: Construct, id: string, props: StateMachinesProps){
    super(scope, id)

    // Imports
    const getStatusUpdates = Function.fromFunctionArn(
      this, "GetStatusUpdates", `${Fn.importValue("psu:functions:GetStatusUpdates:FunctionArn")}:$LATEST`)
    const callGetStatusUpdatesManagedPolicy = new ManagedPolicy(this, "CallGetStatusUpdatesManagedPolicy", {
      description: `call get status updates lambda from clinical view state machine`,
      statements: [
        new PolicyStatement({
          actions: [
            "lambda:InvokeFunction"
          ],
          resources: [
            getStatusUpdates.functionArn
          ]
        })
      ]
    })

    const clinicalView = new ClinicalView(this, "ClinicalViewStateMachineDefinition", {
      clinicalViewFunction: props.functions.clinicalView.function,
      getStatusUpdatesFunction: getStatusUpdates
    })
    const clinicalViewStateMachine = new ExpressStateMachine(this, "ClinicalViewStateMachine", {
      stackName: props.stackName,
      stateMachineName: `${props.stackName}-ClinicalView`,
      definition: clinicalView.definition,
      logRetentionInDays: props.logRetentionInDays,
      additionalPolicies: [
        props.functions.clinicalView.executionPolicy,
        callGetStatusUpdatesManagedPolicy
      ]
    })

    this.stateMachines = {
      clinicalView: clinicalViewStateMachine
    }
  }
}
