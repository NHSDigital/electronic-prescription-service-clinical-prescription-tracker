/* eslint-disable max-len */

import {Logger} from "@aws-lambda-powertools/logger"
import {jest} from "@jest/globals"
import {Prescription} from "../src/parseSpineResponse"
import {PatientBundleEntryType} from "../src/schema/patient"
import {
  MedicationRepeatInformationExtensionType,
  PendingCancellationExtensionType,
  PrescriptionStatusExtensionType
} from "@cpt-common/common-types/schema"
import {PrescriptionTypeExtensionType} from "../src/schema/extensions"
import {HistoryAction} from "../src/schema/actions"
import {RequestGroupBundleEntryType} from "../src/schema/requestGroup"
import {MedicationRequestBundleEntryType} from "../src/schema/medicationRequest"
import {PractitionerRoleBundleEntryType} from "../src/schema/practitionerRole"
import {MedicationDispenseBundleEntryType} from "../src/schema/medicationDispense"

const logger: Logger = new Logger({serviceName: "clinicalView", logLevel: "DEBUG"})

const mockUUID = jest.fn()
jest.unstable_mockModule("crypto", () => {
  return {
    default: jest.fn(),
    randomUUID: mockUUID
  }
})

const {generateFhirResponse} = await import("../src/generateFhirResponse")

const acuteDispensedWithSingleItem: Prescription = {
  prescriptionId: "EA1CBC-A83008-F1F8A8",
  nhsNumber: "5839945242",
  prefix: "MS",
  suffix: "OBE",
  given: "STACEY",
  family: "TWITCHETT",
  birthDate: "1948-04-30",
  gender: 2,
  address: {
    line: [
      "10 HEATHFIELD",
      "COBHAM",
      "SURREY"
    ],
    postalCode: "KT11 2QY"
  },
  issueDate: "2025-04-29T00:00:00.000Z",
  issueNumber: 1,
  status: "0006",
  prescriptionPendingCancellation: false,
  treatmentType: "0001",
  prescriptionType: "0101",
  daysSupply: 28,
  prescriberOrg: "A83008",
  nominatedDispenserOrg: "FA565",
  nominatedDisperserType: "P1",
  dispenserOrg: "FA565",
  lineItems: {
    1: {
      lineItemNo: "1",
      lineItemId: "101875F7-400C-43FE-AC04-7F29DBF854AF",
      status: "0001",
      itemName: "Amoxicillin 250mg capsules",
      quantity: 20,
      quantityForm: "tablet",
      dosageInstruction: "2 times a day for 10 days",
      pendingCancellation: false
    }
  },
  dispenseNotifications: {
    "2416B1D1-82D3-4D14-BB34-1F3C6B57CFFB": {
      dispenseNotificationId: "2416B1D1-82D3-4D14-BB34-1F3C6B57CFFB",
      timestamp: "2025-04-29T13:26:57.000Z",
      status: "0006",
      lineItems: {
        1: {
          lineItemNo: "1",
          lineItemId: "101875F7-400C-43FE-AC04-7F29DBF854AF",
          status: "0001",
          itemName: "Amoxicillin 250mg capsules",
          quantity: 20,
          quantityForm: "tablet"
        }
      }
    }
  },
  history: {
    2: {
      eventId: "2",
      message: "Prescription upload successful",
      messageId: "09843173-D677-401D-9331-5CCB37768320",
      timestamp: "2025-04-29T13:26:34.000Z",
      org: "A83008",
      newStatus: "0001",
      isDispenseNotification: false
    },
    3: {
      eventId: "3",
      message: "Release Request successful",
      messageId: "9ECCD950-623A-4821-81DE-774020DE0331",
      timestamp: "2025-04-29T13:26:45.000Z",
      org: "VNFKT",
      newStatus: "0002",
      isDispenseNotification: false
    },
    4: {
      eventId: "4",
      message: "Dispense notification successful",
      messageId: "2416B1D1-82D3-4D14-BB34-1F3C6B57CFFB",
      timestamp: "2025-04-29T13:27:04.000Z",
      org: "FA565",
      newStatus: "0006",
      isDispenseNotification: true
    }
  }
}

