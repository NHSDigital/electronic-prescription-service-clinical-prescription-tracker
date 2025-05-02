
// import {describe, it, expect} from "@jest/globals"
// import {Logger} from "@aws-lambda-powertools/logger"
// import {generateFhirResponse} from "../src/utils/generateFhirResponse"
// import {Prescription} from "../src/utils/types"
// import {Patient} from "fhir/r4"

// const logger = new Logger({serviceName: "clinicalView"})

// // Mock parsed response for testing
// const mockParsedResponse: Prescription = {
//   patientDetails: {
//     nhsNumber: "9449304130",
//     prefix: "MS",
//     given: "STACEY",
//     family: "TWITCHETT",
//     suffix: "",
//     birthDate: "1948-04-30",
//     gender: 2
//   },
//   requestGroupDetails: {
//     prescriptionId: "9AD427-A83008-2E461K",
//     prescriptionTreatmentType: "0001",
//     prescriptionType: "0101",
//     signedTime: "20250226044948",
//     prescriptionTime: "20250226000000",
//     prescriptionStatus: "0001",
//     instanceNumber: 1,
//     maxRepeats: 5,
//     daysSupply: 28,
//     nominatedPerformer: "VNE51",
//     prescribingOrganization: "A83008"
//   },
//   productLineItems: [
//     {
//       order: 1,
//       medicationName: "Amoxicillin 250mg capsules",
//       quantity: "20",
//       dosageInstructions: "2 times a day for 10 days"
//     }
//   ],
//   filteredHistory: [
//     {
//       SCN: 2,
//       sentDateTime: "20240213105241",
//       fromStatus: "False",
//       toStatus: "0001",
//       message: "Prescription upload successful",
//       agentPersonOrgCode: "A83008",
//       lineStatusChangeDict: {
//         line: [
//           {
//             order: 1,
//             id: "DAD23C1F-71A4-473A-9273-C83C8BFC5F64",
//             status: "",
//             fromStatus: "0005",
//             toStatus: "0005",
//             cancellationReason: "Clinical grounds"
//           },
//           {
//             order: 2,
//             id: "9F737A38-F80C-4AD0-96FC-CB5A796D254B",
//             status: "",
//             fromStatus: "0008",
//             toStatus: "0001"
//           },
//           {
//             order: 3,
//             id: "FDB4258F-BB6B-4217-A001-382BD4035123",
//             status: "",
//             fromStatus: "0007",
//             toStatus: "0008"
//           }
//         ]
//       }
//     },
//     {
//       SCN: 3,
//       sentDateTime: "20240213105241",
//       fromStatus: "0001",
//       toStatus: "0002",
//       message: "Release Request successful",
//       agentPersonOrgCode: "YGM1E",
//       lineStatusChangeDict: {
//         line: [
//           {
//             order: 1,
//             id: "DAD23C1F-71A4-473A-9273-C83C8BFC5F64",
//             status: "",
//             fromStatus: "0007",
//             toStatus: "0008",
//             cancellationReason: "Clinical grounds"
//           },
//           {
//             order: 2,
//             id: "9F737A38-F80C-4AD0-96FC-CB5A796D254B",
//             status: "",
//             fromStatus: "0007",
//             toStatus: "0008"
//           },
//           {
//             order: 3,
//             id: "FDB4258F-BB6B-4217-A001-382BD4035123",
//             status: "",
//             fromStatus: "0007",
//             toStatus: "0008"
//           }
//         ]
//       }
//     },
//     {
//       SCN: 4,
//       sentDateTime: "20240213105241",
//       fromStatus: "0002",
//       toStatus: "0006",
//       message: "Dispense notification successful; Update applied to issue=1",
//       agentPersonOrgCode: "FA123",
//       lineStatusChangeDict: {
//         line: [
//           {
//             order: 1,
//             id: "DAD23C1F-71A4-473A-9273-C83C8BFC5F64",
//             status: "",
//             fromStatus: "0008",
//             toStatus: "0001",
//             cancellationReason: "Clinical grounds"
//           },
//           {
//             order: 2,
//             id: "9F737A38-F80C-4AD0-96FC-CB5A796D254B",
//             status: "",
//             fromStatus: "0008",
//             toStatus: "0001"
//           },
//           {
//             order: 3,
//             id: "FDB4258F-BB6B-4217-A001-382BD4035123",
//             status: "",
//             fromStatus: "0008",
//             toStatus: "0001"
//           }
//         ]
//       }
//     }
//   ],
//   dispenseNotificationDetails: {
//     statusPrescription: "0003",
//     dispensingOrganization: "FA123",
//     dispNotifToStatus: "0006",
//     dispenseNotifDateTime: "20240213105241",
//     dispenseNotificationItems: []
//   }
// }

