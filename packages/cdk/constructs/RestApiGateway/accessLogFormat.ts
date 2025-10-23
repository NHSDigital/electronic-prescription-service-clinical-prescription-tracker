import {AccessLogFormat} from "aws-cdk-lib/aws-apigateway"

export const accessLogFormat = () => {
  return AccessLogFormat.custom(JSON.stringify({
    requestId: "$context.requestId",
    ip: "$context.identity.sourceIp",
    caller: "$context.identity.caller",
    user: "$context.identity.user",
    requestTime: "$context.requestTime",
    httpMethod: "$context.httpMethod",
    resourcePath: "$context.resourcePath",
    status: "$context.status",
    protocol: "$context.protocol",
    responseLength: "$context.responseLength",
    accountId: "$context.accountId",
    apiId: "$context.apiId",
    stage: "$context.stage",
    api_key: "$context.identity.apiKey",
    identity: {
      sourceIp: "$context.identity.sourceIp",
      userAgent: "$context.identity.userAgent",
      clientCert: {
        subjectDN: "$context.identity.clientCert.subjectDN",
        issuerDN: "$context.identity.clientCert.issuerDN",
        serialNumber: "$context.identity.clientCert.serialNumber",
        validityNotBefore: "$context.identity.clientCert.validity.notBefore",
        validityNotAfter: "$context.identity.clientCert.validity.notAfter"
      }
    },
    integration:{
      error: "$context.integration.error",
      integrationStatus: "$context.integration.integrationStatus",
      latency: "$context.integration.latency",
      requestId: "$context.integration.requestId",
      status: "$context.integration.status"
    }
  }))
}
