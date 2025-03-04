import {Fn, RemovalPolicy} from "aws-cdk-lib"
import {
  CfnStage,
  EndpointType,
  LogGroupLogDestination,
  MethodLoggingLevel,
  MTLSConfig,
  RestApi,
  SecurityPolicy
} from "aws-cdk-lib/aws-apigateway"
import {IRole, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam"
import {Stream} from "aws-cdk-lib/aws-kinesis"
import {Key} from "aws-cdk-lib/aws-kms"
import {CfnSubscriptionFilter, LogGroup} from "aws-cdk-lib/aws-logs"
import {Construct} from "constructs"
import {accessLogFormat} from "./RestApiGateway/accessLogFormat"
import {ICertificate} from "aws-cdk-lib/aws-certificatemanager"
import {Bucket} from "aws-cdk-lib/aws-s3"
import {ARecord, IHostedZone, RecordTarget} from "aws-cdk-lib/aws-route53"
import {ApiGateway as ApiGatewayTarget} from "aws-cdk-lib/aws-route53-targets"

export interface RestApiGatewayProps {
  readonly stackName: string
  readonly hostedZone: IHostedZone
  readonly domainName: string
  readonly certificate: ICertificate
  readonly logRetentionInDays: number
  readonly enableMutualTls: boolean
  readonly trustStoreKey: string
  readonly truststoreVersion: string
}

export class RestApiGateway extends Construct {
  public readonly api: RestApi
  public readonly role: IRole

  public constructor(scope: Construct, id: string, props: RestApiGatewayProps) {
    super(scope, id)

    // Imports
    const cloudWatchLogsKmsKey = Key.fromKeyArn(
      this, "cloudWatchLogsKmsKey", Fn.importValue("account-resources:CloudwatchLogsKmsKeyArn"))

    const splunkDeliveryStream = Stream.fromStreamArn(
      this, "SplunkDeliveryStream", Fn.importValue("lambda-resources:SplunkDeliveryStream"))

    const splunkSubscriptionFilterRole = Role.fromRoleArn(
      this, "splunkSubscriptionFilterRole", Fn.importValue("lambda-resources:SplunkSubscriptionFilterRole"))

    const truststoreBucket = Bucket.fromBucketArn(
      this, "TrustStoreBucket", Fn.importValue("account-resources:TrustStoreBucket"))

    // Resources
    const logGroup = new LogGroup(this, "ApiGatewayAccessLogGroup", {
      encryptionKey: cloudWatchLogsKmsKey,
      logGroupName: `/aws/apigateway/${props.stackName}-apigw`,
      retention: props.logRetentionInDays,
      removalPolicy: RemovalPolicy.DESTROY
    })

    new CfnSubscriptionFilter(this, "ApiGatewayAccessLogsSplunkSubscriptionFilter", {
      destinationArn: splunkDeliveryStream.streamArn,
      filterPattern: "",
      logGroupName: logGroup.logGroupName,
      roleArn: splunkSubscriptionFilterRole.roleArn

    })

    const mtlsConfig: MTLSConfig | undefined = props.enableMutualTls ? {
      bucket: truststoreBucket,
      key: props.trustStoreKey,
      version: props.truststoreVersion
    } : undefined

    const apiGateway = new RestApi(this, "ApiGateway", {
      restApiName: `${props.stackName}-apigw`,
      domainName: {
        domainName: props.domainName,
        certificate: props.certificate,
        securityPolicy: SecurityPolicy.TLS_1_2,
        endpointType: EndpointType.REGIONAL,
        mtls: mtlsConfig
      },
      disableExecuteApiEndpoint: props.enableMutualTls,
      endpointConfiguration: {
        types: [EndpointType.REGIONAL]
      },
      deploy: true,
      deployOptions: {
        accessLogDestination: new LogGroupLogDestination(logGroup),
        accessLogFormat: accessLogFormat(),
        loggingLevel: MethodLoggingLevel.INFO,
        metricsEnabled: true
      }
    })

    const role = new Role(this, "ApiGatewayRole", {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
      managedPolicies: []
    })

    new ARecord(this, "ARecord", {
      recordName: props.stackName,
      target: RecordTarget.fromAlias(new ApiGatewayTarget(apiGateway)),
      zone: props.hostedZone
    })

    const cfnStage = apiGateway.deploymentStage.node.defaultChild as CfnStage
    cfnStage.cfnOptions.metadata = {
      guard: {
        SuppressedRules: [
          "API_GW_CACHE_ENABLED_AND_ENCRYPTED"
        ]
      }
    }

    // Outputs
    this.api = apiGateway
    this.role = role
  }
}
