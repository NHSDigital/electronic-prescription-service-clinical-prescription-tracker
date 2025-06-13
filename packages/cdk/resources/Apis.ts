import {HttpMethod} from "aws-cdk-lib/aws-lambda"
import {Construct} from "constructs"
import {RestApiGateway} from "../constructs/RestApiGateway"
import {LambdaEndpoint} from "../constructs/RestApiGateway/LambdaEndpoint"
import {LambdaFunction} from "../constructs/LambdaFunction"
import {ExpressStateMachine} from "../constructs/StateMachine"
import {StateMachineEndpoint} from "../constructs/RestApiGateway/StateMachineEndpoint"

export interface ApisProps {
  readonly stackName: string
  readonly logRetentionInDays: number
  readonly enableMutalTls: boolean
  readonly trustStoreFile: string
  readonly truststoreVersion: string
  functions: {[key: string]: LambdaFunction}
  stateMachines: {[key: string]: ExpressStateMachine}
}

export class Apis extends Construct {
  apis: {[key: string]: RestApiGateway}

  public constructor(scope: Construct, id: string, props: ApisProps){
    super(scope, id)

    const apiGateway = new RestApiGateway(this, "ApiGateway", {
      stackName: props.stackName,
      logRetentionInDays: props.logRetentionInDays,
      enableMutualTls: props.enableMutalTls,
      trustStoreKey: props.trustStoreFile,
      truststoreVersion: props.truststoreVersion
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
