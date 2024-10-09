#!/usr/bin/env bash

# Generic script for removing proxygen deployed APIs where the pull request is closed

# Set the repo name to be the name of the repo this is running in
REPO_NAME=electronic-prescription-service-clinical-prescription-tracker

# Main function to delete relevant proxygen deployments
main() {
  echo "Checking clinical tracker deployments"
  PULL_REQUEST_PROXYGEN_REGEX=clinical-prescription-tracker-pr-
  delete_apigee_deployments "internal-dev" "clinical-prescription-tracker" "ClinicalTrackerProxygenPrivateKey" "eps-clinical-tracker"
  delete_apigee_deployments "internal-dev-sandbox" "clinical-prescription-tracker" "ClinicalTrackerProxygenPrivateKey" "eps-clinical-tracker"
}

# Function to delete Apigee deployments
delete_apigee_deployments() {
  APIGEE_ENVIRONMENT=$1
  APIGEE_API=$2
  PROXYGEN_PRIVATE_KEY_NAME=$3
  PROXYGEN_KID=$4
  proxygen_private_key_arn=$(aws cloudformation list-exports --query "Exports[?Name=='account-resources:${PROXYGEN_PRIVATE_KEY_NAME}'].Value" --output text)

  echo
  echo "Checking Apigee deployments on ${APIGEE_ENVIRONMENT}"
  echo

  jq -n --arg apiName "${APIGEE_API}" \
        --arg environment "${APIGEE_ENVIRONMENT}" \
        --arg kid "${PROXYGEN_KID}" \
        --arg proxygenSecretName "${proxygen_private_key_arn}" \
        '{apiName: $apiName, environment: $environment, kid, $kid, proxygenSecretName: $proxygenSecretName}' > payload.json

  aws lambda invoke --function-name "lambda-resources-ProxygenPTLInstanceGet" --cli-binary-format raw-in-base64-out --payload file://payload.json out.json > response.json

  if eval "cat response.json | jq -e '.FunctionError' >/dev/null"; then
      echo 'Error calling lambda'
      cat out.json
      exit 1
  fi

  jq -r '.[].name' "out.json" | while read -r i; do
    echo "Checking if Apigee deployment $i has open pull request"
    PULL_REQUEST=${i//${PULL_REQUEST_PROXYGEN_REGEX}/}
    echo "Checking pull request ID ${PULL_REQUEST}"
    URL="https://api.github.com/repos/NHSDigital/${REPO_NAME}/pulls/${PULL_REQUEST}"
    RESPONSE=$(curl "${URL}" 2>/dev/null)
    STATE=$(echo "${RESPONSE}" | jq -r .state)
    if [ "$STATE" == "closed" ]; then
      echo "** Going to delete Apigee deployment $i as state is ${STATE} **"
      jq -n --arg apiName "${APIGEE_API}" \
            --arg environment "${APIGEE_ENVIRONMENT}" \
            --arg instance "${i}" \
            --arg kid "${PROXYGEN_KID}" \
            --arg proxygenSecretName "${proxygen_private_key_arn}" \
            '{apiName: $apiName, environment: $environment, kid, $kid, proxygenSecretName: $proxygenSecretName, instance: $instance}' > payload.json

      aws lambda invoke --function-name "lambda-resources-ProxygenPTLInstanceDelete" --cli-binary-format raw-in-base64-out --payload file://payload.json out.txt > response.json
      if eval "cat response.json | jq -e '.FunctionError' >/dev/null"; then
          echo 'Error calling lambda'
          cat out.txt
          exit 1
      fi

    else
      echo "Not going to delete Apigee deployment $i as state is ${STATE}"
    fi
  done
}

main
