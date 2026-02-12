import {deleteUnusedPrStacks} from "@nhsdigital/eps-cdk-constructs"

deleteUnusedPrStacks(
  "cpt-api",
  "electronic-prescription-service-clinical-prescription-tracker",
  "dev.eps.national.nhs.uk."
).catch((error) => {
  console.error(error)
  process.exit(1)
})
