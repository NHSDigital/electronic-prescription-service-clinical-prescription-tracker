import {App, Stack} from "aws-cdk-lib"
import {nagSuppressions} from "../nagSuppressions"
import {Functions} from "../resources/Functions"
import {StateMachines} from "../resources/StateMachines"
import {Apis} from "../resources/Apis"
import {StandardStackProps} from "@nhsdigital/eps-cdk-constructs"

export interface CptsApiStackProps extends StandardStackProps {
  readonly stackName: string
  readonly logRetentionInDays: number
  readonly logLevel: string
  readonly targetSpineServer: string
  readonly mutualTlsTrustStoreKey: string | undefined
  readonly csocApiGatewayDestination: string
  readonly forwardCsocLogs: boolean
}

export class CptsApiStack extends Stack {
  public constructor(scope: App, id: string, props: CptsApiStackProps){
    super(scope, id, props)

    // Resources
    const functions = new Functions(this, "Functions", {
      stackName: props.stackName,
      version: props.version,
      commitId: props.commitId,
      targetSpineServer: props.targetSpineServer,
      logRetentionInDays: props.logRetentionInDays,
      logLevel: props.logLevel
    })

    const stateMachines = new StateMachines(this, "StateMachines", {
      stackName: props.stackName,
      logRetentionInDays: props.logRetentionInDays,
      functions: functions.functions
    })

    new Apis(this, "Apis", {
      stackName: props.stackName,
      logRetentionInDays: props.logRetentionInDays,
      mutualTlsTrustStoreKey: props.mutualTlsTrustStoreKey,
      functions: functions.functions,
      stateMachines: stateMachines.stateMachines,
      csocApiGatewayDestination: props.csocApiGatewayDestination,
      forwardCsocLogs: props.forwardCsocLogs
    })

    nagSuppressions(this)
  }
}
