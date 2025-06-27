import {Fn} from "aws-cdk-lib"
import {IManagedPolicy, ManagedPolicy} from "aws-cdk-lib/aws-iam"
import {Construct} from "constructs"
import {LambdaFunction} from "../constructs/LambdaFunction"

export interface FunctionsProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
  readonly targetSpineServer: string
  readonly logRetentionInDays: number
  readonly logLevel: string
}

export class Functions extends Construct {
  functions: {[key: string]: LambdaFunction}

  public constructor(scope: Construct, id: string, props: FunctionsProps){
    super(scope, id)

    // Imports
    const lambdaAccessSecretsPolicy: IManagedPolicy = ManagedPolicy.fromManagedPolicyArn(
      this, "lambdaAccessSecretsPolicy", Fn.importValue("account-resources:LambdaAccessSecretsPolicy"))

    const lambdaDefaultEnvironmentVariables: {[key: string]: string} = {
      NODE_OPTIONS: "--enable-source-maps",
      TargetSpineServer: props.targetSpineServer,
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
      functionName: `${props.stackName}-PrescriptionSearch`,
      packageBasePath: "packages/prescriptionSearch",
      entryPoint: "src/handler.ts",
      environmentVariables: {...lambdaDefaultEnvironmentVariables},
      additionalPolicies: [lambdaAccessSecretsPolicy],
      logRetentionInDays: props.logRetentionInDays,
      logLevel: props.logLevel
    })

    const clinicalViewLambda = new LambdaFunction(this, "ClinicalViewLambda", {
      stackName: props.stackName,
      functionName: `${props.stackName}-ClinicalView`,
      packageBasePath: "packages/clinicalView",
      entryPoint: "src/handler.ts",
      environmentVariables: {...lambdaDefaultEnvironmentVariables},
      additionalPolicies: [lambdaAccessSecretsPolicy],
      logRetentionInDays: props.logRetentionInDays,
      logLevel: props.logLevel
    })

    const statusLambda = new LambdaFunction(this, "StatusLambda", {
      stackName: props.stackName,
      functionName: `${props.stackName}-Status`,
      packageBasePath: "packages/status",
      entryPoint: "src/handler.ts",
      environmentVariables: {...lambdaDefaultEnvironmentVariables},
      additionalPolicies: [lambdaAccessSecretsPolicy],
      logRetentionInDays: props.logRetentionInDays,
      logLevel: props.logLevel
    })

    this.functions = {
      prescriptionSearch: prescriptionSearchLambda,
      clinicalView: clinicalViewLambda,
      status: statusLambda
    }
  }
}