const acuteCreatedWithMultipleItems: Prescription = {
  prescriptionId: "C0C3E6-A83008-93D8FL",
  nhsNumber: "5839945242",
  prefix: "MS",
  given: "STACEY",
  suffix: "OBE",
  family: "TWITCHETT",
  birthDate: "1948-04-30",
  gender: 2,
  address: {
    line: [
      "10 HEATHFIELD",
      "COBHAM",
      "SURREY"
    ],
    postalCode: "KT11 2QY"
  },
  issueDate: "2025-04-24T00:00:00.000Z",
  issueNumber: 1,
  status: "0001",
  prescriptionPendingCancellation: false,
  treatmentType: "0001",
  prescriptionType: "0101",
  daysSupply: 28,
  prescriberOrg: "A83008",
  nominatedDispenserOrg: "FA565",
  nominatedDisperserType: "P1",
  lineItems: {
    1: {
      lineItemNo: "1",
      lineItemId: "D37FD639-E831-420C-B37B-40481DCA910E",
      status: "0007",
      itemName: "Amoxicillin 250mg capsules",
      quantity: 20,
      quantityForm: "tablet",
      dosageInstruction: "2 times a day for 10 days",
      pendingCancellation: false
    },
    2: {
      lineItemNo: "2",
      lineItemId: "407685A2-A1A2-4B6B-B281-CAED41733C2B",
      status: "0007",
      itemName: "Co-codamol 30mg/500mg tablets",
      quantity: 20,
      quantityForm: "tablet",
      dosageInstruction: "2 times a day for 10 days",
      pendingCancellation: false
    },
    3: {
      lineItemNo: "3",
      lineItemId: "20D6D69F-7BDD-4798-86DF-30F902BD2936",
      status: "0007",
      itemName: "Pseudoephedrine hydrochloride 60mg tablets",
      quantity: 30,
      quantityForm: "tablet",
      dosageInstruction: "3 times a day for 10 days",
      pendingCancellation: false
    },
    4: {
      lineItemNo: "4",
      lineItemId: "BF1B0BD8-0E6D-4D90-989E-F32065200CA3",
      status: "0007",
      itemName: "Azithromycin 250mg capsules",
      quantity: 30,
      quantityForm: "tablet",
      dosageInstruction: "3 times a day for 10 days",
      pendingCancellation: false
    }
  },
  dispenseNotifications: {},
  history: {
    2: {
      eventId: "2",
      message: "Prescription upload successful",
      messageId: "F1204DE7-9434-4EDE-B1A2-ACB849891919",
      timestamp: "2025-04-24T11:10:05.000Z",
      org: "A83008",
      newStatus: "0001",
      isDispenseNotification: false
    }
  }
}

