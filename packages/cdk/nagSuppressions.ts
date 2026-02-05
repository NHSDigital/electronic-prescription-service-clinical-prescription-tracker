/* eslint-disable max-len */
import {Stack} from "aws-cdk-lib"
import {safeAddNagSuppressionGroup, safeAddNagSuppression} from "@nhsdigital/eps-cdk-constructs"

export const nagSuppressions = (stack: Stack) => {
  safeAddNagSuppressionGroup(
    stack,
    [
      "/CptsApiStack/Functions/PrescriptionSearchLambda/LambdaPutLogsManagedPolicy/Resource",
      "/CptsApiStack/Functions/ClinicalViewLambda/LambdaPutLogsManagedPolicy/Resource",
      "/CptsApiStack/Functions/StatusLambda/LambdaPutLogsManagedPolicy/Resource",
      "/CptsApiStack/StateMachines/ClinicalViewStateMachine/StateMachinePutLogsManagedPolicy"
    ],
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error for not having wildcards in permissions. This is a fine as we need to have permissions on all log streams under path"
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
