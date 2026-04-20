import {App, Fn, Stack} from "aws-cdk-lib"
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
  readonly serviceName: string | undefined
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

    const trustStoreUuid = Fn.select(2, Fn.split("/", this.stackId))

    new Apis(this, "Apis", {
      stackName: props.stackName,
      logRetentionInDays: props.logRetentionInDays,
      mutualTlsTrustStoreKey: props.mutualTlsTrustStoreKey,
      serviceName: props.serviceName,
      trustStoreUuid: trustStoreUuid,
      functions: functions.functions,
      stateMachines: stateMachines.stateMachines,
      csocApiGatewayDestination: props.csocApiGatewayDestination,
      forwardCsocLogs: props.forwardCsocLogs
    })

    nagSuppressions(this)
  }
}
