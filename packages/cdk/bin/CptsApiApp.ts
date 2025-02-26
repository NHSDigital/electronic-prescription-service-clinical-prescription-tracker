import {App, Aspects, Tags} from "aws-cdk-lib"
import {AwsSolutionsChecks} from "cdk-nag"
import {CptsApiStack} from "../stacks/CptsApiStack"

const app = new App()

/* Required Context:
  - stackName
  - version
  - commit
  - logRetentionInDays
  - logLevel
  - targetSpineServer
  - enableMutalTls
  - truststoreVersion
*/

const accountId = app.node.tryGetContext("accountId")
const stackName = app.node.tryGetContext("stackName")
const version = app.node.tryGetContext("VERSION_NUMBER")
const commit = app.node.tryGetContext("COMMIT_ID")

Aspects.of(app).add(new AwsSolutionsChecks({verbose: true}))

Tags.of(app).add("accountId", accountId)
Tags.of(app).add("stackName", stackName)
Tags.of(app).add("version", version)
Tags.of(app).add("commit", commit)
Tags.of(app).add("cdkApp", "CptsApiApp")

new CptsApiStack(app, "CptsApiStack", {
  env: {
    region: "eu-west-2",
    account: accountId
  },
  stackName: stackName,
  version: version,
  commitId: commit
})
