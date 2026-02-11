import {createApp} from "@nhsdigital/eps-cdk-constructs"
import {CptsApiSandboxStack} from "../stacks/CptsApiSandboxStack"

const {app, props} = createApp({
  productName: "Prescription Tracker API",
  appName: "CptsApiSandboxApp",
  repoName: "electronic-prescription-service-clinical-prescription-tracker",
  driftDetectionGroup: "cpt-api"
})

new CptsApiSandboxStack(app, "CptsApiSandboxStack", props)
