import {deleteUnusedPrStacks} from "@nhsdigital/eps-cdk-constructs"

deleteUnusedPrStacks(
  "cpt",
  "electronic-prescription-service-clinical-prescription-tracker",
  "dev.eps.national.nhs.uk."
).catch((error) => {
  console.error(error)
  process.exit(1)
})
