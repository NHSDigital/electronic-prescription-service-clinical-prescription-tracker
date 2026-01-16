/* eslint-disable max-len */
import {Stack} from "aws-cdk-lib"
import {NagPackSuppression, NagSuppressions} from "cdk-nag"

export const nagSuppressions = (stack: Stack) => {
  safeAddNagSuppressionGroup(
    stack,
    [
      "/CptsApiStack/Functions/PrescriptionSearchLambda/LambdaPutLogsManagedPolicy/Resource",
      "/CptsApiStack/Functions/ClinicalViewLambda/LambdaPutLogsManagedPolicy/Resource",
      "/CptsApiStack/Functions/StatusLambda/LambdaPutLogsManagedPolicy/Resource",
      "/CptsApiStack/StateMachines/ClinicalViewStateMachine/StateMachinePutLogsManagedPolicy",
      "/CptsApiStack/StateMachines/ClinicalViewStateMachine/StateMachineRole/DefaultPolicy/Resource"
    ],
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error for not having wildcards in permissions. This is a fine as we need to have permissions on all log streams under path"
      }
    ]
  )
  safeAddNagSuppressionGroup(
    stack,
    [
      "/CptsApiStack/Functions/PrescriptionSearchLambda/cpt-matthew-popat-dev-PrescriptionSearch/Resource",
      "/CptsApiStack/Functions/ClinicalViewLambda/cpt-matthew-popat-dev-ClinicalView/Resource",
      "/CptsApiStack/Functions/StatusLambda/cpt-matthew-popat-dev-Status/Resource"
    ],
    [
      {
        id: "AwsSolutions-L1",
        reason: "We will update the runtime later"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/CptsApiStack/Apis/ApiGateway/ApiGateway/Resource",
    [
      {
        id: "AwsSolutions-APIG2",
        reason: "Suppress error for request validation not being enabled. Validation will be handled by the service logic."
      }
    ]
  )

  safeAddNagSuppressionGroup(
    stack,
    [
      "/CptsApiStack/Apis/ApiGateway/ApiGateway/Default/RequestGroup/GET/Resource",
      "/CptsApiStack/Apis/ApiGateway/ApiGateway/Default/RequestGroup/{prescriptionId}/GET/Resource",
      "/CptsApiStack/Apis/ApiGateway/ApiGateway/Default/_status/GET/Resource"
    ],
    [
      {
        id: "AwsSolutions-APIG4",
        reason: "Suppress error for not implementing authorization. Token endpoint should not have an authorizer"
      },
      {
        id: "AwsSolutions-COG4",
        reason: "Suppress error for not implementing a Cognito user pool authorizer. Token endpoint should not have an authorizer"
      }
    ]
  )
}

const safeAddNagSuppression = (stack: Stack, path: string, suppressions: Array<NagPackSuppression>) => {
  try {
    NagSuppressions.addResourceSuppressionsByPath(stack, path, suppressions)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    console.log(`Could not find path ${path}`)
  }
}

// Apply the same nag suppression to multiple resources
const safeAddNagSuppressionGroup = (stack: Stack, path: Array<string>, suppressions: Array<NagPackSuppression>) => {
  for (const p of path) {
    safeAddNagSuppression(stack, p, suppressions)
  }
}
