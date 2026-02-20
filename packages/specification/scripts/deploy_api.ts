import {deployApi, getBooleanConfigFromEnvVar, getConfigFromEnvVar} from "@nhsdigital/eps-deployment-utils"
import * as fs from "fs"

async function main() {
  const apigeeEnvironment = getConfigFromEnvVar("APIGEE_ENVIRONMENT")
  const specFilePath = "./dist/eps-clinical-prescription-tracker-api.resolved.json"
  const spec = JSON.parse(fs.readFileSync(specFilePath, "utf8"))
  const clientCert = fs.readFileSync("/tmp/proxygen/client_cert", "utf8")
  const clientPrivateKey = fs.readFileSync("/tmp/proxygen/client_private_key", "utf8")
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
        clientCert,
        clientPrivateKey,
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
