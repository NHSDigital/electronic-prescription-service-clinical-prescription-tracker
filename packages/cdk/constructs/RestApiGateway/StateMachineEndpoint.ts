/* eslint-disable @typescript-eslint/no-unused-vars */
import {IResource, StepFunctionsIntegration} from "aws-cdk-lib/aws-apigateway"
import {IRole} from "aws-cdk-lib/aws-iam"
import {HttpMethod} from "aws-cdk-lib/aws-lambda"
import {StateMachine} from "aws-cdk-lib/aws-stepfunctions"
import {Construct} from "constructs"

export interface StateMachineEndpointProps {
  parentResource: IResource,
  readonly resourceName: string
  readonly method: HttpMethod
  restApiGatewayRole: IRole
  stateMachine: StateMachine
}

export class StateMachineEndpoint extends Construct{
  resource: IResource

  public constructor(scope: Construct, id: string, props: StateMachineEndpointProps){
    super(scope, id)

    const resource = props.parentResource.addResource(props.resourceName)
    // resource.addMethod(props.method, new StepFunctionsIntegration(props.stateMachine, {
    // }))
  }
}
