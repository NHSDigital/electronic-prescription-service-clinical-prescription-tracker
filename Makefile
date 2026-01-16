SHELL = /bin/bash
.SHELLFLAGS = -o pipefail -c
export CDK_CONFIG_stackName=${stack_name}
export CDK_CONFIG_versionNumber=undefined
export CDK_CONFIG_commitId=undefined
export CDK_CONFIG_isPullRequest=true # Turns off mTLS and drift detection when true
export CDK_CONFIG_logRetentionInDays=30
export CDK_CONFIG_logLevel=DEBUG
export CDK_CONFIG_targetSpineServer=https://example.org
export CDK_CONFIG_forwardCsocLogs=false

guard-%:
	@ if [ "${${*}}" = "" ]; then \
		echo "Environment variable $* not set"; \
		exit 1; \
	fi

.PHONY: install build test publish release clean

install: install-python install-hooks install-node

install-node:
	npm ci

install-python:
	poetry install

install-hooks: install-python
	poetry run pre-commit install --install-hooks --overwrite

compile: compile-node compile-packages compile-specification

compile-node:
	npm run compile --workspace packages/common/commonTypes
	npm run compile --workspace packages/common/commonUtils
	npx tsc --build tsconfig.build.json

compile-packages:
	npm run compile --workspace packages/clinicalView
	npm run compile --workspace packages/prescriptionSearch

compile-specification:
	npm run resolve --workspace packages/specification

download-get-secrets-layer:
	mkdir -p packages/getSecretLayer/lib
	curl -LJ https://github.com/NHSDigital/electronic-prescription-service-get-secrets/releases/download/$$(curl -s "https://api.github.com/repos/NHSDigital/electronic-prescription-service-get-secrets/releases/latest" | jq -r .tag_name)/get-secrets-layer.zip -o packages/getSecretLayer/lib/get-secrets-layer.zip

sbom:
	mkdir -p ~/git_actions
	git -C ~/git_actions/eps-actions-sbom/ pull || git clone https://github.com/NHSDigital/eps-action-sbom.git ~/git_actions/eps-actions-sbom/
	docker build -t eps-sbom -f ~/git_actions/eps-actions-sbom/Dockerfile ~/git_actions/eps-actions-sbom/
	docker run -it --rm -v $${LOCAL_WORKSPACE_FOLDER:-.}:/github/workspace eps-sbom

lint: lint-node lint-python lint-githubactions lint-githubaction-scripts lint-specification

lint-node: compile
	npm run lint --workspace packages/cdk
	npm run lint --workspace packages/clinicalView
	npm run lint --workspace packages/common/commonTypes
	npm run lint --workspace packages/common/testing
	npm run lint --workspace packages/common/commonUtils
	npm run lint --workspace packages/prescriptionSearch
	npm run lint --workspace packages/sandbox
	npm run lint --workspace packages/status

lint-python:
#	poetry run flake8 scripts/*.py --config .flake8

lint-githubactions:
	actionlint

lint-githubaction-scripts:
	shellcheck .github/scripts/*.sh

lint-specification: compile-specification
	npm run lint --workspace packages/specification

test: compile
	npm run test --workspace packages/cdk
	npm run test --workspace packages/clinicalView
	npm run test --workspace packages/common/commonUtils
	npm run test --workspace packages/prescriptionSearch
	npm run test --workspace packages/sandbox
	npm run test --workspace packages/status

clean:
	rm -rf packages/cdk/coverage
	rm -rf packages/cdk/lib
	rm -rf packages/clinicalView/coverage
	rm -rf packages/clinicalView/lib
	rm -rf packages/common/commonTypes/coverage
	rm -rf packages/common/commonTypes/lib
	rm -rf packages/common/testing/coverage
	rm -rf packages/common/testing/lib
	rm -rf packages/common/commonUtils/coverage
	rm -rf packages/common/commonUtils/lib
	rm -rf packages/prescriptionSearch/coverage
	rm -rf packages/prescriptionSearch/lib
	rm -rf packages/sandbox/coverage
	rm -rf packages/sandbox/lib
	rm -rf packages/specification/coverage
	rm -rf packages/specification/lib
	rm -rf packages/status/coverage
	rm -rf packages/status/lib
	rm -rf cdk.out

deep-clean: clean
	rm -rf .venv
	find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +

check-licenses: check-licenses-node check-licenses-python

check-licenses-node:
	npm run check-licenses
	npm run check-licenses --workspace packages/cdk
	npm run check-licenses --workspace packages/clinicalView
	npm run check-licenses --workspace packages/common/commonTypes
	npm run check-licenses --workspace packages/common/commonUtils
	npm run check-licenses --workspace packages/prescriptionSearch
	npm run check-licenses --workspace packages/sandbox
	npm run check-licenses --workspace packages/status


check-licenses-python:
	scripts/check_python_licenses.sh

aws-configure:
	aws configure sso --region eu-west-2

aws-login:
	aws sso login --sso-session sso-session

cfn-guard:
	./scripts/run_cfn_guard.sh

cdk-deploy:
	REQUIRE_APPROVAL="$${REQUIRE_APPROVAL:-any-change}" && \
	npx cdk deploy \
		--app "npx tsx packages/cdk/bin/CptsApiApp.ts" \
		--all \
		--ci true \
		--require-approval $${REQUIRE_APPROVAL}

cdk-synth: download-get-secrets-layer
	CDK_CONFIG_stackName=cpt \
	npx cdk synth \
		--quiet \
		--app "npx tsx packages/cdk/bin/CptsApiApp.ts"

cdk-diff:
	npx cdk diff --app "npx tsx packages/cdk/bin/CptsApiApp.ts"

cdk-watch:
	REQUIRE_APPROVAL="$${REQUIRE_APPROVAL:-any-change}" && \
	npx cdk deploy \
		--app "npx tsx packages/cdk/bin/CptsApiApp.ts" \
		--watch \
		--all \
		--ci true \
		--require-approval $${REQUIRE_APPROVAL}

create-npmrc:
	gh auth login --scopes "read:packages"; \
	echo "//npm.pkg.github.com/:_authToken=$$(gh auth token)" > .npmrc
	echo "@nhsdigital:registry=https://npm.pkg.github.com" >> .npmrc