// const mockParsedResponseWithDispense: Prescription = {
//   ...mockParsedResponse,
//   dispenseNotificationDetails: {
//     statusPrescription: "0006",
//     dispensingOrganization: "FA123",
//     dispNotifToStatus: "0006",
//     dispenseNotifDateTime: "20240213105241",
//     dispenseNotificationItems: [
//       {
//         order: 1,
//         medicationName: "Amoxicillin 250mg capsules",
//         quantity: "20",
//         status: "0006"
//       }
//     ]
//   }
// }

// const mockParsedResponseWithMultipleItems: Prescription = {
//   ...mockParsedResponse,
//   productLineItems: [
//     {
//       order: 1,
//       medicationName: "Amoxicillin 250mg capsules",
//       quantity: "20",
//       dosageInstructions: "2 times a day for 10 days"
//     },
//     {
//       order: 2,
//       medicationName: "Co-codamol 30mg/500mg tablets",
//       quantity: "30",
//       dosageInstructions: "1 tablet every 6 hours"
//     },
//     {
//       order: 3,
//       medicationName: "Pseudoephedrine hydrochloride 60mg tablets",
//       quantity: "15",
//       dosageInstructions: "Take one tablet twice daily"
//     }
//   ]
// }

// const mockParsedResponseWithMultipleDispenseItems: Prescription = {
//   ...mockParsedResponseWithMultipleItems,
//   dispenseNotificationDetails: {
//     statusPrescription: "0006",
//     dispensingOrganization: "FA123",
//     dispNotifToStatus: "0006",
//     dispenseNotifDateTime: "20240213105241",
//     dispenseNotificationItems: [
//       {
//         order: 1,
//         medicationName: "Amoxicillin 250mg capsules",
//         quantity: "20",
//         status: "0006"
//       },
//       {
//         order: 2,
//         medicationName: "Co-codamol 30mg/500mg tablets",
//         quantity: "30",
//         status: "0008"
//       },
//       {
//         order: 3,
//         medicationName: "Pseudoephedrine hydrochloride 60mg tablets",
//         quantity: "15",
//         status: "0007"
//       }
//     ]
//   }
// }

// const mockParsedResponseWithCancelledItems: Prescription = {
//   ...mockParsedResponseWithMultipleItems,
//   filteredHistory: [
//     {
//       SCN: 3, // Older event, does not contain cancellations
//       sentDateTime: "20250225194132",
//       fromStatus: "0001",
//       toStatus: "0001",
//       message: "Prescription/item processed",
//       agentPersonOrgCode: "A83008",
//       lineStatusChangeDict: {
//         line: [
//           {
//             order: 1,
//             id: "9BB08AA9-44A9-47AA-A619-961830143AF0",
//             status: "",
//             fromStatus: "0007",
//             toStatus: "0008"
//           },
//           {
//             order: 2,
//             id: "06B9EC66-5B19-459A-A2AD-31FE8589EB6B",
//             status: "",
//             fromStatus: "0007",
//             toStatus: "0007"
//           }
//         ]
//       }
//     },
//     {
//       SCN: 4, // More recent event, contains cancelled items
//       sentDateTime: "20250225194208",
//       fromStatus: "0001",
//       toStatus: "0005", // Prescription was cancelled
//       message: "Prescription/item was cancelled",
//       agentPersonOrgCode: "A83008",
//       lineStatusChangeDict: {
//         line: [
//           {
//             order: 1,
//             id: "9BB08AA9-44A9-47AA-A619-961830143AF0",
//             status: "",
//             fromStatus: "0008",
//             toStatus: "0005", // Now marked as cancelled
//             cancellationReason: "Clinical grounds"
//           },
//           {
//             order: 2,
//             id: "06B9EC66-5B19-459A-A2AD-31FE8589EB6B",
//             status: "",
//             fromStatus: "0007",
//             toStatus: "0005", // Now marked as cancelled
//             cancellationReason: "At the Pharmacist's request"
//           }
//         ]
//       }
//     }
//   ]
// }

