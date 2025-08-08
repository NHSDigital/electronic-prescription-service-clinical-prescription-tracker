/* eslint-disable max-len */

import {Logger} from "@aws-lambda-powertools/logger"
import {jest} from "@jest/globals"
import {ParsedSpineResponse, parseSpineResponse, Prescription} from "../src/parseSpineResponse"
import {PatientBundleEntryType} from "../src/schema/patient"
import {
  MedicationRepeatInformationExtensionType,
  PendingCancellationExtensionType,
  PrescriptionStatusExtensionType
} from "@cpt-common/common-types/schema"
import {PrescriptionNonDispensingReasonExtensionType, PrescriptionTypeExtensionType} from "../src/schema/extensions"
import {HistoryAction} from "../src/schema/actions"
import {RequestGroupBundleEntryType} from "../src/schema/requestGroup"
import {MedicationRequestBundleEntryType} from "../src/schema/medicationRequest"
import {PractitionerRoleBundleEntryType} from "../src/schema/practitionerRole"
import {MedicationDispenseBundleEntryType} from "../src/schema/medicationDispense"
import {
  acuteCreated,
  acuteDispensedWithASingleItem,
  acuteDispensedWithMismatchedIds,
  acutePendingCancellationWithReason,
  acuteCumulativeMultipleDispenseNotifications,
  acuteMultipleDispenseNotificationsWithMismatchedIds,
  acuteWithdrawn,
  acuteWithPartialDispenseNotification,
  acuteWithWithdrawnAmendment,
  acuteWithWithdrawnDispenseNotification,
  altAcuteAdditiveMultipleDispenseNotifications,
  erdCreated,
  erdDispensedWith0Quantity,
  acuteAdditiveMultipleDispenseNotifications,
  acuteDispensedWithMultipleComponents,
  acuteWithoutOptionalDosageInstructions,
  acuteCancelledWithReason,
  acuteNonDispensedWithReason
} from "./examples/examples"

const logger: Logger = new Logger({serviceName: "clinicalView", logLevel: "DEBUG"})

const mockUUID = jest.fn()
jest.unstable_mockModule("crypto", () => {
  return {
    default: jest.fn(),
    randomUUID: mockUUID
  }
})

const parseExample = (exampleSpineResponse: string) => {
  const parsedSpineResponse: ParsedSpineResponse = parseSpineResponse(exampleSpineResponse, logger)
  if ("spineError" in parsedSpineResponse) {
    throw new Error("Parsed response should not contain an error")
  }
  return parsedSpineResponse.prescription
}
const parsedAcuteDispensedWithSingleItem = parseExample(acuteDispensedWithASingleItem)
const parsedAcuteCreatedWithMultipleItems = parseExample(acuteCreated)
const parsedAcuteDispensedWithMultipleComponents = parseExample(acuteDispensedWithMultipleComponents)
const parsedAcuteCumulativeMultipleDispenseNotifications = parseExample(acuteCumulativeMultipleDispenseNotifications)
const parsedAcuteAdditiveMultipleDispenseNotifications = parseExample(acuteAdditiveMultipleDispenseNotifications)
const parsedAltAcuteAdditiveMultipleDispenseNotifications = parseExample(altAcuteAdditiveMultipleDispenseNotifications)
const parsedAcuteWithoutOptionalDosageInstruction = parseExample(acuteWithoutOptionalDosageInstructions)
const parsedErdDispensedWith0Quantity = parseExample(erdDispensedWith0Quantity)

const {generateFhirResponse} = await import("../src/generateFhirResponse")

beforeEach(() => {
  mockUUID.mockImplementationOnce(() => "PATIENT-123-567-890")
  mockUUID.mockImplementationOnce(() => "RGROUP-123-567-890")
  mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
})

afterEach(() => {
  jest.resetAllMocks()
})

describe("Test generateFhirResponse: Bundle resource structure", () => {
  it("returns a Bundle when called", () => {
    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-123-567-890")

    const expected = {
      resourceType: "Bundle",
      type: "searchset",
      total: 1
    }

    const actual = generateFhirResponse(parsedAcuteDispensedWithSingleItem, logger)
    expect(actual).toEqual(expect.objectContaining(expected))
  })
})

describe("Test generateFhirResponse: RequestGroup resource structure & extensions", () => {
  beforeEach(() => {
    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-123-567-890")
  })

  it("returns a Bundle containing a RequestGroup Bundle Entry resource when called", () => {
    const expected = {
      fullUrl: "urn:uuid:RGROUP-123-567-890",
      search: {
        mode: "match"
      },
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        id: "RGROUP-123-567-890",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-number",
          value: "EA1CBC-A83008-F1F8A8"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "active",
        intent: "order",
        author: {
          identifier: {
            system: "https://fhir.nhs.uk/Id/ods-organization-code",
            value: "A83008"
          }
        },
        authoredOn: "2025-04-29T00:00:00.000Z"
      })
    } as unknown as RequestGroupBundleEntryType

    const actual = generateFhirResponse(parsedAcuteDispensedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining(expected))
  })

  it("returns a RequestGroup with a status PrescriptionStatus extension when called", () => {
    const expected: PrescriptionStatusExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-PrescriptionStatusHistory",
      extension: [{
        url: "status",
        valueCoding: {
          system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
          code: "0006",
          display: "Dispensed"
        }
      }]
    }

    const actual = generateFhirResponse(parsedAcuteDispensedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        extension: expect.arrayContaining([expected])
      })
    }))
  })

  it("returns a RequestGroup with a PrescriptionType extension when called", () => {
    const expected: PrescriptionTypeExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionType",
      valueCoding: {
        system: "https://fhir.nhs.uk/CodeSystem/prescription-type",
        code: "0101",
        display: "Primary Care Prescriber - Medical Prescriber"
      }
    }

    const actual = generateFhirResponse(parsedAcuteDispensedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        extension: expect.arrayContaining([expected])
      })
    }))
  })

  it("returns a RequestGroup with a RepeatInformation extension when called with a non acute prescription", () => {
    const parsedErdCreated = parseExample(erdCreated)

    const expected: MedicationRepeatInformationExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-RepeatInformation",
      extension:[
        {
          url: "numberOfRepeatsIssued",
          valueInteger: 1
        },
        {
          url: "numberOfRepeatsAllowed",
          valueInteger: 7
        }
      ]
    }

    const actual = generateFhirResponse(parsedErdCreated, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        extension: expect.arrayContaining([expected])
      })
    }))
  })

  it("returns a RequestGroup without a RepeatInformation extension when called with a acute prescription", () => {
    const expected = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-RepeatInformation"
    } as unknown as MedicationRepeatInformationExtensionType

    const actual = generateFhirResponse(parsedAcuteDispensedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        extension: expect.not.arrayContaining([expected])
      })
    }))
  })

  it("returns a RequestGroup with a partial RepeatInformation extension when called with a non acute prescription without a max repeats value", () => {
    const prescription = {
      ...parsedAcuteDispensedWithSingleItem,
      ...{treatmentType: "0002"}
    } as unknown as Prescription

    const expected: MedicationRepeatInformationExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-RepeatInformation",
      extension:[
        {
          url: "numberOfRepeatsIssued",
          valueInteger: 1
        }
      ]
    }

    const actual = generateFhirResponse(prescription, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        extension: expect.arrayContaining([expected])
      })
    }))
  })

  it("returns a RequestGroup with correct PendingCancellation & cancellationReason PrescriptionStatus extensions when called with an acute prescription pending cancellation with a cancellation reason", () => {
    /* Tests for prescriptions where:
      - The prescription has a non cancelled status
      - The prescription has cancellation reason (e.g. cancelled via HL7)
      - The cancellation is pending
    */
    const parsedAcutePendingCancellationWithReason = parseExample(acutePendingCancellationWithReason)

    const expectedPendingCancellation: PendingCancellationExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-PendingCancellation",
      extension: [{
        url: "prescriptionPendingCancellation",
        valueBoolean: true
      }]
    }
    const expectedCancellationReason: PrescriptionStatusExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-PrescriptionStatusHistory",
      extension:[{
        url: "cancellationReason",
        valueCoding: {
          system: "https://fhir.nhs.uk/CodeSystem/medicationrequest-status-reason",
          code: "0001",
          display: "Prescribing Error"
        }
      }]
    }

    const actual = generateFhirResponse(parsedAcutePendingCancellationWithReason, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        extension: expect.arrayContaining([expectedPendingCancellation])
      })
    }))
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        extension: expect.arrayContaining([expectedCancellationReason])
      })
    }))
  })

  it("returns a RequestGroup with a correct PendingCancellation and no cancellationReason PrescriptionStatus extensions when called with an acute prescription without a cancellation reason", () => {
    /* Tests for prescriptions where:
      - The prescription has a non cancelled status
      - The prescription does not have a cancellation reason
      - There is no pending cancellation
    */
    const expectedPendingCancellation: PendingCancellationExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-PendingCancellation",
      extension: [{
        url: "prescriptionPendingCancellation",
        valueBoolean: false
      }]
    }
    const expectedCancellationReason = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-PrescriptionStatusHistory",
      extension:[{
        url: "cancellationReason",
        valueCoding: {
          system: "https://fhir.nhs.uk/CodeSystem/medicationrequest-status-reason"
        }
      }]
    } as unknown as PrescriptionStatusExtensionType

    const actual = generateFhirResponse(parsedAcuteDispensedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        extension: expect.arrayContaining([expectedPendingCancellation])
      })
    }))
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        extension: expect.not.arrayContaining([expect.objectContaining(expectedCancellationReason)])
      })
    }))
  })

  it("returns a RequestGroup with correct PendingCancellation & cancellationReason PrescriptionStatus extensions when called with a cancelled acute prescription with a cancellation reason", () => {
    /* Tests for prescriptions where:
      - The prescription has a cancelled status
      - The prescription has a cancellation reason (e.g. cancelled via HL7)
      - The cancellation is not pending
    */
    const parsedAcuteCancelledWithReason = parseExample(acuteCancelledWithReason)

    const expectedPendingCancellation: PendingCancellationExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-PendingCancellation",
      extension: [{
        url: "prescriptionPendingCancellation",
        valueBoolean: false
      }]
    }
    const expectedCancellationReason: PrescriptionStatusExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-PrescriptionStatusHistory",
      extension:[{
        url: "cancellationReason",
        valueCoding: {
          system: "https://fhir.nhs.uk/CodeSystem/medicationrequest-status-reason",
          code: "0001",
          display: "Prescribing Error"
        }
      }]
    }

    const actual = generateFhirResponse(parsedAcuteCancelledWithReason, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        extension: expect.arrayContaining([expectedPendingCancellation])
      })
    }))
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        extension: expect.arrayContaining([expectedCancellationReason])
      })
    }))
  })

  it("returns a RequestGroup without a PrescriptionNonDispensingReason extension when called with a acute prescription without a non dispensing reason", () => {
    /* Tests for prescriptions where:
      - The prescription has a non non dispensing status
      - The prescription does not have a non dispensing reason
    */
    const expectedPrescriptionNonDispensingReason: PrescriptionNonDispensingReasonExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionNonDispensingReason",
      valueCoding: {
        system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-status-reason",
        code: "0002",
        display: "Clinically unsuitable"
      }
    }

    const actual = generateFhirResponse(parsedAcuteDispensedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        extension: expect.not.arrayContaining([expectedPrescriptionNonDispensingReason])
      })
    }))
  })

  it("returns a RequestGroup with a PrescriptionNonDispensingReason extension when called with a non dispensed acute prescription with a non dispensing reason", () => {
    /* Tests for prescriptions where:
      - The prescription has a non dispensing status
      - The prescription has a non dispensing reason (e.g. not dispensed via HL7)
    */
    const parsedAcuteNonDispensedWithReason = parseExample(acuteNonDispensedWithReason)

    const expectedPrescriptionNonDispensingReason: PrescriptionNonDispensingReasonExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionNonDispensingReason",
      valueCoding: {
        system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-status-reason",
        code: "0002",
        display: "Clinically unsuitable"
      }
    }

    const actual = generateFhirResponse(parsedAcuteNonDispensedWithReason, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        extension: expect.arrayContaining([expectedPrescriptionNonDispensingReason])
      })
    }))
  })
})

