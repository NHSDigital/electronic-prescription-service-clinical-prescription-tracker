import {HttpMethod} from "aws-cdk-lib/aws-lambda"
import {Construct} from "constructs"
import {
  ExpressStateMachine,
  LambdaEndpoint,
  RestApiGateway,
  StateMachineEndpoint,
  TypescriptLambdaFunction
} from "@nhsdigital/eps-cdk-constructs"

export interface ApisProps {
  readonly stackName: string
  readonly logRetentionInDays: number
  readonly mutualTlsTrustStoreKey: string | undefined
  readonly serviceName: string | undefined
  readonly trustStoreUuid: string | undefined
  functions: {[key: string]: TypescriptLambdaFunction}
  stateMachines: {[key: string]: ExpressStateMachine}
  readonly forwardCsocLogs: boolean
  readonly csocApiGatewayDestination: string
}

export class Apis extends Construct {
  apis: {[key: string]: RestApiGateway}

  public constructor(scope: Construct, id: string, props: ApisProps) {
    super(scope, id)

    const apiGateway = new RestApiGateway(this, "ApiGateway", {
      stackName: props.stackName,
      logRetentionInDays: props.logRetentionInDays,
      mutualTlsTrustStoreKey: props.mutualTlsTrustStoreKey,
      serviceName: props.serviceName,
      trustStoreUuid: props.trustStoreUuid,
      forwardCsocLogs: props.forwardCsocLogs,
      csocApiGatewayDestination: props.csocApiGatewayDestination,
      executionPolicies: [
        props.functions.prescriptionSearch.executionPolicy,
        props.stateMachines.clinicalView.executionPolicy,
        props.functions.status.executionPolicy
      ]
    })
    const rootResource = apiGateway.api.root

    const prescriptionSearchEndpoint = new LambdaEndpoint(this, "PrescriptionSearchEndpoint", {
      parentResource: rootResource,
      resourceName: "RequestGroup",
      method: HttpMethod.GET,
      restApiGatewayRole: apiGateway.role,
      lambdaFunction: props.functions.prescriptionSearch
    })

    new StateMachineEndpoint(this, "ClinicalViewEndpoint", {
      parentResource: prescriptionSearchEndpoint.resource,
      resourceName: "{prescriptionId}",
      method: HttpMethod.GET,
      restApiGatewayRole: apiGateway.role,
      stateMachine: props.stateMachines.clinicalView
    })

    new LambdaEndpoint(this, "StatusEndpoint", {
      parentResource: rootResource,
      resourceName: "_status",
      method: HttpMethod.GET,
      restApiGatewayRole: apiGateway.role,
      lambdaFunction: props.functions.status
    })

    this.apis = {
      api: apiGateway
    }
  }
}
