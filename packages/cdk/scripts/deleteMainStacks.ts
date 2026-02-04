import {deleteUnusedMainStacks, getActiveApiVersions} from "@nhsdigital/eps-cdk-constructs"

deleteUnusedMainStacks(
  "cpt",
  () => getActiveApiVersions("clinical-prescription-tracker"),
  "dev.eps.national.nhs.uk."
).catch((error) => {
  console.error(error)
  process.exit(1)
})
