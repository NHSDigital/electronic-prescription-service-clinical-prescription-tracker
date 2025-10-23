import {App, Stack, StackProps} from "aws-cdk-lib"
import {nagSuppressions} from "../nagSuppressions"
import {Functions} from "../resources/Functions"
import {StateMachines} from "../resources/StateMachines"
import {Apis} from "../resources/Apis"

export interface CptsApiStackProps extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
}
export class CptsApiStack extends Stack {
  public constructor(scope: App, id: string, props: CptsApiStackProps){
    super(scope, id, props)

    // Context
    const logRetentionInDays: number = Number(this.node.tryGetContext("logRetentionInDays"))
    const logLevel: string = this.node.tryGetContext("logLevel")
    const targetSpineServer: string = this.node.tryGetContext("targetSpineServer")
    const enableMutalTls: boolean = this.node.tryGetContext("enableMutalTls")
    const trustStoreFile: string = this.node.tryGetContext("trustStoreFile")
    const truststoreVersion: string = this.node.tryGetContext("truststoreVersion")
    const csocApiGatewayDestination: string = this.node.tryGetContext("csocApiGatewayDestination")
    const forwardCsocLogs: boolean = this.node.tryGetContext("forwardCsocLogs")

    // Resources
    const functions = new Functions(this, "Functions", {
      stackName: props.stackName,
      version: props.version,
      commitId: props.commitId,
      targetSpineServer,
      logRetentionInDays,
      logLevel
    })

    const stateMachines = new StateMachines(this, "StateMachines", {
      stackName: props.stackName,
      logRetentionInDays,
      functions: functions.functions
    })

    new Apis(this, "Apis", {
      stackName: props.stackName,
      logRetentionInDays,
      enableMutalTls,
      trustStoreFile,
      truststoreVersion,
      functions: functions.functions,
      stateMachines: stateMachines.stateMachines,
      csocApiGatewayDestination: csocApiGatewayDestination,
      forwardCsocLogs: forwardCsocLogs
    })

    nagSuppressions(this)
  }
}