// describe("generateFhirResponse", () => {

//   it("should generate a valid FHIR RequestGroup", () => {
//     const response = generateFhirResponse(mockParsedResponse, logger)

//     // Check that the response is a RequestGroup
//     expect(response.resourceType).toBe("RequestGroup")

//     // Check that the subject references the correct patient UUID
//     const patientResource = response.contained?.find((r) => r.resourceType === "Patient")
//     expect(patientResource).toBeDefined()
//     expect(response.subject?.reference).toBe(`#${patientResource?.id}`)

//     // Ensure there are contained resources
//     expect(response.contained?.length).toBeGreaterThan(0)

//     // Check that at least one MedicationRequest exists
//     expect(response.contained?.some((r) => r.resourceType === "MedicationRequest")).toBe(true)
//   })

//   it("should include correct patient details", () => {
//     const response = generateFhirResponse(mockParsedResponse, logger)

//     const patientResource = response.contained?.find((r) => r.resourceType === "Patient") as Patient
//     expect(patientResource).toBeDefined()
//     expect(patientResource.identifier?.[0].value).toBe("9449304130")
//     expect(patientResource.name?.[0].given?.[0]).toBe("STACEY")
//     expect(patientResource.name?.[0].family).toBe("TWITCHETT")
//   })

//   it("should include correct prescription details", () => {
//     const response = generateFhirResponse(mockParsedResponse, logger)

//     expect(response.identifier?.[0].value).toBe("9AD427-A83008-2E461K")
//     expect(response.status).toBe("active")
//     expect(response.intent).toBe("order")
//     expect(response.author?.identifier?.value).toBe("A83008")
//   })

//   it("should include correct RepeatInformation extension", () => {
//     const response = generateFhirResponse(mockParsedResponse, logger)

//     const repeatExtension = response.extension?.find((ext) =>
//       ext.url.includes("Extension-EPS-RepeatInformation")
//     )
//     expect(repeatExtension).toBeDefined()
//     expect(repeatExtension?.extension?.find((ext) => ext.url === "numberOfRepeatsAllowed")?.valueInteger).toBe(5)
//     expect(repeatExtension?.extension?.find((ext) => ext.url === "numberOfRepeatsIssued")?.valueInteger).toBe(1)
//   })

//   it("should include correct PendingCancellations extension", () => {
//     const response = generateFhirResponse(mockParsedResponse, logger)

//     const pendingCancellationExt = response.extension?.find((ext) =>
//       ext.url.includes("Extension-EPS-PendingCancellations")
//     )
//     expect(pendingCancellationExt).toBeDefined()
//     expect(pendingCancellationExt?.extension?.some((ext) => ext.url === "prescriptionPendingCancellation")).toBe(true)
//   })

//   it("should include PrescriptionStatusHistory extension", () => {
//     const response = generateFhirResponse(mockParsedResponse, logger)

//     const statusHistoryExt = response.extension?.find((ext) =>
//       ext.url.includes("Extension-DM-PrescriptionStatusHistory")
//     )
//     expect(statusHistoryExt).toBeDefined()
//     expect(statusHistoryExt?.extension?.[0].valueCoding?.code).toBe("0001")
//   })

//   it("should include MedicationRequest and optionally MedicationDispense based on dispense data", () => {
//     // Generate response with dispense notification details
//     const responseWithDispense = generateFhirResponse(mockParsedResponseWithDispense, logger)
//     const responseWithoutDispense = generateFhirResponse(mockParsedResponse, logger)

//     // Check that the RequestGroup contains actions
//     expect(responseWithDispense.action?.length).toBeGreaterThan(0)

//     // Ensure MedicationRequest always exists
//     const medicationRequestExists = responseWithDispense.contained?.some((r) => r.resourceType === "MedicationRequest")
//     expect(medicationRequestExists).toBe(true)

//     // Check for MedicationDispense only if dispense notifications are present
//     const medicationDispenseExists = responseWithDispense.contained?.some(
//       (r) => r.resourceType === "MedicationDispense"
//     )
//     expect(medicationDispenseExists).toBe(true)

