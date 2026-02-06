import {deleteUnusedMainStacks, getActiveApiVersions, getConfigFromEnvVar} from "@nhsdigital/eps-cdk-constructs"

const awsEnvironment = getConfigFromEnvVar("AWS_ENVIRONMENT", "")
deleteUnusedMainStacks(
  "cpt",
  () => getActiveApiVersions("clinical-prescription-tracker"),
  `${awsEnvironment}.eps.national.nhs.uk.`
).catch((error) => {
  console.error(error)
  process.exit(1)
})