const acuteWithMultipleDispenseNotifications: Prescription = {
  prescriptionId: "CF5D04-A83008-7374CW",
  nhsNumber: "5839945242",
  prefix: "MS",
  given: "STACEY",
  family: "TWITCHETT",
  birthDate: "1948-04-30",
  gender: 2,
  address: {
    line: [
      "10 HEATHFIELD",
      "COBHAM",
      "SURREY"
    ],
    postalCode: "KT11 2QY"
  },
  issueDate: "2025-04-24T00:00:00.000Z",
  issueNumber: 1,
  status: "0006",
  prescriptionPendingCancellation: false,
  treatmentType: "0001",
  prescriptionType: "0101",
  daysSupply: 28,
  prescriberOrg: "A83008",
  nominatedDispenserOrg: "FA565",
  nominatedDisperserType: "P1",
  dispenserOrg: "FA565",
  lineItems: {
    1: {
      lineItemNo: "1",
      lineItemId: "3CA6AF12-560E-4DB4-B419-6E0DD99BEE40",
      status: "0001",
      itemName: "Amoxicillin 250mg capsules",
      quantity: 20,
      quantityForm: "tablet",
      dosageInstruction: "2 times a day for 10 days",
      pendingCancellation: false
    },
    2: {
      lineItemNo: "2",
      lineItemId: "18434F2E-AAE5-4001-8BB6-005ED2D3DF23",
      status: "0001",
      itemName: "Co-codamol 30mg/500mg tablets",
      quantity: 20,
      quantityForm: "tablet",
      dosageInstruction: "2 times a day for 10 days",
      pendingCancellation: false
    },
    3: {
      lineItemNo: "3",
      lineItemId: "0D73CBCD-36E9-4943-9EBE-502CA6B85216",
      status: "0001",
      itemName: "Pseudoephedrine hydrochloride 60mg tablets",
      quantity: 30,
      quantityForm: "tablet",
      dosageInstruction: "3 times a day for 10 days",
      pendingCancellation: false
    },
    4: {
      lineItemNo: "4",
      lineItemId: "453F161C-3A76-42B5-BA7F-7A4EBF61023B",
      status: "0001",
      itemName: "Azithromycin 250mg capsules",
      quantity: 30,
      quantityForm: "tablet",
      dosageInstruction: "3 times a day for 10 days",
      pendingCancellation: false
    }
  },
  dispenseNotifications: {
    "42A6A1A0-596C-482C-B018-0D15F8FFF9F3": {
      dispenseNotificationId: "42A6A1A0-596C-482C-B018-0D15F8FFF9F3",
      timestamp: "2025-04-24T11:45:17.000Z",
      status: "0003",
      lineItems: {
        1: {
          lineItemNo: "1",
          lineItemId: "3CA6AF12-560E-4DB4-B419-6E0DD99BEE40",
          status: "0003",
          itemName: "Amoxicillin 250mg capsules",
          quantity: 10,
          quantityForm: "tablet",
          dosageInstruction: "2 times a day for 10 days"
        },
        2: {
          lineItemNo: "2",
          lineItemId: "18434F2E-AAE5-4001-8BB6-005ED2D3DF23",
          status: "0001",
          itemName: "Co-codamol 30mg/500mg tablets",
          quantity: 20,
          quantityForm: "tablet",
          dosageInstruction: "2 times a day for 10 days"
        },
        3: {
          lineItemNo: "3",
          lineItemId: "0D73CBCD-36E9-4943-9EBE-502CA6B85216",
          status: "0001",
          itemName: "Pseudoephedrine hydrochloride 60mg tablets",
          quantity: 30,
          quantityForm: "tablet",
          dosageInstruction: "3 times a day for 10 days"
        },
        4: {
          lineItemNo: "4",
          lineItemId: "453F161C-3A76-42B5-BA7F-7A4EBF61023B",
          status: "0001",
          itemName: "Azithromycin 250mg capsules",
          quantity: 30,
          quantityForm: "tablet",
          dosageInstruction: "3 times a day for 10 days"
        }
      }
    },
    "B358A55E-A423-48E2-A9D8-2612B4E66604": {
      dispenseNotificationId: "B358A55E-A423-48E2-A9D8-2612B4E66604",
      timestamp: "2025-04-24T11:49:31.000Z",
      status: "0006",
      lineItems: {
        1: {
          lineItemNo: "1",
          lineItemId: "3CA6AF12-560E-4DB4-B419-6E0DD99BEE40",
          status: "0001",
          itemName: "Amoxicillin 250mg capsules",
          quantity: 10,
          quantityForm: "tablet",
          dosageInstruction: "2 times a day for 10 days"
        }
      }
    }
  },
  history: {
    2: {
      eventId: "2",
      message: "Prescription upload successful",
      messageId: "345FC11F-FF5C-4AE2-9FD6-A3F20FDB849A",
      timestamp: "2025-04-24T11:44:57.000Z",
      org: "A83008",
      newStatus: "0001",
      isDispenseNotification: false
    },
    3: {
      eventId: "3",
      message: "Release Request successful",
      messageId: "E2463A18-C098-4B2A-B723-1D7779DEAA26",
      timestamp: "2025-04-24T11:45:12.000Z",
      org: "VNFKT",
      newStatus: "0002",
      isDispenseNotification: false
    },
    4: {
      eventId: "4",
      message: "Dispense notification successful",
      messageId: "42A6A1A0-596C-482C-B018-0D15F8FFF9F3",
      timestamp: "2025-04-24T11:45:32.000Z",
      org: "FA565",
      newStatus: "0003",
      isDispenseNotification: true
    },
    5: {
      eventId: "5",
      message: "Dispense notification successful",
      messageId: "B358A55E-A423-48E2-A9D8-2612B4E66604",
      timestamp: "2025-04-24T11:49:41.000Z",
      org: "FA565",
      newStatus: "0006",
      isDispenseNotification: true
    }
  }
}

