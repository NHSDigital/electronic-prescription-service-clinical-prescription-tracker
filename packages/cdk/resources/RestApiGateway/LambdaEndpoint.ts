import {IResource} from "aws-cdk-lib/aws-apigateway"
import {IManagedPolicy, IRole} from "aws-cdk-lib/aws-iam"
import {HttpMethod} from "aws-cdk-lib/aws-lambda"
import {Construct} from "constructs"

export interface LambdaEndpointProps {
  parentResource: IResource
  readonly resourceName: string
  readonly method: HttpMethod
  restApiGatewayRole: IRole
  lambdaExecutionPolicy: IManagedPolicy
}

export class LambdaEndpoint extends Construct {
  resource: IResource

  public constructor(scope: Construct, id: string, props: LambdaEndpointProps){
    super(scope, id)

    const resource = props.parentResource.addResource(props.resourceName)
    resource.addMethod(props.method)
    props.restApiGatewayRole.addManagedPolicy(props.lambdaExecutionPolicy)

    this.resource = resource
  }
}
