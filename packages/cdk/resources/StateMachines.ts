import {Construct} from "constructs"
import {ExpressStateMachine} from "../constructs/StateMachine"
import {LambdaFunction} from "../constructs/LambdaFunction"
import {ClinicalView} from "./StateMachineDefinitions/ClinicalView"

export interface StateMachinesProps {
  readonly stackName: string
  readonly logRetentionInDays: number
  functions: {[key: string]: LambdaFunction}
}

export class StateMachines extends Construct {
  stateMachines: {[key: string]: ExpressStateMachine}

  public constructor(scope: Construct, id: string, props: StateMachinesProps){
    super(scope, id)

    const clinicalView = new ClinicalView(this, "ClinicalViewStateMachineDefinition", {
      clinicalViewFunction: props.functions.clinicalView.function
    })
    const clinicalViewStateMachine = new ExpressStateMachine(this, "ClinicalViewStateMachine", {
      stackName: props.stackName,
      stateMachineName: `${props.stackName}-ClinicalView`,
      definition: clinicalView.definition,
      logRetentionInDays: props.logRetentionInDays
    })

    this.stateMachines = {
      clinicalView: clinicalViewStateMachine
    }
  }
}
