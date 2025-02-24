// TODO: remove this temp disable
/* eslint-disable @typescript-eslint/no-unused-vars */
import {App, Stack, StackProps} from "aws-cdk-lib"
import {LambdaFunction} from "../resources/LambdaFunction"

export interface CptsApiStackProps extends StackProps {
  readonly stackName: string
  readonly version: string
}

export class CptsApiStack extends Stack {
  public constructor(scope: App, id: string, props: CptsApiStackProps){
    super(scope, id, props)
    // Context
    const logRetentionInDays: number = Number(this.node.tryGetContext("logRetentionInDays"))
    const logLevel: string = this.node.tryGetContext("logLevel")

    // Imports

    // Resources
    const clinicalViewLambda = new LambdaFunction(this, "ClinicalView", {
      stackName: props.stackName,
      functionName: "ClinicalView",
      packageBasePath: "packages/clinicalView",
      entryPoint: "src/handler.ts",
      environmentVariables: {},
      logRetentionInDays: logRetentionInDays,
      logLevel: logLevel
    })

    const prescriptionSearchLambda = new LambdaFunction(this, "PrescriptionSearch", {
      stackName: props.stackName,
      functionName: "PrescriptionSearch",
      packageBasePath: "packages/prescriptionSearch",
      entryPoint: "src/handler.ts",
      environmentVariables: {},
      logRetentionInDays: logRetentionInDays,
      logLevel: logLevel
    })

    const statusLambda = new LambdaFunction(this, "Status", {
      stackName: props.stackName,
      functionName: "Status",
      packageBasePath: "packages/prescriptionSearch",
      entryPoint: "src/handler.ts",
      environmentVariables: {},
      logRetentionInDays: logRetentionInDays,
      logLevel: logLevel
    })

    // Outputs

    // Exports
  }
}
