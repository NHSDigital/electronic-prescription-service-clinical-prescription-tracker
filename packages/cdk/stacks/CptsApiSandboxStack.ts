import {StackProps, Stack, App} from "aws-cdk-lib"

export interface CptsApiSandboxStackProps extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
}

export class CptsApiSandboxStack extends Stack {
  public constructor(scope: App, id: string, props: CptsApiSandboxStackProps){
    super(scope, id, props)

    // PLACEHOLDER FOR SANDBOX RESOURCES
  }
}
