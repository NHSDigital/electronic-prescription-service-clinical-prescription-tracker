import {
  calculateVersionedStackName,
  createApp,
  getBooleanConfigFromEnvVar,
  getConfigFromEnvVar,
  getNumberConfigFromEnvVar
} from "@nhsdigital/eps-cdk-constructs"
import {CptsApiStack} from "../stacks/CptsApiStack"

async function main() {
  const {app, props} = createApp({
    productName: "Prescription Tracker API",
    appName: "CptsApiApp",
    repoName: "electronic-prescription-service-clinical-prescription-tracker",
    driftDetectionGroup: "cpt-api"
  })

  new CptsApiStack(app, "CptsApiStack", {
    ...props,
    stackName: calculateVersionedStackName(getConfigFromEnvVar("stackName"), props),
    logRetentionInDays: getNumberConfigFromEnvVar("logRetentionInDays"),
    logLevel: getConfigFromEnvVar("logLevel"),
    targetSpineServer: getConfigFromEnvVar("targetSpineServer"),
    mutualTlsTrustStoreKey: props.isPullRequest ? undefined : getConfigFromEnvVar("trustStoreFile"),
    csocApiGatewayDestination: "arn:aws:logs:eu-west-2:693466633220:destination:api_gateway_log_destination", // CSOC API GW log destination - do not change
    forwardCsocLogs: getBooleanConfigFromEnvVar("forwardCsocLogs")
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
