import {IResource, LambdaIntegration} from "aws-cdk-lib/aws-apigateway"
import {IRole} from "aws-cdk-lib/aws-iam"
import {HttpMethod} from "aws-cdk-lib/aws-lambda"
import {Construct} from "constructs"
import {TypescriptLambdaFunction} from "@nhsdigital/eps-cdk-constructs"

export interface LambdaEndpointProps {
  parentResource: IResource
  readonly resourceName: string
  readonly method: HttpMethod
  restApiGatewayRole: IRole
  lambdaFunction: TypescriptLambdaFunction
}

export class LambdaEndpoint extends Construct {
  resource: IResource

  public constructor(scope: Construct, id: string, props: LambdaEndpointProps){
    super(scope, id)

    const resource = props.parentResource.addResource(props.resourceName)
    resource.addMethod(props.method, new LambdaIntegration(props.lambdaFunction.function, {
      credentialsRole: props.restApiGatewayRole
    }))

    this.resource = resource
  }
}