describe("Test generateFhirResponse", () => {
  beforeEach(() => {
    mockUUID.mockImplementationOnce(() => "PATIENT-123-567-890")
    mockUUID.mockImplementationOnce(() => "RGROUP-123-567-890")
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it("returns a Bundle called", () => {
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-123-567-890")

    const expected = {
      resourceType: "Bundle",
      type: "searchset",
      total: 1
    }

    const actual = generateFhirResponse(acuteDispensedWithSingleItem, logger)
    expect(actual).toEqual(expect.objectContaining(expected))
  })

  it("returns a Bundle containing a RequestGroup Bundle Entry resource when called", () => {
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-123-567-890")

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

    const actual = generateFhirResponse(acuteDispensedWithSingleItem, logger)
    logger.info("", {thing: actual})
    expect(actual.entry).toContainEqual(expect.objectContaining(expected))
  })

  it("returns a Bundle containing Patient Bundle Entry resource when called", () => {
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
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

    const actual = generateFhirResponse(acuteDispensedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expected)
  })

  const partialPatientTestCases = [
    {
      patientDetails: {
        nhsNumber: "5839945242",
        birthDate: "1948-04-30",
        gender: 2,
        address: {
          line: [
            "10 HEATHFIELD",
            "COBHAM",
            "SURREY"
          ],
          postalCode: "KT11 2QY"
        }
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
        nhsNumber: "5839945242",
        prefix: "MS",
        suffix: "OBE",
        given: "STACEY",
        family: "TWITCHETT",
        birthDate: "1948-04-30",
        gender: 2,
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
        nhsNumber: "5839945242",
        prefix: "MS",
        suffix: "OBE",
        given: "STACEY",
        family: "TWITCHETT",
        birthDate: "1948-04-30",
        gender: 2,
        address: {
          line: [
            "10 HEATHFIELD",
            "COBHAM",
            "SURREY"
          ]
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
        nhsNumber: "5839945242",
        prefix: "MS",
        suffix: "OBE",
        given: "STACEY",
        family: "TWITCHETT",
        birthDate: "1948-04-30",
        gender: 2,
        address: {
          line: []
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
        nhsNumber: "5839945242",
        prefix: "MS",
        suffix: "OBE",
        given: "STACEY",
        family: "TWITCHETT",
        birthDate: "1948-04-30",
        address: {
          line: [
            "10 HEATHFIELD",
            "COBHAM",
            "SURREY"
          ],
          postalCode: "KT11 2QY"
        }
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
      mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
      mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
      mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
      mockUUID.mockImplementationOnce(() => "MEDDIS-123-567-890")

      const acuteDispensedWithIncompletePatientDetails = {
        ...patientDetails,
        prescriptionId: "EA1CBC-A83008-F1F8A8",
        issueDate: "2025-04-29T00:00:00.000Z",
        issueNumber: 1,
        status: "0006",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false,
        treatmentType: "0001",
        prescriptionType: "0101",
        daysSupply: 28,
        prescriberOrg: "A83008",
        nominatedDispenserOrg: "FA565",
        nominatedDisperserType: "P1",
        dispenserOrg: "FA565",
        lineItems: {
          1: {
            lineItemNo: "1",
            lineItemId: "101875F7-400C-43FE-AC04-7F29DBF854AF",
            status: "0001",
            itemName: "Amoxicillin 250mg capsules",
            quantity: 20,
            quantityForm: "tablet",
            dosageInstruction: "2 times a day for 10 days",
            pendingCancellation: false
          }
        },
        dispenseNotifications: {
          "2416B1D1-82D3-4D14-BB34-1F3C6B57CFFB": {
            dispenseNotificationId: "2416B1D1-82D3-4D14-BB34-1F3C6B57CFFB",
            timestamp: "2025-04-29T13:26:57.000Z",
            status: "0006",
            lineItems: {
              1: {
                lineItemNo: "1",
                lineItemId: "101875F7-400C-43FE-AC04-7F29DBF854AF",
                status: "0001",
                itemName: "Amoxicillin 250mg capsules",
                quantity: 20,
                quantityForm: "tablet"
              }
            }
          }
        },
        history: {
          2: {
            eventId: "2",
            message: "Prescription upload successful",
            messageId: "09843173-D677-401D-9331-5CCB37768320",
            timestamp: "2025-04-29T13:26:34.000Z",
            org: "A83008",
            newStatus: "0001",
            isDispenseNotification: false,
            isPrescriptionUpload: true,
            lineItems: {
              1: {
                lineItemNo: "1",
                newStatus: "0007"
              }
            }
          },
          3: {
            eventId: "3",
            message: "Release Request successful",
            messageId: "9ECCD950-623A-4821-81DE-774020DE0331",
            timestamp: "2025-04-29T13:26:45.000Z",
            org: "VNFKT",
            newStatus: "0002",
            isDispenseNotification: false,
            isPrescriptionUpload: false,
            lineItems: {
              1: {
                lineItemNo: "1",
                newStatus: "0008"
              }
            }
          },
          4: {
            eventId: "4",
            message: "Dispense notification successful",
            messageId: "2416B1D1-82D3-4D14-BB34-1F3C6B57CFFB",
            timestamp: "2025-04-29T13:27:04.000Z",
            org: "FA565",
            newStatus: "0006",
            isDispenseNotification: true,
            isPrescriptionUpload: false,
            lineItems: {
              1: {
                lineItemNo: "1",
                newStatus: "0001"
              }
            }
          }
        }
      } as unknown as Prescription

      console.log(acuteDispensedWithIncompletePatientDetails)

      const actual = generateFhirResponse(acuteDispensedWithIncompletePatientDetails, logger)
      expect(actual.entry).toContainEqual(expectedPatientResource)
    })
  })

  it("returns a RequestGroup with a PrescriptionStatus extension when called", () => {
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-123-567-890")

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

    const actual = generateFhirResponse(acuteDispensedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        extension: expect.arrayContaining([expected])
      })
    }))
  })

  it("returns a RequestGroup with a RepeatInformation extension when called with a non acute prescription", () => {
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")

    const erdCreatedWithSingleItem: Prescription = {
      prescriptionId: "6D9882-A83008-6AB663",
      nhsNumber: "9732730684",
      prefix: "MISS",
      given: "ETTA",
      family: "CORY",
      birthDate: "1999-01-04",
      gender: 2,
      address: {
        line: [
          "123 Dale Avenue",
          "Long Eaton",
          "Nottingham"
        ],
        postalCode: "NG10 1NP"
      },
      issueDate: "2025-04-29T00:00:00.000Z",
      issueNumber: 1,
      status: "0001",
      prescriptionPendingCancellation: false,
      treatmentType: "0003",
      prescriptionType: "0101",
      maxRepeats: 7,
      daysSupply: 10,
      prescriberOrg: "A99968",
      nominatedDispenserOrg: "VNE51",
      nominatedDisperserType: "P1",
      lineItems: {
        1: {
          lineItemNo: "1",
          lineItemId: "58F3FF9A-E00B-44DC-8CDF-280883267C16",
          status: "0007",
          itemName: "Azithromycin 250mg capsules",
          quantity: 30,
          quantityForm: "tablet",
          dosageInstruction: "3 times a day for 10 days",
          pendingCancellation: false
        }
      },
      dispenseNotifications: {},
      history: {
        2: {
          eventId: "2",
          message: "Prescription upload successful",
          messageId: "F677E0E8-4C5A-45FF-B2A0-37D2F9693721",
          timestamp: "2025-04-29T16:29:13.000Z",
          org: "A99968",
          newStatus: "0001",
          isDispenseNotification: false
        }
      }
    }

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

    const actual = generateFhirResponse(erdCreatedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        extension: expect.arrayContaining([expected])
      })
    }))
  })

  it("returns a RequestGroup without a RepeatInformation extension when called with a acute prescription", () => {
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")

    const expected = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-RepeatInformation"
    } as unknown as MedicationRepeatInformationExtensionType

    const actual = generateFhirResponse(acuteDispensedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        extension: expect.not.arrayContaining([expected])
      })
    }))
  })

  it("returns a RequestGroup without a partial RepeatInformation extension when called with a non acute prescription without a max repeats", () => {
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
    const prescription = {
      ...acuteDispensedWithSingleItem,
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

  it("returns a RequestGroup with a PendingCancellation extension when called with a prescription with a HL7 pending cancellation", () => {
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")

    const acuteWithHl7PendingCancellation: Prescription = {
      prescriptionId: "65C4B1-A83008-AA9C1I",
      nhsNumber: "5839945242",
      prefix: "MS",
      given: "STACEY",
      family: "TWITCHETT",
      birthDate: "1948-04-30",
      gender: 2,
      address: {
        line: [
          "10 HEATHFIELD",
          "COBHAM",
          "SURREY"
        ],
        postalCode: "KT11 2QY"
      },
      issueDate: "2025-04-24T00:00:00.000Z",
      issueNumber: 1,
      status: "0002",
      prescriptionPendingCancellation: true,
      treatmentType: "0001",
      prescriptionType: "0101",
      daysSupply: 28,
      prescriberOrg: "A83008",
      nominatedDispenserOrg: "FA565",
      nominatedDisperserType: "P1",
      dispenserOrg: "VNFKT",
      lineItems: {
        1: {
          lineItemNo: "1",
          lineItemId: "0206F8EF-0194-49C3-807A-ABE5DF42ADC3",
          status: "0008",
          itemName: "Amoxicillin 250mg capsules",
          quantity: 20,
          quantityForm: "tablet",
          dosageInstruction: "2 times a day for 10 days",
          cancellationReason: "Prescribing Error",
          pendingCancellation: true
        },
        2: {
          lineItemNo: "2",
          lineItemId: "EE3636D5-E411-4656-A47E-053F0464E7AC",
          status: "0008",
          itemName: "Co-codamol 30mg/500mg tablets",
          quantity: 20,
          quantityForm: "tablet",
          dosageInstruction: "2 times a day for 10 days",
          cancellationReason: "Prescribing Error",
          pendingCancellation: true
        },
        3: {
          lineItemNo: "3",
          lineItemId: "3E3D4CCA-DFE1-4D8E-9BC8-6A1F0FA95C86",
          status: "0008",
          itemName: "Pseudoephedrine hydrochloride 60mg tablets",
          quantity: 30,
          quantityForm: "tablet",
          dosageInstruction: "3 times a day for 10 days",
          cancellationReason: "Prescribing Error",
          pendingCancellation: true
        },
        4: {
          lineItemNo: "4",
          lineItemId: "44E252BD-2AB3-4AB1-A5A3-879DEA9B25C3",
          status: "0008",
          itemName: "Azithromycin 250mg capsules",
          quantity: 30,
          quantityForm: "tablet",
          dosageInstruction: "3 times a day for 10 days",
          cancellationReason: "Prescribing Error",
          pendingCancellation: true
        }
      },
      dispenseNotifications: {},
      history: {
        2: {
          eventId: "2",
          message: "Prescription upload successful",
          messageId: "1E042BB0-164D-48C2-B4F4-CB94771838A0",
          timestamp: "2025-04-24T12:09:53.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        3: {
          eventId: "3",
          message: "Release Request successful",
          messageId: "3339B7A4-4D62-48B3-A58B-9360D565CE68",
          timestamp: "2025-04-24T12:09:58.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false
        },
        4: {
          eventId: "4",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          messageId: "074269EB-C2AC-4571-B6A8-401B90A6F40A",
          timestamp: "2025-04-24T12:11:13.000Z",
          org: "A83008",
          newStatus: "0002",
          isDispenseNotification: false
        },
        5: {
          eventId: "5",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          messageId: "7C6E7789-ED69-4580-A5AC-4F310CF652DA",
          timestamp: "2025-04-24T12:14:37.000Z",
          org: "A83008",
          newStatus: "0002",
          isDispenseNotification: false
        },
        6: {
          eventId: "6",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          messageId: "F501683B-79A4-4032-A460-48B3BAB21C4C",
          timestamp: "2025-04-24T12:14:46.000Z",
          org: "A83008",
          newStatus: "0002",
          isDispenseNotification: false
        },
        7: {
          eventId: "7",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          messageId: "B94DF589-CE8C-4740-8657-CB62428388A2",
          timestamp: "2025-04-24T12:14:57.000Z",
          org: "A83008",
          newStatus: "0002",
          cancellationReason: "Prescribing Error",
          isDispenseNotification: false
        }
      }
    }

    const expected: PendingCancellationExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-PendingCancellation",
      extension: [{
        url: "prescriptionPendingCancellation",
        valueBoolean: true
      }]
    }

    const actual = generateFhirResponse(acuteWithHl7PendingCancellation, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        extension: expect.arrayContaining([expected])
      })
    }))
  })

  it("returns a RequestGroup with a PrescriptionType extension when called", () => {
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-123-567-890")

    const expected: PrescriptionTypeExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionType",
      valueCoding: {
        system: "https://fhir.nhs.uk/CodeSystem/prescription-type",
        code: "0101",
        display: "Primary Care Prescriber - Medical Prescriber"
      }
    }

    const actual = generateFhirResponse(acuteDispensedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        extension: expect.arrayContaining([expected])
      })
    }))
  })

  it("returns a Bundle containing a prescriber org PractitionerRole Bundle Entry resource when called", () => {
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
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
    const actual = generateFhirResponse(acuteDispensedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expected)
  })

  it("returns a Bundle containing a MedicationRequest Bundle Entry resource for each line item when called", () => {
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
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

    const actual = generateFhirResponse(acuteCreatedWithMultipleItems, logger)
    expect(actual.entry).toContainEqual(expectedMedicationRequest1)
    expect(actual.entry).toContainEqual(expectedMedicationRequest2)
    expect(actual.entry).toContainEqual(expectedMedicationRequest3)
    expect(actual.entry).toContainEqual(expectedMedicationRequest4)
  })

  it("returns a Bundle containing a partial MedicationRequest Bundle Entry resource called with a prescription with no nominated dispenser", () => {
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")

    const prescription: Prescription = {
      ...acuteDispensedWithSingleItem,
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
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
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

    const actual = generateFhirResponse(acuteDispensedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expected)
  })

  it("returns a Bundle containing a contained partial MedicationRequest Bundle Entry resource called with a prescription with an item with no dosage instructions", () => {
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDREQ-111-111-111")

    const prescription: Prescription = {
      ...acuteDispensedWithSingleItem
    }
    delete prescription.lineItems[1].dosageInstruction

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

    const actual = generateFhirResponse(prescription, logger)
    expect(actual.entry).toContainEqual(expectedMedicationRequest)
  })

  it("returns a Bundle containing a MedicationDispense Bundle Entry resource for each line item in each dispense notification when called with a dispensed prescription", () => {
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
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
        status: "in-progress",
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
        status: "completed",
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
        status: "completed",
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
        status: "completed",
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
        status: "completed",
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

    const actual = generateFhirResponse(acuteWithMultipleDispenseNotifications, logger)
    expect(actual.entry).toContainEqual(expectedMedicationDispense1)
    expect(actual.entry).toContainEqual(expectedMedicationDispense2)
    expect(actual.entry).toContainEqual(expectedMedicationDispense3)
    expect(actual.entry).toContainEqual(expectedMedicationDispense4)
    expect(actual.entry).toContainEqual(expectedMedicationDispense5)
  })

  it("returns a Bundle containing a partial MedicationDispense Bundle Entry resource when called with a prescription with a dispense notification item with no dosage instruction", () => {
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
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
          value: "101875F7-400C-43FE-AC04-7F29DBF854AF"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "completed",
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

    const actual = generateFhirResponse(acuteDispensedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expectedMedicationDispense)
  })

  it("returns a RequestGroup with a prescription line items Action when called", () => {
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
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

    const actual = generateFhirResponse(acuteDispensedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        action: expect.arrayContaining([expect.objectContaining(expected)])
      })
    }))
  })

  it("returns a RequestGroup with a partial prescription line items Action when called with a prescription with a missing days supply", () => {
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-123-567-890")

    const prescription = {
      ...acuteDispensedWithSingleItem
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
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
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

    const actual = generateFhirResponse(acuteCreatedWithMultipleItems, logger)
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
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-123-567-890")

    const expected = {
      title: "Prescription status transitions"
    }

    const actual = generateFhirResponse(acuteDispensedWithSingleItem, logger)
    expect(actual.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "RequestGroup",
        action: expect.arrayContaining([expect.objectContaining(expected)])
      })
    }))
  })

  it("returns a RequestGroup with a event Action for each filtered history event within the history Action when called", () => {
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
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

    const actual = generateFhirResponse(acuteDispensedWithSingleItem, logger)
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

  it("returns Dispense Notification history actions with correct references when called with a prescription with multiple dispense notifications", () => {
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
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
      action: [{
        resource: {
          reference: "urn:uuid:MEDDIS-555-555-555"
        }
      }]
    }

    const actual = generateFhirResponse(acuteWithMultipleDispenseNotifications, logger)
    logger.info("", {actual})
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

  it("returns a Dispense Notification history action with a correct reference when called with a prescription with a single dispense notification but mismatched ID's", () => {
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
    mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
    mockUUID.mockImplementationOnce(() => "MEDDIS-123-567-890")

    const mockPrescription: Prescription = {...acuteDispensedWithSingleItem}
    mockPrescription.history[4].messageId = "MIS-MATCHED-ID-1234"

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

  it("returns Dispense Notification history actions without a reference when called with a prescription with multiple dispense notificiations with mismatched ID's", () => {
    mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
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

    const mockPrescription: Prescription = {...acuteWithMultipleDispenseNotifications}
    mockPrescription.history[4].messageId = "MIS-MATCHED-ID-1111"
    mockPrescription.history[5].messageId = "MIS-MATCHED-ID-2222"

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
      }]
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
      }]
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

  // it("handles wierd erd thing", () => {
  //   mockUUID.mockImplementationOnce(() => "PRESORG-123-567-890")
  //   mockUUID.mockImplementationOnce(() => "MEDREQ-123-567-890")
  //   mockUUID.mockImplementationOnce(() => "DISORG-123-567-890")
  //   mockUUID.mockImplementationOnce(() => "MEDDIS-123-567-890")

  //   const parsed = parseSpineResponse(erdBug, logger)
  //   if ("spineError" in parsed) {
  //     throw new Error("Parsed response should not contain an error")
  //   }
  //   logger.info("parse", {parsed})
  //   const actual = generateFhirResponse(parsed.prescription, logger)
  //   logger.info("fhir", actual)

  // })
})