//     // Validate that MedicationDispense is NOT present when no dispense data exists
//     const medicationDispenseMissing = responseWithoutDispense.contained?.some(
//       (r) => r.resourceType === "MedicationDispense"
//     )
//     expect(medicationDispenseMissing).toBe(false)
//   })

//   it("should include correct participant information in actions", () => {
//     const response = generateFhirResponse(mockParsedResponseWithDispense, logger)

//     // Check prescription upload action
//     const prescriptionUploadAction = response.action?.[0].action?.find(
//       (action) => action.title === "Prescription upload successful"
//     )

//     expect(prescriptionUploadAction).toBeDefined()
//     expect(
//       prescriptionUploadAction?.participant?.[0].identifier?.value
//     ).toBe(
//       mockParsedResponseWithDispense.requestGroupDetails?.prescribingOrganization
//     )

//     // Check dispense notification action
//     const dispenseNotificationAction = response.action?.[0].action?.find(
//       (action) => action.title === "Dispense notification successful"
//     )

//     expect(dispenseNotificationAction).toBeDefined()
//     expect(
//       dispenseNotificationAction?.participant?.[0].identifier?.value
//     ).toBe(
//       mockParsedResponseWithDispense.dispenseNotificationDetails?.dispensingOrganization
//     )
//   })

//   it("should correctly handle multiple product line items", () => {
//     const response = generateFhirResponse(mockParsedResponseWithMultipleItems, logger)

//     // Extract MedicationRequest entries from the response
//     const medicationRequests = response.contained?.filter((r) => r.resourceType === "MedicationRequest")

//     // Ensure all expected product line items are present in MedicationRequests
//     expect(medicationRequests?.length).toBe(3)

//     // Verify the content of each MedicationRequest
//     mockParsedResponseWithMultipleItems.productLineItems?.forEach((item) => {
//       const matchingMedicationRequest = medicationRequests?.find(
//         (r) => r.medicationCodeableConcept?.coding?.[0].display === item.medicationName
//       )

//       expect(matchingMedicationRequest).toBeDefined()
//       expect(matchingMedicationRequest?.dispenseRequest?.quantity?.value).toBe(parseInt(item.quantity, 10))
//       expect(matchingMedicationRequest?.dosageInstruction?.[0]?.text).toBe(item.dosageInstructions)
//     })
//   })

//   it("should correctly link MedicationRequest to MedicationDispense and actions", () => {
//     const response = generateFhirResponse(mockParsedResponseWithMultipleDispenseItems, logger)

//     // Extract MedicationRequest and MedicationDispense entries
//     const medicationRequests = response.contained?.filter((r) => r.resourceType === "MedicationRequest")
//     const medicationDispenses = response.contained?.filter((r) => r.resourceType === "MedicationDispense")

//     // Ensure all expected dispense items are present
//     expect(medicationRequests?.length).toBe(3)
//     expect(medicationDispenses?.length).toBe(3)

//     // Verify links between MedicationRequest and MedicationDispense
//     medicationRequests?.forEach((medReq) => {
//       const correspondingDispense = medicationDispenses?.find((disp) =>
//         disp.authorizingPrescription?.some((ref) => ref.reference === `#${medReq.id}`)
//       )

//       expect(correspondingDispense).toBeDefined()
//     })

//     // Verify that actions correctly reference MedicationRequests and MedicationDispenses
//     const prescriptionUploadAction = response.action?.[0].action?.find(
//       (action) => action.title === "Prescription upload successful"
//     )

//     const dispenseNotificationAction = response.action?.[0].action?.find(
//       (action) => action.title === "Dispense notification successful"
//     )

//     // Check that MedicationRequests are referenced in prescription upload
//     medicationRequests?.forEach((medReq) => {
//       const referencedInUpload = prescriptionUploadAction?.action?.some(
//         (act) => act.resource?.reference === `#${medReq.id}`
//       )
//       expect(referencedInUpload).toBe(true)
//     })

//     // Check that MedicationDispenses are referenced in dispense notification
//     medicationDispenses?.forEach((medDisp) => {
//       const referencedInDispenseNotification = dispenseNotificationAction?.action?.some(
//         (act) => act.resource?.reference === `#${medDisp.id}`
//       )
//       expect(referencedInDispenseNotification).toBe(true)
//     })
//   })

//   it("should correctly map prescription status to FHIR response", () => {
//     const response = generateFhirResponse(mockParsedResponse, logger)

