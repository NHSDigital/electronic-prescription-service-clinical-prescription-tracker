import {deployApi, getBooleanConfigFromEnvVar, getConfigFromEnvVar} from "@nhsdigital/eps-deployment-utils"
import * as fs from "fs"

async function main() {
  const apigeeEnvironment = getConfigFromEnvVar("APIGEE_ENVIRONMENT")
  let clientCertExportName = "ClinicalTrackerClientCertSecret"
  let clientPrivateKeyExportName = "ClinicalTrackerClientKeySecret"
  if (apigeeEnvironment.includes("sandbox")) {
    clientCertExportName = "ClinicalTrackerClientSandboxCertSecret"
    clientPrivateKeyExportName = "ClinicalTrackerClientSandboxKeySecret"
  }
  const specFilePath = "./dist/eps-clinical-prescription-tracker-api.resolved.json"
  const spec = JSON.parse(fs.readFileSync(specFilePath, "utf8"))
  try {
    await deployApi(
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
    )
  } finally {
    fs.writeFileSync(specFilePath, JSON.stringify(spec))
  }
}

main().catch((err) => {
  console.error("Error in deployment script:", err)
  process.exit(1)
})
