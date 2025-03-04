#!/usr/bin/env bash
set -e

# script used to set context key values in cdk.json pre deployment from environment variables

# helper function to set string values
fix_string_key() {
    KEY_NAME=$1
    KEY_VALUE=$2
    if [ -z "${KEY_VALUE}" ]; then
        echo "${KEY_NAME} value is unset or set to the empty string"
        exit 1
    fi
    echo "Setting ${KEY_NAME}"
    jq \
        --arg key_value "${KEY_VALUE}" \
        --arg key_name "${KEY_NAME}" \
        '.context += {($key_name): $key_value}' .build/cdk.json > .build/cdk.new.json
    mv .build/cdk.new.json .build/cdk.json
}

# helper function to set boolean and number values (without quotes)
fix_boolean_number_key() {
    KEY_NAME=$1
    KEY_VALUE=$2
    if [ -z "${KEY_VALUE}" ]; then
        echo "${KEY_NAME} value is unset or set to the empty string"
        exit 1
    fi
    echo "Setting ${KEY_NAME}"
    jq \
        --argjson key_value "${KEY_VALUE}" \
        --arg key_name "${KEY_NAME}" \
        '.context += {($key_name): $key_value}' .build/cdk.json > .build/cdk.new.json
    mv .build/cdk.new.json .build/cdk.json
}

# get some values from AWS
TRUSTSTORE_BUCKET_ARN=$(aws cloudformation describe-stacks --stack-name account-resources --query "Stacks[0].Outputs[?OutputKey=='TrustStoreBucket'].OutputValue" --output text)
TRUSTSTORE_BUCKET_NAME=$(echo "${TRUSTSTORE_BUCKET_ARN}" | cut -d ":" -f 6)
TRUSTSTORE_VERSION=$(aws s3api list-object-versions --bucket "${TRUSTSTORE_BUCKET_NAME}" --prefix "${TRUSTSTORE_FILE}" --query 'Versions[?IsLatest].[VersionId]' --output text)

# go through all the key values we need to set
fix_string_key accountId "${ACCOUNT_ID}"
fix_string_key stackName "${STACK_NAME}"
fix_string_key versionNumber "${VERSION_NUMBER}"
fix_string_key commitId "${COMMIT_ID}"
fix_string_key logRetentionInDays "${LOG_RETENTION_IN_DAYS}"
fix_string_key logLevel "${LOG_LEVEL}"
fix_string_key targetSpineServer "${TARGET_SPINE_SERVER}"
fix_boolean_number_key enableMutualTls "${ENABLE_MUTUAL_TLS}"
fix_string_key trustStoreFile "${TRUSTSTORE_FILE}"
fix_string_key trustStoreVersion "${TRUSTSTORE_VERSION}"
