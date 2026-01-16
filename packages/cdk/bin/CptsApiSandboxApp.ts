import {createApp} from "@nhsdigital/eps-cdk-constructs"
import {CptsApiSandboxStack} from "../stacks/CptsApiSandboxStack"

const {app, props} = createApp(
  "CptsApiSandboxApp",
  "electronic-prescription-service-clinical-prescription-tracker",
  "cpt-api"
)

new CptsApiSandboxStack(app, "CptsApiSandboxStack", props)