//     const prescriptionStatusExtension = response.extension?.find(
//       (ext) => ext.url === "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory"
//     )

//     expect(prescriptionStatusExtension).toBeDefined()
//     expect(prescriptionStatusExtension?.extension?.[0].valueCoding?.code)
//       .toBe(mockParsedResponse.requestGroupDetails?.prescriptionStatus)
//   })

//   it("should correctly mark cancelled medications", () => {
//     const response = generateFhirResponse(mockParsedResponseWithCancelledItems, logger)

//     // Ensure filteredHistory is an array (or use an empty array if it's undefined)
//     const filteredHistoryArray = mockParsedResponseWithCancelledItems.filteredHistory ?? []

//     // Ensure we have history data before reducing
//     if (filteredHistoryArray.length === 0) {
//       throw new Error("No filtered history data available for testing.")
//     }

//     // Extract the latest filtered history entry (highest SCN)
//     const latestHistory = filteredHistoryArray.reduce(
//       (latest, current) => (!latest || current.SCN > latest.SCN) ? current : latest,
//       filteredHistoryArray[0] // Set initial value correctly
//     )

//     // Get medications that were marked as cancelled in the latest history
//     const expectedCancelledItems = latestHistory.lineStatusChangeDict?.line?.filter(
//       (line) => line.toStatus === "0005"
//     ) ?? []

//     // Extract cancelled medications from the response
//     const cancelledMedications = response.contained?.filter(
//       (r) => r.resourceType === "MedicationRequest" && r.status === "cancelled"
//     ) ?? []

//     // Compare the count of expected cancelled items with the actual cancelled medications
//     expect(cancelledMedications.length).toBe(expectedCancelledItems.length)
//   })

//   it("should handle dispense notifications without dispense items correctly", () => {
//     const response = generateFhirResponse(
//       {
//         ...mockParsedResponseWithDispense,
//         dispenseNotificationDetails: {
//           ...mockParsedResponseWithDispense.dispenseNotificationDetails,
//           dispenseNotificationItems: [],
//           statusPrescription:
//             mockParsedResponseWithDispense.dispenseNotificationDetails?.statusPrescription ?? "0006",
//           dispensingOrganization:
//             mockParsedResponseWithDispense.dispenseNotificationDetails?.dispensingOrganization ?? "UNKNOWN",
//           dispNotifToStatus:
//             mockParsedResponseWithDispense.dispenseNotificationDetails?.dispNotifToStatus ?? "0006",
//           dispenseNotifDateTime:
//             mockParsedResponseWithDispense.dispenseNotificationDetails?.dispenseNotifDateTime ?? "20240213105241"
//         }
//       },
//       logger
//     )

//     // Ensure MedicationDispense is NOT present
//     const medicationDispenseExists = response.contained?.some((r) => r.resourceType === "MedicationDispense")
//     expect(medicationDispenseExists).toBe(false)

//     // Ensure dispense notification action exists but does not reference any dispense items
//     const dispenseNotificationAction = response.action?.[0].action?.find(
//       (action) => action.title === "Dispense notification successful"
//     )

//     expect(dispenseNotificationAction).toBeDefined()
//     expect(dispenseNotificationAction?.action?.length).toBe(0)
//   })

//   it("should handle missing prescription details gracefully", () => {
//     const minimalResponse: Prescription = {
//       patientDetails: {
//         nhsNumber: "1234567890",
//         prefix: "",
//         given: "John",
//         family: "Doe",
//         suffix: "",
//         birthDate: "",
//         gender: 1
//       },
//       requestGroupDetails: {
//         prescriptionId: "",
//         prescriptionTreatmentType: "",
//         prescriptionType: "",
//         signedTime: "",
//         prescriptionTime: "",
//         prescriptionStatus: "",
//         instanceNumber: 0,
//         maxRepeats: 0,
//         daysSupply: 0,
//         nominatedPerformer: "",
//         prescribingOrganization: ""
//       },
//       productLineItems: [],
//       filteredHistory: undefined,
//       dispenseNotificationDetails: undefined
//     }

//     const response = generateFhirResponse(minimalResponse, logger)

//     expect(response.resourceType).toBe("RequestGroup")
//     expect(response.identifier?.[0].value).toBe("")
//     expect(response.contained?.length).toBeGreaterThan(0)
//   })
// })
