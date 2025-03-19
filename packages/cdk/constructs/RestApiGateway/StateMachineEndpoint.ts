
import {IResource, PassthroughBehavior, StepFunctionsIntegration} from "aws-cdk-lib/aws-apigateway"
import {IRole} from "aws-cdk-lib/aws-iam"
import {HttpMethod} from "aws-cdk-lib/aws-lambda"
import {StateMachine} from "aws-cdk-lib/aws-stepfunctions"
import {Construct} from "constructs"
import {stateMachineRequestTemplate} from "./templates/stateMachineRequest"
import {stateMachine200ResponseTemplate, stateMachineErrorResponseTemplate} from "./templates/stateMachineResponses"

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

    const requestTemplate = stateMachineRequestTemplate(props.stateMachine.stateMachineArn)

    const resource = props.parentResource.addResource(props.resourceName)
    resource.addMethod(props.method, StepFunctionsIntegration.startExecution(props.stateMachine, {
      credentialsRole: props.restApiGatewayRole,
      passthroughBehavior: PassthroughBehavior.WHEN_NO_MATCH,
      requestTemplates: {
        "application/json": requestTemplate,
        "application/fhir+json": requestTemplate
      },
      integrationResponses: [
        {
          statusCode: "200",
          responseTemplates: {
            "application/json": stateMachine200ResponseTemplate
          }
        },
        {
          statusCode: "400",
          responseTemplates: {
            "application/json": stateMachineErrorResponseTemplate("400")
          }
        },
        {
          statusCode: "500",
          responseTemplates: {
            "application/json": stateMachineErrorResponseTemplate("500")
          }
        }
      ]
    }), {
      methodResponses: [
        {statusCode: "200"},
        {statusCode: "400"},
        {statusCode: "500"}
      ]
    })
  }
}

// what about other possible responses, 404 etc?