// TODO: properly split / group the rest of these tests
// TODO: check tests for item level cancellation reasons
// TODO: add tests for item level non dispensing reasons
describe("Test generateFhirResponse: Patient resource structure", () => {
  it("returns a Bundle containing Patient Bundle Entry resource when called", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-123-567-890")

    const expected: PatientBundleEntryType = {
      fullUrl: "urn:uuid:PATIENT-123-567-890",
      search: {
        mode: "include"
      },
      resource:{
        resourceType: "Patient",
        id: "PATIENT-123-567-890",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/nhs-number",
          value: "5839945242"
        }],
        name: [{
          prefix: ["MS"],
          suffix: ["OBE"],
          given: ["STACEY"],
          family: "TWITCHETT"
        }],
        birthDate:  "1948-04-30",
        gender: "female",
        address: [{
          type: "both",
          use: "home",
          line: [
            "10 HEATHFIELD",
            "COBHAM",
            "SURREY"
          ],
          text: "10 HEATHFIELD, COBHAM, SURREY, KT11 2QY",
          postalCode: "KT11 2QY"
        }]
      }
    }

    const actual = generateFhirResponse(parsedAcuteDispensedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expected)
  })

  const partialPatientTestCases = [
    {
      patientDetails: {
        prefix: undefined,
        given: undefined,
        suffix: undefined,
        family: undefined
      },
      scenario: "a prescription with no patient name",
      expectedPatientResource: {
        fullUrl: "urn:uuid:PATIENT-123-567-890",
        search: {
          mode: "include"
        },
        resource:{
          resourceType: "Patient",
          id: "PATIENT-123-567-890",
          identifier: [{
            system: "https://fhir.nhs.uk/Id/nhs-number",
            value: "5839945242"
          }],
          birthDate:  "1948-04-30",
          gender: "female",
          address: [{
            type: "both",
            use: "home",
            line: [
              "10 HEATHFIELD",
              "COBHAM",
              "SURREY"
            ],
            text: "10 HEATHFIELD, COBHAM, SURREY, KT11 2QY",
            postalCode: "KT11 2QY"
          }]
        }
      }
    },
    {
      patientDetails: {
        address: {
          line: [],
          postalCode: "KT11 2QY"
        }
      },
      scenario: "a prescription with no patient address lines",
      expectedPatientResource: {
        fullUrl: "urn:uuid:PATIENT-123-567-890",
        search: {
          mode: "include"
        },
        resource:{
          resourceType: "Patient",
          id: "PATIENT-123-567-890",
          identifier: [{
            system: "https://fhir.nhs.uk/Id/nhs-number",
            value: "5839945242"
          }],
          name: [{
            prefix: ["MS"],
            suffix: ["OBE"],
            given: ["STACEY"],
            family: "TWITCHETT"
          }],
          birthDate:  "1948-04-30",
          gender: "female",
          address: [{
            type: "both",
            use: "home",
            text: "KT11 2QY",
            postalCode: "KT11 2QY"
          }]
        }
      }
    },
    {
      patientDetails: {
        address: {
          line: [
            "10 HEATHFIELD",
            "COBHAM",
            "SURREY"
          ],
          postalCode: undefined
        }
      },
      scenario: "a prescription with no patient address postcode",
      expectedPatientResource: {
        fullUrl: "urn:uuid:PATIENT-123-567-890",
        search: {
          mode: "include"
        },
        resource:{
          resourceType: "Patient",
          id: "PATIENT-123-567-890",
          identifier: [{
            system: "https://fhir.nhs.uk/Id/nhs-number",
            value: "5839945242"
          }],
          name: [{
            prefix: ["MS"],
            suffix: ["OBE"],
            given: ["STACEY"],
            family: "TWITCHETT"
          }],
          birthDate:  "1948-04-30",
          gender: "female",
          address: [{
            type: "both",
            use: "home",
            line: [
              "10 HEATHFIELD",
              "COBHAM",
              "SURREY"
            ],
            text: "10 HEATHFIELD, COBHAM, SURREY"
          }]
        }
      }
    },
    {
      patientDetails: {
        address: {
          line: [],
          postalCode: undefined
        }
      },
      scenario: "a prescription with no patient address",
      expectedPatientResource: {
        fullUrl: "urn:uuid:PATIENT-123-567-890",
        search: {
          mode: "include"
        },
        resource:{
          resourceType: "Patient",
          id: "PATIENT-123-567-890",
          identifier: [{
            system: "https://fhir.nhs.uk/Id/nhs-number",
            value: "5839945242"
          }],
          name: [{
            prefix: ["MS"],
            suffix: ["OBE"],
            given: ["STACEY"],
            family: "TWITCHETT"
          }],
          birthDate:  "1948-04-30",
          gender: "female"
        }
      }
    },
    {
      patientDetails: {
        gender: undefined
      },
      scenario: "a prescription with no patient gender",
      expectedPatientResource: {
        fullUrl: "urn:uuid:PATIENT-123-567-890",
        search: {
          mode: "include"
        },
        resource:{
          resourceType: "Patient",
          id: "PATIENT-123-567-890",
          identifier: [{
            system: "https://fhir.nhs.uk/Id/nhs-number",
            value: "5839945242"
          }],
          name: [{
            prefix: ["MS"],
            suffix: ["OBE"],
            given: ["STACEY"],
            family: "TWITCHETT"
          }],
          birthDate:  "1948-04-30",
          gender: "unknown",
          address: [{
            type: "both",
            use: "home",
            line: [
              "10 HEATHFIELD",
              "COBHAM",
              "SURREY"
            ],
            text: "10 HEATHFIELD, COBHAM, SURREY, KT11 2QY",
            postalCode: "KT11 2QY"
          }]
        }
      }
    }
  ]
  partialPatientTestCases.forEach(({patientDetails, scenario, expectedPatientResource}) => {
    it(`returns a Bundle containing a partial Patient Bundle Entry resource when called with ${scenario}`, () => {

      mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
      mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
      mockUUID.mockImplementationOnce(() => "MEDDIS-123-567-890")

      const acuteDispensedWithIncompletePatientDetails = {
        ...parsedAcuteDispensedWithSingleItem,
        ...patientDetails
      } as unknown as Prescription

      const actual = generateFhirResponse(acuteDispensedWithIncompletePatientDetails, logger)
      expect(actual.entry).toContainEqual(expectedPatientResource)
    })
  })

  it("returns a Bundle containing a prescriber org PractitionerRole Bundle Entry resource when called", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-123-567-890")

    const expected: PractitionerRoleBundleEntryType = {
      fullUrl: "urn:uuid:PRESORG-123-567-890",
      search: {
        mode: "include"
      },
      resource:{
        resourceType: "PractitionerRole",
        id: "PRESORG-123-567-890",
        organization: {
          identifier: {
            system: "https://fhir.nhs.uk/Id/ods-organization-code",
            value: "A83008"
          }
        }
      }
    }
    const actual = generateFhirResponse(parsedAcuteDispensedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expected)
  })

  it("returns a Bundle containing a MedicationRequest Bundle Entry resource for each line item when called", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDREQ-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDREQ-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDREQ-444-444-444")

    const expectedMedicationRequest1: MedicationRequestBundleEntryType = {
      fullUrl: "urn:uuid:MEDREQ-111-111-111",
      search: {
        mode: "include"
      },
      resource:{
        resourceType: "MedicationRequest",
        id: "MEDREQ-111-111-111",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "D37FD639-E831-420C-B37B-40481DCA910E"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "active",
        intent: "order",
        requester: {
          reference: "urn:uuid:PRESORG-123-567-890"
        },
        groupIdentifier: {
          system: "https://fhir.nhs.uk/Id/prescription-order-number",
          value: "C0C3E6-A83008-93D8FL"
        },
        medicationCodeableConcept: {
          text: "Amoxicillin 250mg capsules"
        },
        courseOfTherapyType: {
          coding: [{
            system: "http://terminology.hl7.org/CodeSystem/medicationrequest-course-of-therapy",
            code: "acute",
            display: "Short course (acute) therapy"
          }]
        },
        dispenseRequest: {
          quantity: {
            value: 20,
            unit: "tablet"
          },
          performer: {
            identifier:[{
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: "FA565"
            }]
          },
          extension: [{
            url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PerformerSiteType",
            valueCoding: {
              system: "https://fhir.nhs.uk/CodeSystem/dispensing-site-preference",
              code: "P1",
              display: "Other (e.g. Community Pharmacy)"
            }
          }]
        },
        dosageInstruction: [{
          text: "2 times a day for 10 days"
        }],
        substitution: {
          allowedBoolean: false
        },
        extension: [
          {
            url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-DispensingInformation",
            extension: [{
              url: "dispenseStatus",
              valueCoding: {
                system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
                code: "0007",
                display: "Item to be dispensed"
              }
            }]
          },
          {
            url: "https://fhir.nhs.uk/StructureDefinition/Extension-PendingCancellation",
            extension: [{
              url: "lineItemPendingCancellation",
              valueBoolean: false
            }]
          }
        ]
      }
    }
    const expectedMedicationRequest2: MedicationRequestBundleEntryType = {
      fullUrl: "urn:uuid:MEDREQ-222-222-222",
      search: {
        mode: "include"
      },
      resource:{
        resourceType: "MedicationRequest",
        id: "MEDREQ-222-222-222",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "407685A2-A1A2-4B6B-B281-CAED41733C2B"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "active",
        intent: "order",
        requester: {
          reference: "urn:uuid:PRESORG-123-567-890"
        },
        groupIdentifier: {
          system: "https://fhir.nhs.uk/Id/prescription-order-number",
          value: "C0C3E6-A83008-93D8FL"
        },
        medicationCodeableConcept: {
          text: "Co-codamol 30mg/500mg tablets"
        },
        courseOfTherapyType: {
          coding: [{
            system: "http://terminology.hl7.org/CodeSystem/medicationrequest-course-of-therapy",
            code: "acute",
            display: "Short course (acute) therapy"
          }]
        },
        dispenseRequest: {
          quantity: {
            value: 20,
            unit: "tablet"
          },
          performer: {
            identifier:[{
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: "FA565"
            }]
          },
          extension: [{
            url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PerformerSiteType",
            valueCoding: {
              system: "https://fhir.nhs.uk/CodeSystem/dispensing-site-preference",
              code: "P1",
              display: "Other (e.g. Community Pharmacy)"
            }
          }]
        },
        dosageInstruction: [{
          text: "2 times a day for 10 days"
        }],
        substitution: {
          allowedBoolean: false
        },
        extension: [
          {
            url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-DispensingInformation",
            extension: [{
              url: "dispenseStatus",
              valueCoding: {
                system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
                code: "0007",
                display: "Item to be dispensed"
              }
            }]
          },
          {
            url: "https://fhir.nhs.uk/StructureDefinition/Extension-PendingCancellation",
            extension: [{
              url: "lineItemPendingCancellation",
              valueBoolean: false
            }]
          }
        ]
      }
    }
    const expectedMedicationRequest3: MedicationRequestBundleEntryType = {
      fullUrl: "urn:uuid:MEDREQ-333-333-333",
      search: {
        mode: "include"
      },
      resource:{
        resourceType: "MedicationRequest",
        id: "MEDREQ-333-333-333",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "20D6D69F-7BDD-4798-86DF-30F902BD2936"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "active",
        intent: "order",
        requester: {
          reference: "urn:uuid:PRESORG-123-567-890"
        },
        groupIdentifier: {
          system: "https://fhir.nhs.uk/Id/prescription-order-number",
          value: "C0C3E6-A83008-93D8FL"
        },
        medicationCodeableConcept: {
          text: "Pseudoephedrine hydrochloride 60mg tablets"
        },
        courseOfTherapyType: {
          coding: [{
            system: "http://terminology.hl7.org/CodeSystem/medicationrequest-course-of-therapy",
            code: "acute",
            display: "Short course (acute) therapy"
          }]
        },
        dispenseRequest: {
          quantity: {
            value: 30,
            unit: "tablet"
          },
          performer: {
            identifier:[{
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: "FA565"
            }]
          },
          extension: [{
            url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PerformerSiteType",
            valueCoding: {
              system: "https://fhir.nhs.uk/CodeSystem/dispensing-site-preference",
              code: "P1",
              display: "Other (e.g. Community Pharmacy)"
            }
          }]
        },
        dosageInstruction: [{
          text: "3 times a day for 10 days"
        }],
        substitution: {
          allowedBoolean: false
        },
        extension: [
          {
            url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-DispensingInformation",
            extension: [{
              url: "dispenseStatus",
              valueCoding: {
                system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
                code: "0007",
                display: "Item to be dispensed"
              }
            }]
          },
          {
            url: "https://fhir.nhs.uk/StructureDefinition/Extension-PendingCancellation",
            extension: [{
              url: "lineItemPendingCancellation",
              valueBoolean: false
            }]
          }
        ]
      }
    }
    const expectedMedicationRequest4: MedicationRequestBundleEntryType = {
      fullUrl: "urn:uuid:MEDREQ-444-444-444",
      search: {
        mode: "include"
      },
      resource:{
        resourceType: "MedicationRequest",
        id: "MEDREQ-444-444-444",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "BF1B0BD8-0E6D-4D90-989E-F32065200CA3"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "active",
        intent: "order",
        requester: {
          reference: "urn:uuid:PRESORG-123-567-890"
        },
        groupIdentifier: {
          system: "https://fhir.nhs.uk/Id/prescription-order-number",
          value: "C0C3E6-A83008-93D8FL"
        },
        medicationCodeableConcept: {
          text: "Azithromycin 250mg capsules"
        },
        courseOfTherapyType: {
          coding: [{
            system: "http://terminology.hl7.org/CodeSystem/medicationrequest-course-of-therapy",
            code: "acute",
            display: "Short course (acute) therapy"
          }]
        },
        dispenseRequest: {
          quantity: {
            value: 30,
            unit: "tablet"
          },
          performer: {
            identifier:[{
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: "FA565"
            }]
          },
          extension: [{
            url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PerformerSiteType",
            valueCoding: {
              system: "https://fhir.nhs.uk/CodeSystem/dispensing-site-preference",
              code: "P1",
              display: "Other (e.g. Community Pharmacy)"
            }
          }]
        },
        dosageInstruction: [{
          text: "3 times a day for 10 days"
        }],
        substitution: {
          allowedBoolean: false
        },
        extension: [
          {
            url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-DispensingInformation",
            extension: [{
              url: "dispenseStatus",
              valueCoding: {
                system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
                code: "0007",
                display: "Item to be dispensed"
              }
            }]
          },
          {
            url: "https://fhir.nhs.uk/StructureDefinition/Extension-PendingCancellation",
            extension: [{
              url: "lineItemPendingCancellation",
              valueBoolean: false
            }]
          }
        ]
      }
    }

    const actual = generateFhirResponse(parsedAcuteCreatedWithMultipleItems, logger)
    expect(actual.entry).toContainEqual(expectedMedicationRequest1)
    expect(actual.entry).toContainEqual(expectedMedicationRequest2)
    expect(actual.entry).toContainEqual(expectedMedicationRequest3)
    expect(actual.entry).toContainEqual(expectedMedicationRequest4)
  })

  it("returns a Bundle containing a partial MedicationRequest Bundle Entry resource called with a prescription with no nominated dispenser", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")

    const prescription: Prescription = {
      ...parsedAcuteDispensedWithSingleItem,
      ...{nominatedDisperserType: "0004"}
    }
    delete prescription.nominatedDispenserOrg

    const expectedMedicationRequest: MedicationRequestBundleEntryType = {
      fullUrl: "urn:uuid:MEDREQ-111-111-111",
      search: {
        mode: "include"
      },
      resource:{
        resourceType: "MedicationRequest",
        id: "MEDREQ-111-111-111",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "101875F7-400C-43FE-AC04-7F29DBF854AF"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "completed",
        intent: "order",
        requester: {
          reference: "urn:uuid:PRESORG-123-567-890"
        },
        performer: {
          identifier: [{
            system: "https://fhir.nhs.uk/Id/ods-organization-code",
            value: "FA565"
          }]
        },
        groupIdentifier: {
          system: "https://fhir.nhs.uk/Id/prescription-order-number",
          value: "EA1CBC-A83008-F1F8A8"
        },
        medicationCodeableConcept: {
          text: "Amoxicillin 250mg capsules"
        },
        courseOfTherapyType: {
          coding: [{
            system: "http://terminology.hl7.org/CodeSystem/medicationrequest-course-of-therapy",
            code: "acute",
            display: "Short course (acute) therapy"
          }]
        },
        dispenseRequest: {
          quantity: {
            value: 20,
            unit: "tablet"
          },
          extension: [{
            url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PerformerSiteType",
            valueCoding: {
              system: "https://fhir.nhs.uk/CodeSystem/dispensing-site-preference",
              code: "0004",
              display: "None"
            }
          }]
        },
        dosageInstruction: [{
          text: "2 times a day for 10 days"
        }],
        substitution: {
          allowedBoolean: false
        },
        extension: [
          {
            url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-DispensingInformation",
            extension: [{
              url: "dispenseStatus",
              valueCoding: {
                system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
                code: "0001",
                display: "Item fully dispensed"
              }
            }]
          },
          {
            url: "https://fhir.nhs.uk/StructureDefinition/Extension-PendingCancellation",
            extension: [{
              url: "lineItemPendingCancellation",
              valueBoolean: false
            }]
          }
        ]
      }
    }

    const actual = generateFhirResponse(prescription, logger)
    expect(actual.entry).toContainEqual(expectedMedicationRequest)
  })

  it("returns a Bundle containing a dispenser org PractitionerRole Bundle Entry resource when called with a dispensed prescription", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-123-567-890")

    const expected: PractitionerRoleBundleEntryType = {
      fullUrl: "urn:uuid:DISORG-123-567-890",
      search: {
        mode: "include"
      },
      resource:{
        resourceType: "PractitionerRole",
        id: "DISORG-123-567-890",
        organization: {
          identifier: {
            system: "https://fhir.nhs.uk/Id/ods-organization-code",
            value: "FA565"
          }
        }
      }
    }

    const actual = generateFhirResponse(parsedAcuteDispensedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expected)
  })

  it("returns a Bundle containing a contained partial MedicationRequest Bundle Entry resource called with a prescription with an item with no dosage instructions", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDREQ-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDREQ-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDREQ-444-444-444")

    const expectedMedicationRequest: MedicationRequestBundleEntryType = {
      fullUrl: "urn:uuid:MEDREQ-111-111-111",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationRequest",
        id: "MEDREQ-111-111-111",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "D37FD639-E831-420C-B37B-40481DCA910E"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "completed",
        intent: "order",
        requester: {
          reference: "urn:uuid:PRESORG-123-567-890"
        },
        performer: {
          identifier: [{
            system: "https://fhir.nhs.uk/Id/ods-organization-code",
            value: "FA565"
          }]
        },
        groupIdentifier: {
          system: "https://fhir.nhs.uk/Id/prescription-order-number",
          value: "C0C3E6-A83008-93D8FL"
        },
        medicationCodeableConcept: {
          text: "Amoxicillin 250mg capsules"
        },
        courseOfTherapyType: {
          coding: [{
            system: "http://terminology.hl7.org/CodeSystem/medicationrequest-course-of-therapy",
            code: "acute",
            display: "Short course (acute) therapy"
          }]
        },
        dispenseRequest: {
          quantity: {
            value: 20,
            unit: "tablet"
          },
          performer: {
            identifier:[{
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: "FA565"
            }]
          },
          extension: [{
            url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PerformerSiteType",
            valueCoding: {
              system: "https://fhir.nhs.uk/CodeSystem/dispensing-site-preference",
              code: "P1",
              display: "Other (e.g. Community Pharmacy)"
            }
          }]
        },
        dosageInstruction: [{
          text: ""
        }],
        substitution: {
          allowedBoolean: false
        },
        extension: [
          {
            url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-DispensingInformation",
            extension: [{
              url: "dispenseStatus",
              valueCoding: {
                system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
                code: "0001",
                display: "Item fully dispensed"
              }
            }]
          },
          {
            url: "https://fhir.nhs.uk/StructureDefinition/Extension-PendingCancellation",
            extension: [{
              url: "lineItemPendingCancellation",
              valueBoolean: false
            }]
          }
        ]
      }
    }

    const actual = generateFhirResponse(parsedAcuteWithoutOptionalDosageInstruction, logger)
    expect(actual.entry).toContainEqual(expectedMedicationRequest)
  })

  it("returns a Bundle containing a MedicationDispense Bundle Entry resource for each line item in each dispense notification when called with a dispensed prescription with cumulative dispense notifications", () => {
    /* Tests where each DN represents the current state of the dispensed items at the time of the DN (cumulative)*/

    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDREQ-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDREQ-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDREQ-444-444-444")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDDIS-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDDIS-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDDIS-444-444-444")
    mockUUID.mockImplementationOnce(() => "MEDDIS-555-555-555")
    mockUUID.mockImplementationOnce(() => "MEDDIS-666-666-666")
    mockUUID.mockImplementationOnce(() => "MEDDIS-777-777-777")
    mockUUID.mockImplementationOnce(() => "MEDDIS-888-888-888")

    const expectedMedicationDispense1: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-111-111-111",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-111-111-111",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "3CA6AF12-560E-4DB4-B419-6E0DD99BEE40"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "unknown",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0003",
            display: "Item dispensed - partial"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-111-111-111"
        }],
        medicationCodeableConcept: {
          text: "Amoxicillin 250mg capsules"
        },
        quantity: {
          value: 10,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "2 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const expectedMedicationDispense2: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-222-222-222",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-222-222-222",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "18434F2E-AAE5-4001-8BB6-005ED2D3DF23"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "unknown",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-222-222-222"
        }],
        medicationCodeableConcept: {
          text: "Co-codamol 30mg/500mg tablets"
        },
        quantity: {
          value: 20,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "2 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const expectedMedicationDispense3: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-333-333-333",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-333-333-333",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "0D73CBCD-36E9-4943-9EBE-502CA6B85216"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "unknown",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-333-333-333"
        }],
        medicationCodeableConcept: {
          text: "Pseudoephedrine hydrochloride 60mg tablets"
        },
        quantity: {
          value: 30,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "3 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const expectedMedicationDispense4: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-444-444-444",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-444-444-444",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "453F161C-3A76-42B5-BA7F-7A4EBF61023B"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "unknown",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0003",
            display: "Item dispensed - partial"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-444-444-444"
        }],
        medicationCodeableConcept: {
          text: "Azithromycin 250mg capsules"
        },
        quantity: {
          value: 20,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "3 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const expectedMedicationDispense5:MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-555-555-555",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-555-555-555",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "3CA6AF12-560E-4DB4-B419-6E0DD99BEE40"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "in-progress",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-111-111-111"
        }],
        medicationCodeableConcept: {
          text: "Amoxicillin 250mg capsules"
        },
        quantity: {
          value: 20,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "2 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const expectedMedicationDispense6: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-666-666-666",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-666-666-666",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "18434F2E-AAE5-4001-8BB6-005ED2D3DF23"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "in-progress",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-222-222-222"
        }],
        medicationCodeableConcept: {
          text: "Co-codamol 30mg/500mg tablets"
        },
        quantity: {
          value: 20,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "2 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const expectedMedicationDispense7: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-777-777-777",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-777-777-777",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "0D73CBCD-36E9-4943-9EBE-502CA6B85216"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "in-progress",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-333-333-333"
        }],
        medicationCodeableConcept: {
          text: "Pseudoephedrine hydrochloride 60mg tablets"
        },
        quantity: {
          value: 30,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "3 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const expectedMedicationDispense8: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-888-888-888",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-888-888-888",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "453F161C-3A76-42B5-BA7F-7A4EBF61023B"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "in-progress",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-444-444-444"
        }],
        medicationCodeableConcept: {
          text: "Azithromycin 250mg capsules"
        },
        quantity: {
          value: 30,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "3 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const actual = generateFhirResponse(parsedAcuteCumulativeMultipleDispenseNotifications, logger)
    const noOfMedicationDispenses = actual.entry.filter((entry) => entry.resource.resourceType === "MedicationDispense").length
    expect(noOfMedicationDispenses).toEqual(8)
    expect(actual.entry).toContainEqual(expectedMedicationDispense1)
    expect(actual.entry).toContainEqual(expectedMedicationDispense2)
    expect(actual.entry).toContainEqual(expectedMedicationDispense3)
    expect(actual.entry).toContainEqual(expectedMedicationDispense4)
    expect(actual.entry).toContainEqual(expectedMedicationDispense5)
    expect(actual.entry).toContainEqual(expectedMedicationDispense6)
    expect(actual.entry).toContainEqual(expectedMedicationDispense7)
    expect(actual.entry).toContainEqual(expectedMedicationDispense8)
  })

  it("returns a Bundle containing a MedicationDispense Bundle Entry resource for each line item in each dispense notification when called with a dispensed prescription with additive dispense notifications", () => {
    /* Tests DN's where items previously dispensed are included in subsequent DN's with 0 quantity (additive)*/

    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDREQ-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDREQ-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDREQ-444-444-444")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDDIS-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDDIS-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDDIS-444-444-444")
    mockUUID.mockImplementationOnce(() => "MEDDIS-555-555-555")
    mockUUID.mockImplementationOnce(() => "MEDDIS-666-666-666")
    mockUUID.mockImplementationOnce(() => "MEDDIS-777-777-777")
    mockUUID.mockImplementationOnce(() => "MEDDIS-888-888-888")

    const expectedMedicationDispense1: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-111-111-111",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-111-111-111",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "3CA6AF12-560E-4DB4-B419-6E0DD99BEE40"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "unknown",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0003",
            display: "Item dispensed - partial"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-111-111-111"
        }],
        medicationCodeableConcept: {
          text: "Amoxicillin 250mg capsules"
        },
        quantity: {
          value: 10,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "2 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const expectedMedicationDispense2: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-222-222-222",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-222-222-222",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "18434F2E-AAE5-4001-8BB6-005ED2D3DF23"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "unknown",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-222-222-222"
        }],
        medicationCodeableConcept: {
          text: "Co-codamol 30mg/500mg tablets"
        },
        quantity: {
          value: 20,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "2 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const expectedMedicationDispense3: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-333-333-333",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-333-333-333",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "0D73CBCD-36E9-4943-9EBE-502CA6B85216"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "unknown",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-333-333-333"
        }],
        medicationCodeableConcept: {
          text: "Pseudoephedrine hydrochloride 60mg tablets"
        },
        quantity: {
          value: 30,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "3 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const expectedMedicationDispense4: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-444-444-444",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-444-444-444",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "453F161C-3A76-42B5-BA7F-7A4EBF61023B"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "unknown",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0003",
            display: "Item dispensed - partial"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-444-444-444"
        }],
        medicationCodeableConcept: {
          text: "Azithromycin 250mg capsules"
        },
        quantity: {
          value: 20,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "3 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const expectedMedicationDispense5:MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-555-555-555",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-555-555-555",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "3CA6AF12-560E-4DB4-B419-6E0DD99BEE40"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "in-progress",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-111-111-111"
        }],
        medicationCodeableConcept: {
          text: "Amoxicillin 250mg capsules"
        },
        quantity: {
          value: 10,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "2 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const expectedMedicationDispense6: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-666-666-666",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-666-666-666",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "18434F2E-AAE5-4001-8BB6-005ED2D3DF23"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "in-progress",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-222-222-222"
        }],
        medicationCodeableConcept: {
          text: "Co-codamol 30mg/500mg tablets"
        },
        quantity: {
          value: 0,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "2 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const expectedMedicationDispense7: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-777-777-777",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-777-777-777",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "0D73CBCD-36E9-4943-9EBE-502CA6B85216"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "in-progress",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-333-333-333"
        }],
        medicationCodeableConcept: {
          text: "Pseudoephedrine hydrochloride 60mg tablets"
        },
        quantity: {
          value: 0,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "3 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const expectedMedicationDispense8: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-888-888-888",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-888-888-888",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "453F161C-3A76-42B5-BA7F-7A4EBF61023B"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "in-progress",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-444-444-444"
        }],
        medicationCodeableConcept: {
          text: "Azithromycin 250mg capsules"
        },
        quantity: {
          value: 10,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "3 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const actual = generateFhirResponse(parsedAcuteAdditiveMultipleDispenseNotifications, logger)
    const noOfMedicationDispenses = actual.entry.filter((entry) => entry.resource.resourceType === "MedicationDispense").length
    expect(noOfMedicationDispenses).toEqual(8)
    expect(actual.entry).toContainEqual(expectedMedicationDispense1)
    expect(actual.entry).toContainEqual(expectedMedicationDispense2)
    expect(actual.entry).toContainEqual(expectedMedicationDispense3)
    expect(actual.entry).toContainEqual(expectedMedicationDispense4)
    expect(actual.entry).toContainEqual(expectedMedicationDispense5)
    expect(actual.entry).toContainEqual(expectedMedicationDispense6)
    expect(actual.entry).toContainEqual(expectedMedicationDispense7)
    expect(actual.entry).toContainEqual(expectedMedicationDispense8)
  })

  it("returns a Bundle containing a MedicationDispense Bundle Entry resource for each line item in each dispense notification when called with a dispensed prescription with alt additive dispense notifications", () => {
    /* Tests DN's where items previously dispensed are not included in subsequent DN's (alt additive)*/

    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDREQ-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDREQ-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDREQ-444-444-444")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDDIS-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDDIS-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDDIS-444-444-444")
    mockUUID.mockImplementationOnce(() => "MEDDIS-555-555-555")
    mockUUID.mockImplementationOnce(() => "MEDDIS-666-666-666")

    const expectedMedicationDispense1: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-111-111-111",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-111-111-111",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "3CA6AF12-560E-4DB4-B419-6E0DD99BEE40"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "unknown",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0003",
            display: "Item dispensed - partial"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-111-111-111"
        }],
        medicationCodeableConcept: {
          text: "Amoxicillin 250mg capsules"
        },
        quantity: {
          value: 10,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "2 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const expectedMedicationDispense2: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-222-222-222",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-222-222-222",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "18434F2E-AAE5-4001-8BB6-005ED2D3DF23"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "unknown",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-222-222-222"
        }],
        medicationCodeableConcept: {
          text: "Co-codamol 30mg/500mg tablets"
        },
        quantity: {
          value: 20,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "2 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const expectedMedicationDispense3: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-333-333-333",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-333-333-333",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "0D73CBCD-36E9-4943-9EBE-502CA6B85216"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "unknown",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-333-333-333"
        }],
        medicationCodeableConcept: {
          text: "Pseudoephedrine hydrochloride 60mg tablets"
        },
        quantity: {
          value: 30,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "3 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const expectedMedicationDispense4: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-444-444-444",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-444-444-444",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "453F161C-3A76-42B5-BA7F-7A4EBF61023B"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "unknown",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0003",
            display: "Item dispensed - partial"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-444-444-444"
        }],
        medicationCodeableConcept: {
          text: "Azithromycin 250mg capsules"
        },
        quantity: {
          value: 20,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "3 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const expectedMedicationDispense5: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-555-555-555",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-555-555-555",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "3CA6AF12-560E-4DB4-B419-6E0DD99BEE40"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "in-progress",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-111-111-111"
        }],
        medicationCodeableConcept: {
          text: "Amoxicillin 250mg capsules"
        },
        quantity: {
          value: 10,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "2 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const expectedMedicationDispense6: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-666-666-666",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-666-666-666",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "453F161C-3A76-42B5-BA7F-7A4EBF61023B"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "in-progress",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-444-444-444"
        }],
        medicationCodeableConcept: {
          text: "Azithromycin 250mg capsules"
        },
        quantity: {
          value: 10,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "3 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const actual = generateFhirResponse(parsedAltAcuteAdditiveMultipleDispenseNotifications, logger)
    const noOfMedicationDispenses = actual.entry.filter((entry) => entry.resource.resourceType === "MedicationDispense").length
    expect(noOfMedicationDispenses).toEqual(6)
    expect(actual.entry).toContainEqual(expectedMedicationDispense1)
    expect(actual.entry).toContainEqual(expectedMedicationDispense2)
    expect(actual.entry).toContainEqual(expectedMedicationDispense3)
    expect(actual.entry).toContainEqual(expectedMedicationDispense4)
    expect(actual.entry).toContainEqual(expectedMedicationDispense5)
    expect(actual.entry).toContainEqual(expectedMedicationDispense6)
  })

  it("returns a Bundle containing a MedicationDispense Bundle Entry resource for each component of each line item in each dispense notification when called with a dispensed prescription", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDREQ-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDREQ-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDREQ-444-444-444")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-111-111-AAA")
    mockUUID.mockImplementationOnce(() => "MEDDIS-111-111-BBB")
    mockUUID.mockImplementationOnce(() => "MEDDIS-111-111-CCC")
    mockUUID.mockImplementationOnce(() => "MEDDIS-222-222-AAA")
    mockUUID.mockImplementationOnce(() => "MEDDIS-222-222-BBB")
    mockUUID.mockImplementationOnce(() => "MEDDIS-222-222-CCC")
    mockUUID.mockImplementationOnce(() => "MEDDIS-333-333-AAA")
    mockUUID.mockImplementationOnce(() => "MEDDIS-333-333-BBB")
    mockUUID.mockImplementationOnce(() => "MEDDIS-333-333-CCC")
    mockUUID.mockImplementationOnce(() => "MEDDIS-444-444-AAA")
    mockUUID.mockImplementationOnce(() => "MEDDIS-444-444-BBB")
    mockUUID.mockImplementationOnce(() => "MEDDIS-444-444-CCC")

    const expectedMedicationDispense1A: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-111-111-AAA",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-111-111-AAA",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "D37FD639-E831-420C-B37B-40481DCA910E"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "in-progress",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-111-111-111"
        }],
        medicationCodeableConcept: {
          text: "Amoxicillin 250mg capsules A"
        },
        quantity: {
          value: 20,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "2 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const expectedMedicationDispense1B = structuredClone(expectedMedicationDispense1A)
    expectedMedicationDispense1B.fullUrl = "urn:uuid:MEDDIS-111-111-BBB"
    expectedMedicationDispense1B.resource.id = "MEDDIS-111-111-BBB"
    expectedMedicationDispense1B.resource.medicationCodeableConcept.text = "Amoxicillin 250mg capsules B"
    const expectedMedicationDispense1C = structuredClone(expectedMedicationDispense1A)
    expectedMedicationDispense1C.fullUrl = "urn:uuid:MEDDIS-111-111-CCC"
    expectedMedicationDispense1C.resource.id = "MEDDIS-111-111-CCC"
    expectedMedicationDispense1C.resource.medicationCodeableConcept.text = "Amoxicillin 250mg capsules C"

    const expectedMedicationDispense2A: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-222-222-AAA",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-222-222-AAA",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "407685A2-A1A2-4B6B-B281-CAED41733C2B"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "in-progress",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-222-222-222"
        }],
        medicationCodeableConcept: {
          text: "Co-codamol 30mg/500mg tablets A"
        },
        quantity: {
          value: 20,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "2 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }
    const expectedMedicationDispense2B = structuredClone(expectedMedicationDispense2A)
    expectedMedicationDispense2B.fullUrl = "urn:uuid:MEDDIS-222-222-BBB"
    expectedMedicationDispense2B.resource.id = "MEDDIS-222-222-BBB"
    expectedMedicationDispense2B.resource.medicationCodeableConcept.text = "Co-codamol 30mg/500mg tablets B"
    const expectedMedicationDispense2C = structuredClone(expectedMedicationDispense2A)
    expectedMedicationDispense2C.fullUrl = "urn:uuid:MEDDIS-222-222-CCC"
    expectedMedicationDispense2C.resource.id = "MEDDIS-222-222-CCC"
    expectedMedicationDispense2C.resource.medicationCodeableConcept.text = "Co-codamol 30mg/500mg tablets C"

    const expectedMedicationDispense3A: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-333-333-AAA",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-333-333-AAA",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "20D6D69F-7BDD-4798-86DF-30F902BD2936"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "in-progress",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-333-333-333"
        }],
        medicationCodeableConcept: {
          text: "Pseudoephedrine hydrochloride 60mg tablets A"
        },
        quantity: {
          value: 30,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "3 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }
    const expectedMedicationDispense3B = structuredClone(expectedMedicationDispense3A)
    expectedMedicationDispense3B.fullUrl = "urn:uuid:MEDDIS-333-333-BBB"
    expectedMedicationDispense3B.resource.id = "MEDDIS-333-333-BBB"
    expectedMedicationDispense3B.resource.medicationCodeableConcept.text = "Pseudoephedrine hydrochloride 60mg tablets B"
    const expectedMedicationDispense3C = structuredClone(expectedMedicationDispense3A)
    expectedMedicationDispense3C.fullUrl = "urn:uuid:MEDDIS-333-333-CCC"
    expectedMedicationDispense3C.resource.id = "MEDDIS-333-333-CCC"
    expectedMedicationDispense3C.resource.medicationCodeableConcept.text = "Pseudoephedrine hydrochloride 60mg tablets C"

    const expectedMedicationDispense4A: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-444-444-AAA",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-444-444-AAA",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "BF1B0BD8-0E6D-4D90-989E-F32065200CA3"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "in-progress",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-444-444-444"
        }],
        medicationCodeableConcept: {
          text: "Azithromycin 250mg capsules A"
        },
        quantity: {
          value: 30,
          unit: "tablet"
        },
        dosageInstruction: [{
          text: "3 times a day for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }
    const expectedMedicationDispense4B = structuredClone(expectedMedicationDispense4A)
    expectedMedicationDispense4B.fullUrl = "urn:uuid:MEDDIS-444-444-BBB"
    expectedMedicationDispense4B.resource.id = "MEDDIS-444-444-BBB"
    expectedMedicationDispense4B.resource.medicationCodeableConcept.text = "Azithromycin 250mg capsules B"
    const expectedMedicationDispense4C = structuredClone(expectedMedicationDispense4A)
    expectedMedicationDispense4C.fullUrl = "urn:uuid:MEDDIS-444-444-CCC"
    expectedMedicationDispense4C.resource.id = "MEDDIS-444-444-CCC"
    expectedMedicationDispense4C.resource.medicationCodeableConcept.text = "Azithromycin 250mg capsules C"

    const actual = generateFhirResponse(parsedAcuteDispensedWithMultipleComponents, logger)
    const noOfMedicationDispenses = actual.entry.filter((entry) => entry.resource.resourceType === "MedicationDispense").length
    expect(noOfMedicationDispenses).toEqual(12)
    expect(actual.entry).toContainEqual(expectedMedicationDispense1A)
    expect(actual.entry).toContainEqual(expectedMedicationDispense1B)
    expect(actual.entry).toContainEqual(expectedMedicationDispense1C)
    expect(actual.entry).toContainEqual(expectedMedicationDispense2A)
    expect(actual.entry).toContainEqual(expectedMedicationDispense2B)
    expect(actual.entry).toContainEqual(expectedMedicationDispense2C)
    expect(actual.entry).toContainEqual(expectedMedicationDispense3A)
    expect(actual.entry).toContainEqual(expectedMedicationDispense3B)
    expect(actual.entry).toContainEqual(expectedMedicationDispense3C)
    expect(actual.entry).toContainEqual(expectedMedicationDispense4A)
    expect(actual.entry).toContainEqual(expectedMedicationDispense4B)
    expect(actual.entry).toContainEqual(expectedMedicationDispense4C)
  })

  it("returns a Bundle containing a partial MedicationDispense Bundle Entry resource when called with a prescription with a dispense notification item with no dosage instruction", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDREQ-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDREQ-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDREQ-444-444-444")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDDIS-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDDIS-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDDIS-444-444-444")
    mockUUID.mockImplementationOnce(() => "MEDDIS-555-555-555")
    mockUUID.mockImplementationOnce(() => "MEDDIS-666-666-666")
    mockUUID.mockImplementationOnce(() => "MEDDIS-777-777-777")
    mockUUID.mockImplementationOnce(() => "MEDDIS-888-888-888")

    const expectedMedicationDispense: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-111-111-111",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-111-111-111",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "D37FD639-E831-420C-B37B-40481DCA910E"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "in-progress",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-111-111-111"
        }],
        medicationCodeableConcept: {
          text: "Amoxicillin 250mg capsules"
        },
        quantity: {
          value: 20,
          unit: "tablet"
        },
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const actual = generateFhirResponse(parsedAcuteWithoutOptionalDosageInstruction, logger)
    expect(actual.entry).toContainEqual(expectedMedicationDispense)
  })

  it("returns a Bundle containing a partial MedicationDispense Bundle Entry resource when called with a prescription with a partial dispense notification", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-111-111-111")

    const mockPrescription = parseExample(acuteWithPartialDispenseNotification)

    const expectedMedicationDispense: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-111-111-111",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-111-111-111",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "101875F7-400C-43FE-AC04-7F29DBF854AF"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "in-progress",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-111-111-111"
        }],
        medicationCodeableConcept: {
          text: ""
        },
        quantity: {
          value: 0,
          unit: ""
        },
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const actual = generateFhirResponse(mockPrescription, logger)
    expect(actual.entry).toContainEqual(expectedMedicationDispense)
  })

  it("returns a Bundle containing a MedicationDispense Bundle Entry resource when called with a prescription with a 0 quantity dispense notification", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-111-111-111")

    const expectedMedicationDispense: MedicationDispenseBundleEntryType = {
      fullUrl: "urn:uuid:MEDDIS-111-111-111",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "MedicationDispense",
        id: "MEDDIS-111-111-111",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "554C9992-EF2D-4FB1-AA2B-ECCCC5BE31DC"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "in-progress",
        performer: [{
          actor: {
            reference: "urn:uuid:DISORG-123-567-890"
          }
        }],
        type: {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
            code: "0001",
            display: "Item fully dispensed"
          }]
        },
        authorizingPrescription: [{
          reference: "urn:uuid:MEDREQ-111-111-111"
        }],
        medicationCodeableConcept: {
          text: "Methotrexate 10mg/0.2ml solution for injection pre-filled syringes"
        },
        quantity: {
          value: 0,
          unit: "pre-filled disposable injection"
        },
        dosageInstruction: [{
          text: "Inject 10 milligram - 5 times a day - Subcutaneous route - for 10 days"
        }],
        extension:[{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }
        }]
      }
    }

    const actual = generateFhirResponse(parsedErdDispensedWith0Quantity, logger)
    expect(actual.entry).toContainEqual(expectedMedicationDispense)
  })

  it("returns a Bundle containg MedicationDispense Bundle entries with the correct status when called with a prescription with multiple dispense notifications", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDREQ-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDREQ-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDREQ-444-444-444")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDDIS-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDDIS-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDDIS-444-444-444")
    mockUUID.mockImplementationOnce(() => "MEDDIS-555-555-555")
    mockUUID.mockImplementationOnce(() => "MEDDIS-666-666-666")
    mockUUID.mockImplementationOnce(() => "MEDDIS-777-777-777")
    mockUUID.mockImplementationOnce(() => "MEDDIS-888-888-888")

    const actual = generateFhirResponse(parsedAcuteCumulativeMultipleDispenseNotifications, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "MedicationDispense",
        id: "MEDDIS-111-111-111",
        status: "unknown"
      })
    }))
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "MedicationDispense",
        id: "MEDDIS-222-222-222",
        status: "unknown"
      })
    }))
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "MedicationDispense",
        id: "MEDDIS-333-333-333",
        status: "unknown"
      })
    }))
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "MedicationDispense",
        id: "MEDDIS-444-444-444",
        status: "unknown"
      })
    }))
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "MedicationDispense",
        id: "MEDDIS-555-555-555",
        status: "in-progress"
      })
    }))
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "MedicationDispense",
        id: "MEDDIS-666-666-666",
        status: "in-progress"
      })
    }))
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "MedicationDispense",
        id: "MEDDIS-777-777-777",
        status: "in-progress"
      })
    }))
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "MedicationDispense",
        id: "MEDDIS-888-888-888",
        status: "in-progress"
      })
    }))
  })

  it("returns a Bundle containg MedicationDispense Bundle entries with the correct status when called with a prescription with a withdrawn dispense notification", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDDIS-222-222-222")
    const mockParsedPrescription = parseExample(acuteWithWithdrawnDispenseNotification)

    const actual = generateFhirResponse(mockParsedPrescription, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "MedicationDispense",
        id: "MEDDIS-111-111-111",
        status: "in-progress"
      })
    }))

    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "MedicationDispense",
        id: "MEDDIS-222-222-222",
        status: "unknown"
      })
    }))
  })

  it("returns a Bundle containg MedicationDispense Bundle entries with the correct status when called with a prescription with a withdrawn amendment", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDDIS-222-222-222")
    const mockParsedPrescription = parseExample(acuteWithWithdrawnAmendment)

    const actual = generateFhirResponse(mockParsedPrescription, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "MedicationDispense",
        id: "MEDDIS-111-111-111",
        status: "in-progress"
      })
    }))

    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "MedicationDispense",
        id: "MEDDIS-222-222-222",
        status: "unknown"
      })
    }))
  })

  it("returns a Bundle containg MedicationDispense Bundle entries with the correct status when called with a withdrawn prescription", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-111-111-111")
    const mockParsedPrescription = parseExample(acuteWithdrawn)

    const actual = generateFhirResponse(mockParsedPrescription, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "MedicationDispense",
        id: "MEDDIS-111-111-111",
        status: "unknown"
      })
    }))
  })

  it("returns a RequestGroup with a prescription line items Action when called", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-123-567-890")

    const expected = {
      title: "Prescription Line Items(Medications)",
      timingTiming: {
        repeat: {
          frequency: 1,
          period: 28,
          periodUnit: "d"
        }
      }
    }

    const actual = generateFhirResponse(parsedAcuteDispensedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        action: expect.arrayContaining([expect.objectContaining(expected)])
      })
    }))
  })

  it("returns a RequestGroup with a partial prescription line items Action when called with a prescription with a missing days supply", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-123-567-890")

    const prescription = {
      ...parsedAcuteDispensedWithSingleItem
    }
    delete prescription.daysSupply

    const expected = {
      title: "Prescription Line Items(Medications)"
    }

    const notExpected = {
      title: "Prescription Line Items(Medications)",
      timingTiming: {
        repeat: {
          frequency: 1,
          period: 28,
          periodUnit: "d"
        }
      }
    }

    const actual = generateFhirResponse(prescription, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        action: expect.arrayContaining([expect.objectContaining(expected)])
      })
    }))

    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        action: expect.arrayContaining([expect.not.objectContaining(notExpected)])
      })
    }))
  })

  it("returns a RequestGroup with a reference Action for each line item when called", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDREQ-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDREQ-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDREQ-444-444-444")

    const expected = [
      {
        resource: {
          reference: "urn:uuid:MEDREQ-111-111-111"
        }
      },
      {
        resource: {
          reference: "urn:uuid:MEDREQ-222-222-222"
        }
      },
      {
        resource: {
          reference: "urn:uuid:MEDREQ-333-333-333"
        }
      },
      {
        resource: {
          reference: "urn:uuid:MEDREQ-444-444-444"
        }
      }
    ]

    const actual = generateFhirResponse(parsedAcuteCreatedWithMultipleItems, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        action: expect.arrayContaining([expect.objectContaining({
          title: "Prescription Line Items(Medications)",
          action: expected
        })])
      })
    }))

  })

  it("returns a RequestGroup with a history Action when called", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-123-567-890")

    const expected = {
      title: "Prescription status transitions"
    }

    const actual = generateFhirResponse(parsedAcuteDispensedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        action: expect.arrayContaining([expect.objectContaining(expected)])
      })
    }))
  })

  it("returns a RequestGroup with a event Action for each filtered history event within the history Action when called", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-123-567-890")

    const expectedEvents: HistoryAction["action"] = [
      {
        title: "Prescription upload successful",
        timingDateTime: "2025-04-29T13:26:34.000Z",
        code: [{
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0001",
            display: "To be Dispensed"
          }]
        }],
        participant: [{
          extension: [{
            url: "http://hl7.org/fhir/5.0/StructureDefinition/extension-RequestOrchestration.action.participant.typeReference",
            valueReference: {
              identifier: {
                system: "https://fhir.nhs.uk/Id/ods-organization-code",
                value: "A83008"
              }
            }
          }]
        }]
      },
      {
        title: "Release Request successful",
        timingDateTime: "2025-04-29T13:26:45.000Z",
        code: [{
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0002",
            display: "With Dispenser"
          }]
        }],
        participant: [{
          extension: [{
            url: "http://hl7.org/fhir/5.0/StructureDefinition/extension-RequestOrchestration.action.participant.typeReference",
            valueReference: {
              identifier: {
                system: "https://fhir.nhs.uk/Id/ods-organization-code",
                value: "VNFKT"
              }
            }
          }]
        }]
      },
      {
        title: "Dispense notification successful",
        timingDateTime: "2025-04-29T13:27:04.000Z",
        code: [
          {
            coding: [{
              system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
              code: "0006",
              display: "Dispensed"
            }]
          },
          {
            coding: [{
              system: "https://tools.ietf.org/html/rfc4122",
              code: "2416B1D1-82D3-4D14-BB34-1F3C6B57CFFB"
            }]
          }
        ],
        participant: [{
          extension: [{
            url: "http://hl7.org/fhir/5.0/StructureDefinition/extension-RequestOrchestration.action.participant.typeReference",
            valueReference: {
              identifier: {
                system: "https://fhir.nhs.uk/Id/ods-organization-code",
                value: "FA565"
              }
            }
          }]
        }],
        action: [{
          resource: {
            reference: "urn:uuid:MEDDIS-123-567-890"
          }
        }]
      }
    ]

    const actual = generateFhirResponse(parsedAcuteDispensedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        action: expect.arrayContaining([expect.objectContaining({
          title: "Prescription status transitions",
          action: expectedEvents
        })])
      })
    }))

  })

  it("returns Dispense Notification history actions with correct references when called with a prescription with culmative dispense notifications", () => {
    /* Tests where each DN represents the current state of the dispensed items at the time of the DN (cumulative)*/

    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDREQ-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDREQ-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDREQ-444-444-444")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDDIS-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDDIS-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDDIS-444-444-444")
    mockUUID.mockImplementationOnce(() => "MEDDIS-555-555-555")
    mockUUID.mockImplementationOnce(() => "MEDDIS-666-666-666")
    mockUUID.mockImplementationOnce(() => "MEDDIS-777-777-777")
    mockUUID.mockImplementationOnce(() => "MEDDIS-888-888-888")

    const expectedAction1: HistoryAction["action"][0] = {
      title: "Dispense notification successful",
      timingDateTime: "2025-04-24T11:45:32.000Z",
      code: [
        {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0003",
            display: "With Dispenser - Active"
          }]
        },
        {
          coding: [{
            system: "https://tools.ietf.org/html/rfc4122",
            code: "42A6A1A0-596C-482C-B018-0D15F8FFF9F3"
          }]
        }
      ],
      participant: [{
        extension: [{
          url: "http://hl7.org/fhir/5.0/StructureDefinition/extension-RequestOrchestration.action.participant.typeReference",
          valueReference: {
            identifier: {
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: "FA565"
            }
          }
        }]
      }],
      action: [
        {
          resource: {
            reference: "urn:uuid:MEDDIS-111-111-111"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-222-222-222"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-333-333-333"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-444-444-444"
          }
        }
      ]
    }

    const expectedAction2: HistoryAction["action"][0] = {
      title: "Dispense notification successful",
      timingDateTime: "2025-04-24T11:49:41.000Z",
      code: [
        {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }]
        },
        {
          coding: [{
            system: "https://tools.ietf.org/html/rfc4122",
            code: "B358A55E-A423-48E2-A9D8-2612B4E66604"
          }]
        }
      ],
      participant: [{
        extension: [{
          url: "http://hl7.org/fhir/5.0/StructureDefinition/extension-RequestOrchestration.action.participant.typeReference",
          valueReference: {
            identifier: {
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: "FA565"
            }
          }
        }]
      }],
      action: [
        {
          resource: {
            reference: "urn:uuid:MEDDIS-555-555-555"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-666-666-666"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-777-777-777"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-888-888-888"
          }
        }
      ]
    }

    const actual = generateFhirResponse(parsedAcuteCumulativeMultipleDispenseNotifications, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        action: expect.arrayContaining([expect.objectContaining({
          title: "Prescription status transitions",
          action: expect.arrayContaining([expectedAction1])
        })])
      })
    }))

    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        action: expect.arrayContaining([expect.objectContaining({
          title: "Prescription status transitions",
          action: expect.arrayContaining([expectedAction2])
        })])
      })
    }))
  })

  it("returns Dispense Notification history actions with correct references when called with a prescription with dispense notifications containing multiple components", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDREQ-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDREQ-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDREQ-444-444-444")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-111-111-AAA")
    mockUUID.mockImplementationOnce(() => "MEDDIS-111-111-BBB")
    mockUUID.mockImplementationOnce(() => "MEDDIS-111-111-CCC")
    mockUUID.mockImplementationOnce(() => "MEDDIS-222-222-AAA")
    mockUUID.mockImplementationOnce(() => "MEDDIS-222-222-BBB")
    mockUUID.mockImplementationOnce(() => "MEDDIS-222-222-CCC")
    mockUUID.mockImplementationOnce(() => "MEDDIS-333-333-AAA")
    mockUUID.mockImplementationOnce(() => "MEDDIS-333-333-BBB")
    mockUUID.mockImplementationOnce(() => "MEDDIS-333-333-CCC")
    mockUUID.mockImplementationOnce(() => "MEDDIS-444-444-AAA")
    mockUUID.mockImplementationOnce(() => "MEDDIS-444-444-BBB")
    mockUUID.mockImplementationOnce(() => "MEDDIS-444-444-CCC")

    const expectedAction1: HistoryAction["action"][0] = {
      title: "Dispense notification successful",
      timingDateTime: "2025-04-24T11:16:02.000Z",
      code: [
        {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }]
        },
        {
          coding: [{
            system: "https://tools.ietf.org/html/rfc4122",
            code: "DF525024-FD4E-4292-9FF6-B67025791B69"
          }]
        }
      ],
      participant: [{
        extension: [{
          url: "http://hl7.org/fhir/5.0/StructureDefinition/extension-RequestOrchestration.action.participant.typeReference",
          valueReference: {
            identifier: {
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: "FA565"
            }
          }
        }]
      }],
      action: [
        {
          resource: {
            reference: "urn:uuid:MEDDIS-111-111-AAA"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-111-111-BBB"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-111-111-CCC"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-222-222-AAA"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-222-222-BBB"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-222-222-CCC"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-333-333-AAA"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-333-333-BBB"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-333-333-CCC"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-444-444-AAA"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-444-444-BBB"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-444-444-CCC"
          }
        }
      ]
    }

    const actual = generateFhirResponse(parsedAcuteDispensedWithMultipleComponents, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        action: expect.arrayContaining([expect.objectContaining({
          title: "Prescription status transitions",
          action: expect.arrayContaining([expectedAction1])
        })])
      })
    }))
  })

  it("returns Dispense Notification history actions with correct references when called with a prescription with additive dispense notifications", () => {
    /* Tests DN's where items previously dispensed are included in subsequent DN's with 0 quantity (additive)*/

    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDREQ-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDREQ-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDREQ-444-444-444")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDDIS-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDDIS-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDDIS-444-444-444")
    mockUUID.mockImplementationOnce(() => "MEDDIS-555-555-555")
    mockUUID.mockImplementationOnce(() => "MEDDIS-666-666-666")
    mockUUID.mockImplementationOnce(() => "MEDDIS-777-777-777")
    mockUUID.mockImplementationOnce(() => "MEDDIS-888-888-888")

    const expectedAction1: HistoryAction["action"][0] = {
      title: "Dispense notification successful",
      timingDateTime: "2025-04-24T11:45:32.000Z",
      code: [
        {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0003",
            display: "With Dispenser - Active"
          }]
        },
        {
          coding: [{
            system: "https://tools.ietf.org/html/rfc4122",
            code: "42A6A1A0-596C-482C-B018-0D15F8FFF9F3"
          }]
        }
      ],
      participant: [{
        extension: [{
          url: "http://hl7.org/fhir/5.0/StructureDefinition/extension-RequestOrchestration.action.participant.typeReference",
          valueReference: {
            identifier: {
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: "FA565"
            }
          }
        }]
      }],
      action: [
        {
          resource: {
            reference: "urn:uuid:MEDDIS-111-111-111"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-222-222-222"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-333-333-333"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-444-444-444"
          }
        }
      ]
    }

    const expectedAction2: HistoryAction["action"][0] = {
      title: "Dispense notification successful",
      timingDateTime: "2025-04-24T11:49:41.000Z",
      code: [
        {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }]
        },
        {
          coding: [{
            system: "https://tools.ietf.org/html/rfc4122",
            code: "B358A55E-A423-48E2-A9D8-2612B4E66604"
          }]
        }
      ],
      participant: [{
        extension: [{
          url: "http://hl7.org/fhir/5.0/StructureDefinition/extension-RequestOrchestration.action.participant.typeReference",
          valueReference: {
            identifier: {
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: "FA565"
            }
          }
        }]
      }],
      action: [
        {
          resource: {
            reference: "urn:uuid:MEDDIS-555-555-555"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-666-666-666"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-777-777-777"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-888-888-888"
          }
        }
      ]
    }

    const actual = generateFhirResponse(parsedAcuteAdditiveMultipleDispenseNotifications, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        action: expect.arrayContaining([expect.objectContaining({
          title: "Prescription status transitions",
          action: expect.arrayContaining([expectedAction1])
        })])
      })
    }))

    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        action: expect.arrayContaining([expect.objectContaining({
          title: "Prescription status transitions",
          action: expect.arrayContaining([expectedAction2])
        })])
      })
    }))
  })

  it("returns Dispense Notification history actions with correct references when called with a prescription with alt additive dispense notifications", () => {
    /* Tests DN's where items previously dispensed are not included in subsequent DN's (alt additive)*/

    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDREQ-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDREQ-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDREQ-444-444-444")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDDIS-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDDIS-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDDIS-444-444-444")
    mockUUID.mockImplementationOnce(() => "MEDDIS-555-555-555")
    mockUUID.mockImplementationOnce(() => "MEDDIS-666-666-666")

    const expectedAction1: HistoryAction["action"][0] = {
      title: "Dispense notification successful",
      timingDateTime: "2025-04-24T11:45:32.000Z",
      code: [
        {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0003",
            display: "With Dispenser - Active"
          }]
        },
        {
          coding: [{
            system: "https://tools.ietf.org/html/rfc4122",
            code: "42A6A1A0-596C-482C-B018-0D15F8FFF9F3"
          }]
        }
      ],
      participant: [{
        extension: [{
          url: "http://hl7.org/fhir/5.0/StructureDefinition/extension-RequestOrchestration.action.participant.typeReference",
          valueReference: {
            identifier: {
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: "FA565"
            }
          }
        }]
      }],
      action: [
        {
          resource: {
            reference: "urn:uuid:MEDDIS-111-111-111"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-222-222-222"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-333-333-333"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-444-444-444"
          }
        }
      ]
    }

    const expectedAction2: HistoryAction["action"][0] = {
      title: "Dispense notification successful",
      timingDateTime: "2025-04-24T11:49:41.000Z",
      code: [
        {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }]
        },
        {
          coding: [{
            system: "https://tools.ietf.org/html/rfc4122",
            code: "B358A55E-A423-48E2-A9D8-2612B4E66604"
          }]
        }
      ],
      participant: [{
        extension: [{
          url: "http://hl7.org/fhir/5.0/StructureDefinition/extension-RequestOrchestration.action.participant.typeReference",
          valueReference: {
            identifier: {
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: "FA565"
            }
          }
        }]
      }],
      action: [
        {
          resource: {
            reference: "urn:uuid:MEDDIS-555-555-555"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-666-666-666"
          }
        }
      ]
    }

    const actual = generateFhirResponse(parsedAltAcuteAdditiveMultipleDispenseNotifications, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        action: expect.arrayContaining([expect.objectContaining({
          title: "Prescription status transitions",
          action: expect.arrayContaining([expectedAction1])
        })])
      })
    }))

    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        action: expect.arrayContaining([expect.objectContaining({
          title: "Prescription status transitions",
          action: expect.arrayContaining([expectedAction2])
        })])
      })
    }))
  })

  it("returns a Dispense Notification history action with a correct reference when called with a prescription with a 0 quantity dispense notification", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-123-567-890")

    const expectedAction: HistoryAction["action"][0] = {
      title: "Dispense notification successful",
      timingDateTime: "2025-06-09T12:10:05.000Z",
      code: [
        {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }]
        },
        {
          coding: [{
            system: "https://tools.ietf.org/html/rfc4122",
            code: "CF4A3D45-F91F-46E5-B8BF-3F0F8BCC131D"
          }]
        }
      ],
      participant: [{
        extension: [{
          url: "http://hl7.org/fhir/5.0/StructureDefinition/extension-RequestOrchestration.action.participant.typeReference",
          valueReference: {
            identifier: {
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: "FG897"
            }
          }
        }]
      }],
      action: [{
        resource: {
          reference: "urn:uuid:MEDDIS-123-567-890"
        }
      }]
    }

    const actual = generateFhirResponse(parsedErdDispensedWith0Quantity, logger)

    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        action: expect.arrayContaining([expect.objectContaining({
          title: "Prescription status transitions",
          action: expect.arrayContaining([expectedAction])
        })])
      })
    }))
  })

  it("returns a Dispense Notification history action with a correct reference when called with a prescription with a dispense notification with mismatched ID's", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-123-567-890")

    const mockPrescription: Prescription = parseExample(acuteDispensedWithMismatchedIds)

    const expectedAction: HistoryAction["action"][0] = {
      title: "Dispense notification successful",
      timingDateTime: "2025-04-29T13:27:04.000Z",
      code: [
        {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }]
        },
        {
          coding: [{
            system: "https://tools.ietf.org/html/rfc4122",
            code: "2416B1D1-82D3-4D14-BB34-1F3C6B57CFFB"
          }]
        }
      ],
      participant: [{
        extension: [{
          url: "http://hl7.org/fhir/5.0/StructureDefinition/extension-RequestOrchestration.action.participant.typeReference",
          valueReference: {
            identifier: {
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: "FA565"
            }
          }
        }]
      }],
      action: [{
        resource: {
          reference: "urn:uuid:MEDDIS-123-567-890"
        }
      }]
    }

    const actual = generateFhirResponse(mockPrescription, logger)

    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        action: expect.arrayContaining([expect.objectContaining({
          title: "Prescription status transitions",
          action: expect.arrayContaining([expectedAction])
        })])
      })
    }))
  })

  it("returns Dispense Notification history actions with correct references when called with a prescription with multiple dispense notificiations with mismatched ID's", () => {

    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDREQ-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDREQ-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDREQ-444-444-444")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-111-111-111")
    mockUUID.mockImplementationOnce(() => "MEDDIS-222-222-222")
    mockUUID.mockImplementationOnce(() => "MEDDIS-333-333-333")
    mockUUID.mockImplementationOnce(() => "MEDDIS-444-444-444")
    mockUUID.mockImplementationOnce(() => "MEDDIS-555-555-555")
    mockUUID.mockImplementationOnce(() => "MEDDIS-666-666-666")
    mockUUID.mockImplementationOnce(() => "MEDDIS-777-777-777")
    mockUUID.mockImplementationOnce(() => "MEDDIS-888-888-888")

    const mockPrescription: Prescription = parseExample(acuteMultipleDispenseNotificationsWithMismatchedIds)

    const expectedAction1: HistoryAction["action"][0] = {
      title: "Dispense notification successful",
      timingDateTime: "2025-04-24T11:45:32.000Z",
      code: [
        {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0003",
            display: "With Dispenser - Active"
          }]
        },
        {
          coding: [{
            system: "https://tools.ietf.org/html/rfc4122",
            code: "42A6A1A0-596C-482C-B018-0D15F8FFF9F3"
          }]
        }
      ],
      participant: [{
        extension: [{
          url: "http://hl7.org/fhir/5.0/StructureDefinition/extension-RequestOrchestration.action.participant.typeReference",
          valueReference: {
            identifier: {
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: "FA565"
            }
          }
        }]
      }],
      action: [
        {
          resource: {
            reference: "urn:uuid:MEDDIS-111-111-111"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-222-222-222"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-333-333-333"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-444-444-444"
          }
        }
      ]
    }

    const expectedAction2: HistoryAction["action"][0] = {
      title: "Dispense notification successful",
      timingDateTime: "2025-04-24T11:49:41.000Z",
      code: [
        {
          coding: [{
            system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
            code: "0006",
            display: "Dispensed"
          }]
        },
        {
          coding: [{
            system: "https://tools.ietf.org/html/rfc4122",
            code: "B358A55E-A423-48E2-A9D8-2612B4E66604"
          }]
        }
      ],
      participant: [{
        extension: [{
          url: "http://hl7.org/fhir/5.0/StructureDefinition/extension-RequestOrchestration.action.participant.typeReference",
          valueReference: {
            identifier: {
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: "FA565"
            }
          }
        }]
      }],
      action: [
        {
          resource: {
            reference: "urn:uuid:MEDDIS-555-555-555"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-666-666-666"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-777-777-777"
          }
        },
        {
          resource: {
            reference: "urn:uuid:MEDDIS-888-888-888"
          }
        }
      ]
    }

    const actual = generateFhirResponse(mockPrescription, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        action: expect.arrayContaining([expect.objectContaining({
          title: "Prescription status transitions",
          action: expect.arrayContaining([expectedAction1])
        })])
      })
    }))

    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        action: expect.arrayContaining([expect.objectContaining({
          title: "Prescription status transitions",
          action: expect.arrayContaining([expectedAction2])
        })])
      })
    }))
  })
})
