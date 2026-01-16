import {deployApi, getBooleanConfigFromEnvVar, getConfigFromEnvVar} from "@nhsdigital/eps-deployment-utils"
import * as fs from "fs"

const apigeeEnvironment = getConfigFromEnvVar("APIGEE_ENVIRONMENT")
let clientCertExportName = "ClinicalTrackerClientCertSecret"
let clientPrivateKeyExportName = "ClinicalTrackerClientKeySecret"
if (apigeeEnvironment.includes("sandbox")) {
  clientCertExportName = "ClinicalTrackerClientSandboxCertSecret"
  clientPrivateKeyExportName = "ClinicalTrackerClientSandboxKeySecret"
}
const spec = JSON.parse(fs.readFileSync(
  "./packages/specification/dist/eps-clinical-prescription-tracker-api.resolved.json",
  "utf8"
))
deployApi(
  {
    spec,
    apiName: "clinical-prescription-tracker",
    version: getConfigFromEnvVar("VERSION_NUMBER"),
    apigeeEnvironment,
    isPullRequest: getBooleanConfigFromEnvVar("IS_PULL_REQUEST"),
    awsEnvironment: getConfigFromEnvVar("AWS_ENVIRONMENT"),
    stackName: getConfigFromEnvVar("STACK_NAME"),
    mtlsSecretName: "clinical-tracker-mtls-1",
    clientCertExportName,
    clientPrivateKeyExportName,
    proxygenPrivateKeyExportName: "ClinicalTrackerProxygenPrivateKey",
    proxygenKid: "eps-clinical-tracker",
    hiddenPaths: []
  },
  true,
  false
).catch((err) => {
  console.error("Error in deployment script:", err)
  process.exit(1)
})
