# Electronic Prescription Service Clinical Prescription Tracker

![Build](https://github.com/NHSDigital/electronic-prescription-service-clinical-prescription-tracker/workflows/release/badge.svg?branch=main)

This is the AWS layer that provides an API for Clinical Prescription Tracker.

- `packages/clinicalView` Calls the Clinical View Spine interaction.
- `packages/common/testing` Module that contains some test data used for tests in other modules.
- `packages/prescriptionSearch` Calls the Prescription Search interaction.
- `packages/sandbox/` Returns [static data](./packages/sandbox/examples/GetMyPrescriptions/Bundle/success.json) from the Sandbox.
- `packages/specification/` This [Open API Specification](https://swagger.io/docs/specification/about/) describes the endpoints, methods and messages.
- `packages/status/` Returns the status of the getMyPrescriptions endpoint.
- `packages/cdk` Contains the CDK AWS resource definitions
- `scripts/` Utilities helpful to developers of this specification.
- `.devcontainer` Contains a dockerfile and vscode devcontainer definition.
- `.github` Contains github workflows that are used for building and deploying from pull requests and releases.
- `.vscode` Contains vscode workspace file.

Consumers of the API will find developer documentation on the [NHS Digital Developer Hub](https://digital.nhs.uk/developer/api-catalogue).

## Contributing

Contributions to this project are welcome from anyone, providing that they conform to the [guidelines for contribution](https://github.com/NHSDigital//electronic-prescription-service-clinical-prescription-tracker/blob/main/CONTRIBUTING.md) and the [community code of conduct](https://github.com/NHSDigital//electronic-prescription-service-clinical-prescription-tracker/blob/main/CODE_OF_CONDUCT.md).

### Licensing

This code is dual licensed under the MIT license and the OGL (Open Government License). Any new work added to this repository must conform to the conditions of these licenses. In particular this means that this project may not depend on GPL-licensed or AGPL-licensed libraries, as these would violate the terms of those libraries' licenses.

The contents of this repository are protected by Crown Copyright (C).

## Development

It is recommended that you use visual studio code and a devcontainer as this will install all necessary components and correct versions of tools and languages.  
See https://code.visualstudio.com/docs/devcontainers/containers for details on how to set this up on your host machine.  
There is also a workspace file in .vscode that should be opened once you have started the devcontainer. The workspace file can also be opened outside of a devcontainer if you wish.  
The project uses [CDK](https://docs.aws.amazon.com/cdk/) to develop and deploy the APIs and associated resources.

All commits must be made using [signed commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)

Once the steps at the link above have been completed. Add to your ~/.gnupg/gpg.conf as below:

```
use-agent
pinentry-mode loopback
```

and to your ~/.gnupg/gpg-agent.conf as below:

```
allow-loopback-pinentry
```

As described here:
https://stackoverflow.com/a/59170001

You will need to create the files, if they do not already exist.
This will ensure that your VSCode bash terminal prompts you for your GPG key password.

You can cache the gpg key passphrase by following instructions at https://superuser.com/questions/624343/keep-gnupg-credentials-cached-for-entire-user-session

### Setup

Ensure you have the following lines in the file .envrc

```
export AWS_DEFAULT_PROFILE=prescription-dev
export stack_name=<UNIQUE_NAME_FOR_YOU>
export TARGET_SPINE_SERVER=<NAME OF DEV TARGET SPINE SERVER>
export TARGET_SERVICE_SEARCH_SERVER=<NAME OF DEV TARGET SERVICE SEARCH SERVER>
```

UNIQUE_NAME_FOR_YOU should be a unique name for you with no underscores in it - eg anthony-brown-1

Once you have saved .envrc, start a new terminal in vscode and run this command to authenticate against AWS

```
make aws-configure
```

Put the following values in:

```
SSO session name (Recommended): sso-session
SSO start URL [None]: <USE VALUE OF SSO START URL FROM AWS LOGIN COMMAND LINE ACCESS INSTRUCTIONS ACCESSED FROM https://myapps.microsoft.com>
SSO region [None]: eu-west-2
SSO registration scopes [sso:account:access]:
```

This will then open a browser window and you should authenticate with your hscic credentials
You should then select the development account and set default region to be eu-west-2.

You will now be able to use AWS CLI commands to access the dev account. You can also use the AWS extension to view resources.

When the token expires, you may need to reauthorise using `make aws-login`

### CI Setup

The GitHub Actions require a secret to exist on the repo called "SONAR_TOKEN".
This can be obtained from [SonarCloud](https://sonarcloud.io/)
as described [here](https://docs.sonarsource.com/sonarqube/latest/user-guide/user-account/generating-and-using-tokens/).
You will need the "Execute Analysis" permission for the project (NHSDigital_electronic-prescription-service-clinical-prescription-tracker) in order for the token to work.

### GitHub Packages Setup

To work with the GitHub Package Registry, you need to authenticate with github. This can be done by running `make create-npmrc`

### Continuous deployment for testing
TBC for cdk

### Pre-commit hooks

Some pre-commit hooks are installed as part of the install above, to run basic lint checks and ensure you can't accidentally commit invalid changes.
The pre-commit hook uses python package pre-commit and is configured in the file .pre-commit-config.yaml.
A combination of these checks are also run in CI.

### Make commands

There are `make` commands that are run as part of the CI pipeline and help alias some functionality during development.

#### install targets

- `install-node` Installs node dependencies.
- `install-python` Installs python dependencies.
- `install-hooks` Installs git pre commit hooks.
- `install` Runs all install targets.
- `create-npmrc` Authenticates to github and creates a local .npmrc file to allows downloading of packages from github

#### CDK targets
These are used to do common commands related to cdk

- `cdk-deploy` Builds and deploys the code to AWS
- `cdk-synth` Converts the CDK code to cloudformation templates
- `cdk-diff` Runs cdk diff comparing the deployed stack with local CDK code to see differences
- `cdk-watch` Syncs the code and CDK templates to AWS. This keeps running and automatically uploads changes to AWS
- `build-deployment-container-image` Creates a container with all code necessary to run cdk deploy

#### Download secrets

- `download-get-secrets-layer` Creates the necessary directory structure and downloads the `get-secrets-layer.zip` artifact from NHSDigital's `electronic-prescription-service-get-secrets` releases.

#### Clean and deep-clean targets

- `clean` Clears up any files that have been generated by building or testing locally.
- `deep-clean` Runs clean target and also removes any node_modules and python libraries installed locally.

#### Linting and testing

- `lint` Runs lint for all code.
- `lint-node` Runs lint for node code including cdk.
- `lint-githubactions` lints the repos github actions
- `lint-specification` lints the API specification
- `test` Runs unit tests for all code.

#### Compiling

- `compile` Compiles all code.
- `compile-node` Runs TypeScript compiler (tsc) for the project.
- `compile-packages` Compiles specific packages.
- `compile-specification` Compiles the OpenAPI specification files.

#### CLI Login to AWS

- `aws-configure` Configures a connection to AWS.
- `aws-login` Reconnects to AWS from a previously configured connection.

### Github folder

This .github folder contains workflows and templates related to GitHub, along with actions and scripts pertaining to Jira.

- `pull_request_template.yml` Template for pull requests.
- `dependabot.yml` Dependabot definition file.

Actions are in the `.github/actions` folder:

- `mark_jira_released` Action to mark Jira issues as released.
- `update_confluence_jira` Action to update Confluence with Jira issues.

Scripts are in the `.github/scripts` folder:

- `call_mark_jira_released.sh` Calls a Lambda function to mark Jira issues as released.
- `create_env_release_notes.sh` Generates release notes for a specific environment using a Lambda function.
- `create_int_rc_release_notes.sh` Creates release notes for integration environment using a Lambda function.
- `delete_stacks.sh` Checks and deletes active CloudFormation stacks associated with closed pull requests.
- `get_current_dev_tag.sh` Retrieves the current development tag and sets it as an environment variable.
- `get_target_deployed_tag.sh` Retrieves the currently deployed tag and sets it as an environment variable.

Workflows are in the `.github/workflows` folder:

- `combine-dependabot-prs.yml` Workflow for combining dependabot pull requests. Runs on demand.
- `delete_old_cloudformation_stacks.yml` Workflow for deleting old cloud formation stacks. Runs daily.
- `dependabot_auto_approve_and_merge.yml` Workflow to auto merge dependabot updates.
- `pr-link.yaml` This workflow template links Pull Requests to Jira tickets and runs when a pull request is opened.
- `pull_request.yml` Called when pull request is opened or updated. Calls run_package_code_and_api and run_release_code_and_api to build and deploy the code. Deploys to dev AWS account and internal-dev and internal-dev sandbox apigee environments. The main stack deployed adopts the naming convention clinical-tracker-pr-<PULL_REQUEST_ID>, while the sandbox stack follows the pattern 
- `release.yml` Runs on demand to create a release and deploy to all environments.
- `cdk_package_code.yml` Packages code into a docker image and uploads to a github artifact for later deployment.
- `cdk_release_code.yml` Release code built by cdk_package_code.yml to an environment.
