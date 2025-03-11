import {
  App,
  Fn,
  Stack,
  StackProps
} from "aws-cdk-lib"
import {IManagedPolicy, ManagedPolicy} from "aws-cdk-lib/aws-iam"
import {HttpMethod} from "aws-cdk-lib/aws-lambda"
import {LambdaFunction} from "../resources/LambdaFunction"
import {RestApiGateway} from "../resources/RestApiGateway"
import {LambdaEndpoint} from "../resources/RestApiGateway/LambdaEndpoint"
import {nagSuppressions} from "../nagSuppressions"

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

    // Imports
    const lambdaAccessSecretsPolicy: IManagedPolicy = ManagedPolicy.fromManagedPolicyArn(
      this, "lambdaAccessSecretsPolicy", Fn.importValue("account-resources:LambdaAccessSecretsPolicy"))

    const lambdaDefaultEnvironmentVariables: {[key: string]: string} = {
      NODE_OPTIONS: "--enable-source-maps",
      TargetSpineServer: targetSpineServer,
      SpinePrivateKeyARN: Fn.importValue("account-resources:SpinePrivateKey"),
      SpinePublicCertificateARN: Fn.importValue("account-resources:SpinePublicCertificate"),
      SpineASIDARN: Fn.importValue("account-resources:SpineASID"),
      SpinePartyKeyARN: Fn.importValue("account-resources:SpinePartyKey"),
      SpineCAChainARN: Fn.importValue("account-resources:SpineCAChain"),
      ServiceSearchApiKeyARN: Fn.importValue("account-resources:ServiceSearchApiKey"),
      VERSION_NUMBER: props.version,
      COMMIT_ID: props.commitId,
      AWS_LAMBDA_EXEC_WRAPPER: "/opt/get-secrets-layer"
    }

    // Resources
    const prescriptionSearchLambda = new LambdaFunction(this, "PrescriptionSearchLambda", {
      stackName: props.stackName,
      functionName: "PrescriptionSearch",
      packageBasePath: "packages/prescriptionSearch",
      entryPoint: "src/handler.ts",
      environmentVariables: {...lambdaDefaultEnvironmentVariables},
      additionalPolicies: [lambdaAccessSecretsPolicy],
      logRetentionInDays: logRetentionInDays,
      logLevel: logLevel
    })

    const clinicalViewLambda = new LambdaFunction(this, "ClinicalViewLambda", {
      stackName: props.stackName,
      functionName: "ClinicalView",
      packageBasePath: "packages/clinicalView",
      entryPoint: "src/handler.ts",
      environmentVariables: {...lambdaDefaultEnvironmentVariables},
      additionalPolicies: [lambdaAccessSecretsPolicy],
      logRetentionInDays: logRetentionInDays,
      logLevel: logLevel
    })

    const statusLambda = new LambdaFunction(this, "StatusLambda", {
      stackName: props.stackName,
      functionName: "Status",
      packageBasePath: "packages/status",
      entryPoint: "src/handler.ts",
      environmentVariables: {...lambdaDefaultEnvironmentVariables},
      additionalPolicies: [lambdaAccessSecretsPolicy],
      logRetentionInDays: logRetentionInDays,
      logLevel: logLevel
    })

    const apiGateway = new RestApiGateway(this, "ApiGateway", {
      stackName: props.stackName,
      logRetentionInDays: logRetentionInDays,
      enableMutualTls: enableMutalTls,
      trustStoreKey: trustStoreFile,
      truststoreVersion: truststoreVersion
    })
    const rootResource = apiGateway.api.root

    const prescriptionSearchEndpoint = new LambdaEndpoint(this, "PrescriptionSearchEndpoint", {
      parentResource: rootResource,
      resourceName: "RequestGroup",
      method: HttpMethod.GET,
      restApiGatewayRole: apiGateway.role,
      lambdaFunction: prescriptionSearchLambda
    })

    new LambdaEndpoint(this, "ClinicalViewEndpoint", {
      parentResource: prescriptionSearchEndpoint.resource,
      resourceName: "{prescriptionId}",
      method: HttpMethod.GET,
      restApiGatewayRole: apiGateway.role,
      lambdaFunction: clinicalViewLambda
    })

    new LambdaEndpoint(this, "StatusEndpoint", {
      parentResource: rootResource,
      resourceName: "_status",
      method: HttpMethod.GET,
      restApiGatewayRole: apiGateway.role,
      lambdaFunction: statusLambda
    })

    nagSuppressions(this)
  }
}
