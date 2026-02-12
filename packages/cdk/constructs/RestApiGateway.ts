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
import {
  IManagedPolicy,
  IRole,
  Role,
  ServicePrincipal
} from "aws-cdk-lib/aws-iam"
import {Stream} from "aws-cdk-lib/aws-kinesis"
import {Key} from "aws-cdk-lib/aws-kms"
import {CfnSubscriptionFilter, LogGroup} from "aws-cdk-lib/aws-logs"
import {Construct} from "constructs"
import {accessLogFormat} from "./RestApiGateway/accessLogFormat"
import {Certificate, CertificateValidation} from "aws-cdk-lib/aws-certificatemanager"
import {Bucket} from "aws-cdk-lib/aws-s3"
import {ARecord, HostedZone, RecordTarget} from "aws-cdk-lib/aws-route53"
import {ApiGateway as ApiGatewayTarget} from "aws-cdk-lib/aws-route53-targets"

export interface RestApiGatewayProps {
  readonly stackName: string
  readonly logRetentionInDays: number
  readonly mutualTlsConfig: {
    key: string
    version: string
  } | undefined
  readonly forwardCsocLogs: boolean
  readonly csocApiGatewayDestination: string
  readonly executionPolicies: Array<IManagedPolicy>
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

    const epsDomainName: string = Fn.importValue("eps-route53-resources:EPS-domain")
    const hostedZone = HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      hostedZoneId: Fn.importValue("eps-route53-resources:EPS-ZoneID"),
      zoneName: epsDomainName
    })
    const serviceDomainName = `${props.stackName}.${epsDomainName}`

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

    if (props.forwardCsocLogs) {
      new CfnSubscriptionFilter(this, "ApiGatewayAccessLogsCSOCSubscriptionFilter", {
        destinationArn: props.csocApiGatewayDestination,
        filterPattern: "",
        logGroupName: logGroup.logGroupName,
        roleArn: splunkSubscriptionFilterRole.roleArn
      })
    }

    const certificate = new Certificate(this, "Certificate", {
      domainName: serviceDomainName,
      validation: CertificateValidation.fromDns(hostedZone)
    })

    const mtlsConfig: MTLSConfig | undefined = props.mutualTlsConfig ? {
      bucket: truststoreBucket,
      key: props.mutualTlsConfig.key,
      version: props.mutualTlsConfig.version
    } : undefined

    const apiGateway = new RestApi(this, "ApiGateway", {
      restApiName: `${props.stackName}-apigw`,
      domainName: {
        domainName: serviceDomainName,
        certificate: certificate,
        securityPolicy: SecurityPolicy.TLS_1_2,
        endpointType: EndpointType.REGIONAL,
        mtls: mtlsConfig
      },
      disableExecuteApiEndpoint: props.mutualTlsConfig ? true : false,
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
      managedPolicies: props.executionPolicies
    }).withoutPolicyUpdates()

    new ARecord(this, "ARecord", {
      recordName: props.stackName,
      target: RecordTarget.fromAlias(new ApiGatewayTarget(apiGateway)),
      zone: hostedZone
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
