import {Fn, RemovalPolicy} from "aws-cdk-lib"
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
  DefinitionBody,
  IChainable,
  LogLevel,
  QueryLanguage,
  StateMachine,
  StateMachineType
} from "aws-cdk-lib/aws-stepfunctions"
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
      this, "cloudwatchEncryptionKMSPolicy", Fn.importValue("account-resources:CloudwatchEncryptionKMSPolicyArn"))

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
