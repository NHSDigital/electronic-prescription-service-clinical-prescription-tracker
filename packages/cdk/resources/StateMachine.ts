import {Fn, RemovalPolicy} from "aws-cdk-lib"
import {ResourceType} from "aws-cdk-lib/aws-config"
import {
  IManagedPolicy,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal
} from "aws-cdk-lib/aws-iam"
import {Stream} from "aws-cdk-lib/aws-kinesis"
import {Key} from "aws-cdk-lib/aws-kms"
import {CfnLogGroup, CfnSubscriptionFilter, LogGroup} from "aws-cdk-lib/aws-logs"
import {
  Chain,
  DefinitionBody,
  IChainable,
  LogLevel,
  Pass,
  QueryLanguage,
  Result,
  StateMachine,
  StateMachineType
} from "aws-cdk-lib/aws-stepfunctions"
import {LambdaInvoke} from "aws-cdk-lib/aws-stepfunctions-tasks"
import {Construct} from "constructs"

export interface StateMachineProps {
  readonly stackName: string
  readonly stateMachineName: string
  readonly definition: IChainable
  readonly additionalPolicies?: Array<IManagedPolicy>
  readonly logRetentionInDays: number
}

export class ExpressStateMachine extends Construct {
  public readonly executionPolicy: ManagedPolicy
  public readonly stateMachine: StateMachine

  public constructor(scope: Construct, id: string, props: StateMachineProps) {
    super(scope, id)

    // Imports
    const cloudWatchLogsKmsKey = Key.fromKeyArn(
      this, "CloudWatchLogsKmsKey", Fn.importValue("account-resources:CloudwatchLogsKmsKeyArn"))

    const cloudwatchEncryptionKMSPolicy = ManagedPolicy.fromManagedPolicyArn(
      this, "cloudwatchEncryptionKMSPolicyArn", Fn.importValue("account-resources:CloudwatchEncryptionKMSPolicyArn"))

    const splunkDeliveryStream = Stream.fromStreamArn(
      this, "SplunkDeliveryStream", Fn.importValue("lambda-resources:SplunkDeliveryStream"))

    const splunkSubscriptionFilterRole = Role.fromRoleArn(
      this, "splunkSubscriptionFilterRole", Fn.importValue("lambda-resources:SplunkSubscriptionFilterRole"))

    // Resources
    const logGroup = new LogGroup(this, "StateMachineLogGroup", {
      encryptionKey: cloudWatchLogsKmsKey,
      logGroupName: `/aws/stepfunctions/${props.stateMachineName}`,
      retention: props.logRetentionInDays,
      removalPolicy: RemovalPolicy.DESTROY
    })

    const cfnLogGroup = logGroup.node.defaultChild as CfnLogGroup
    cfnLogGroup.cfnOptions.metadata = {
      guard: {
        SuppressedRules: [
          "CW_LOGGROUP_RETENTION_PERIOD_CHECK"
        ]
      }
    }

    new CfnSubscriptionFilter(this, "LambdaLogsSplunkSubscriptionFilter", {
      destinationArn: splunkDeliveryStream.streamArn,
      filterPattern: "",
      logGroupName: logGroup.logGroupName,
      roleArn: splunkSubscriptionFilterRole.roleArn

    })

    const putLogsManagedPolicy = new ManagedPolicy(this, "StateMachinePutLogsManagedPolicy", {
      description: `write to ${props.stateMachineName} logs`,
      statements: [
        new PolicyStatement({
          actions: [
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ],
          resources: [
            logGroup.logGroupArn,
            `${logGroup.logGroupArn}:log-stream`
          ]
        }),
        new PolicyStatement({
          actions: [
            "logs:DescribeLogGroups",
            "logs:ListLogDeliveries",
            "logs:CreateLogDelivery",
            "logs:GetLogDelivery",
            "logs:UpdateLogDelivery",
            "logs:DeleteLogDelivery",
            "logs:PutResourcePolicy",
            "logs:DescribeResourcePolicies"
          ],
          resources: ["*"]
        })
      ]
    })

    const role = new Role(this, "StateMachineRole", {
      assumedBy: new ServicePrincipal("states.amazonaws.com"),
      managedPolicies: [
        putLogsManagedPolicy,
        cloudwatchEncryptionKMSPolicy,
        ...(props.additionalPolicies ?? [])
      ]
    })

    const stateMachine = new StateMachine(this, "StateMachine", {
      stateMachineName: props.stateMachineName,
      stateMachineType: StateMachineType.EXPRESS,
      queryLanguage: QueryLanguage.JSONATA,
      definitionBody: DefinitionBody.fromChainable(props.definition),
      role: role,
      logs: {
        destination: logGroup,
        level: LogLevel.ALL
      },
      tracingEnabled: true
    })

    const executionManagedPolicy = new ManagedPolicy(this, "ExecuteStateMachineManagedPolicy", {
      description: `execute state machine ${props.stateMachineName}`,
      statements: [
        new PolicyStatement({
          actions: [
            "states:StartSyncExecution",
            "states:StartExecution"
          ],
          resources: [stateMachine.stateMachineArn]
        })
      ]
    })

    // Outputs
    this.executionPolicy = executionManagedPolicy
    this.stateMachine = stateMachine
  }
}

// place holder location
const definition = Chain
  .start("Invoke clinical view")
  .next("Choice - did CV error")
  .next("invoke gsul")
  .next("combine results")
  .next("return results")

//states
const severErrorOperationOutcome = {
  ResourceType: "OperationOutcome",
  meta: {
    lastUpdated: "{% $timestamp %}"
  },
  issue: [
    {
      code: "exception",
      severity: "fatal",
      diagnostics: "Unknown Error.",
      details: {
        coding: [
          {
            system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
            code: "SERVER_ERROR",
            display: "500: The Server has encountered an error processing the request."
          }
        ]
      }
    }
  ]
}

const catchAllError = new Pass(this, "Catch All Error", {
  assign: {
    timestamp: "{% $now() %}",
    bodyTemplate: `${JSON.stringify(severErrorOperationOutcome)}`
  },
  outputs: {
    Payload: {
      statusCode: 500,
      headers: {
        "Content-Type": "application/fhir+json",
        "Cache-Control": "co-cache"
      },
      body: "{% $bodyTemplate %}"
    }
  }
})

const invokeClinicalView = new LambdaInvoke(this, "Invoke Clinical View", {
  lambdaFunction: "function"
})

invokeClinicalView.addCatch(catchAllError)
