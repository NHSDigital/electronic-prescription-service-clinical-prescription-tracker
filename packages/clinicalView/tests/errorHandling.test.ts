// import {Logger} from "@aws-lambda-powertools/logger"
// import {jest} from "@jest/globals"
// import {OperationOutcome} from "fhir/r4"
// import {clinicalViewError} from "../src/utils/types"
// import {generateFhirErrorResponse} from "../src/utils/errorHandling"

// const logger: Logger = new Logger({serviceName: "errorHandlingTest", logLevel: "DEBUG"})

// describe("Test generateFhirErrorResponse", () => {
//   it("returns a valid OperationOutcome for a single error", () => {
//     const errors: Array<clinicalViewError> = [
//       {
//         status: "404",
//         severity: "error",
//         description: "The requested resource was not found."
//       }
//     ]

//     const expectedOutcome: OperationOutcome = {
//       resourceType: "OperationOutcome",
//       meta: {
//         lastUpdated: expect.any(String) // Timestamp should be dynamically generated
//       },
//       issue: [
//         {
//           code: "not-found",
//           severity: "error",
//           diagnostics: "The requested resource was not found.",
//           details: {
//             coding: [
//               {
//                 system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
//                 code: "NOT_FOUND",
//                 display: "404: The Server was unable to find the specified resource."
//               }
//             ]
//           }
//         }
//       ]
//     }

//     const result = generateFhirErrorResponse(errors, logger)

//     expect(result).toMatchObject(expectedOutcome)
//   })

//   it("returns a valid OperationOutcome for multiple errors", () => {
//     const errors: Array<clinicalViewError> = [
//       {
//         status: "400",
//         severity: "error",
//         description: "Invalid request format."
//       },
//       {
//         status: "500",
//         severity: "fatal",
//         description: "Unexpected server error."
//       }
//     ]

//     const expectedOutcome: OperationOutcome = {
//       resourceType: "OperationOutcome",
//       meta: {
//         lastUpdated: expect.any(String)
//       },
//       issue: [
//         {
//           code: "value",
//           severity: "error",
//           diagnostics: "Invalid request format.",
//           details: {
//             coding: [
//               {
//                 system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
//                 code: "BAD_REQUEST",
//                 display: "400: The Server was unable to process the request."
//               }
//             ]
//           }
//         },
//         {
//           code: "exception",
//           severity: "fatal",
//           diagnostics: "Unexpected server error.",
//           details: {
//             coding: [
//               {
//                 system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
//                 code: "SERVER_ERROR",
//                 display: "500: The Server has encountered an error processing the request."
//               }
//             ]
//           }
//         }
//       ]
//     }

//     const result = generateFhirErrorResponse(errors, logger)

//     expect(result).toMatchObject(expectedOutcome)
//   })

//   it("handles an empty error array gracefully", () => {
//     const errors: Array<clinicalViewError> = []

//     const expectedOutcome: OperationOutcome = {
//       resourceType: "OperationOutcome",
//       meta: {
//         lastUpdated: expect.any(String)
//       },
//       issue: []
//     }

//     const result = generateFhirErrorResponse(errors, logger)

//     expect(result).toMatchObject(expectedOutcome)
//   })

//   it("logs messages while generating OperationOutcome", () => {
//     const errors: Array<clinicalViewError> = [
//       {
//         status: "403",
//         severity: "error",
//         description: "Forbidden access."
//       }
//     ]

//     const loggerSpy = jest.spyOn(logger, "info")

//     generateFhirErrorResponse(errors, logger)

//     expect(loggerSpy).toHaveBeenCalledWith("Generating the OperationOutcome wrapper...")
//     expect(loggerSpy).toHaveBeenCalledWith("Generating Issue for error...")
//   })
// })
