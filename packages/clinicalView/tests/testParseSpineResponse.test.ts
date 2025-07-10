/* eslint-disable max-len */

import {Logger} from "@aws-lambda-powertools/logger"
import {Prescription, parseSpineResponse, ParsedSpineResponse} from "../src/parseSpineResponse"
import {
  acuteCancelled,
  acuteCreated,
  acuteDispensed,
  acuteDispensedWithASingleItem,
  acuteHl7Cancelled,
  acuteHl7PendingCancellation,
  acuteMultipleDispenseNotifications,
  acuteNonNominatedCreated,
  acutePartiallyDispensed,
  acutePendingCancellation,
  acuteReleased,
  acuteWithCancelledItem,
  acuteWithWithdrawnDispenseNotification,
  acuteWithItemPartiallyDispensed,
  acuteWithItemPendingCancellation,
  acuteWithoutOptionalDaysSupply,
  acuteWithoutOptionalDosageInstructions,
  acuteWithoutOptionalPatientDetails,
  altAcuteMultipleDispenseNotifications,
  erdCreated,
  malformedError,
  notFound,
  unknownError,
  acuteWithWithdrawnAmendment,
  acuteWithdrawn
} from "./examples/examples"

import {ServiceError} from "@cpt-common/common-types/service"

const logger: Logger = new Logger({serviceName: "clinicalView", logLevel: "DEBUG"})

describe("Test parseSpineResponse", () => {
  it("returns a correctly parsed response and no error when spine returns a created acute prescription", async () => {
    const expected: Prescription = {
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
          internalId: "20250424111005000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-04-24T11:10:05.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteCreated, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns a created non-nominated acute prescription", async () => {
    const expected: Prescription = {
      prescriptionId: "5558D7-A83008-33B591",
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
      issueDate: "2025-04-29T00:00:00.000Z",
      issueNumber: 1,
      status: "0001",
      prescriptionPendingCancellation: false,
      treatmentType: "0001",
      prescriptionType: "0101",
      daysSupply: 28,
      prescriberOrg: "A83008",
      nominatedDisperserType: "0004",
      lineItems: {
        1: {
          lineItemNo: "1",
          lineItemId: "B1C7FC5B-38EE-48CD-9B4D-009B6B248054",
          status: "0007",
          itemName: "Amoxicillin 250mg capsules",
          quantity: 20,
          quantityForm: "tablet",
          dosageInstruction: "2 times a day for 10 days",
          pendingCancellation: false
        }
      },
      dispenseNotifications: {},
      history: {
        2: {
          eventId: "2",
          internalId: "20250429141302000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-04-29T14:13:02.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteNonNominatedCreated, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns a released acute prescription", async () => {
    const expected: Prescription = {
      prescriptionId: "C0C3E6-A83008-93D8FL",
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
      prescriptionPendingCancellation: false,
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
          lineItemId: "D37FD639-E831-420C-B37B-40481DCA910E",
          status: "0008",
          itemName: "Amoxicillin 250mg capsules",
          quantity: 20,
          quantityForm: "tablet",
          dosageInstruction: "2 times a day for 10 days",
          pendingCancellation: false
        },
        2: {
          lineItemNo: "2",
          lineItemId: "407685A2-A1A2-4B6B-B281-CAED41733C2B",
          status: "0008",
          itemName: "Co-codamol 30mg/500mg tablets",
          quantity: 20,
          quantityForm: "tablet",
          dosageInstruction: "2 times a day for 10 days",
          pendingCancellation: false
        },
        3: {
          lineItemNo: "3",
          lineItemId: "20D6D69F-7BDD-4798-86DF-30F902BD2936",
          status: "0008",
          itemName: "Pseudoephedrine hydrochloride 60mg tablets",
          quantity: 30,
          quantityForm: "tablet",
          dosageInstruction: "3 times a day for 10 days",
          pendingCancellation: false
        },
        4: {
          lineItemNo: "4",
          lineItemId: "BF1B0BD8-0E6D-4D90-989E-F32065200CA3",
          status: "0008",
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
          internalId: "20250424111005000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-04-24T11:10:05.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        3: {
          eventId: "3",
          internalId: "20250424111244000000_HISTORY_RELEASE",
          message: "Release Request successful",
          timestamp: "2025-04-24T11:12:44.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteReleased, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns a dispensed acute prescription", async () => {
    const expected: Prescription = {
      prescriptionId: "C0C3E6-A83008-93D8FL",
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
      lastDispenseNotification: "DF525024-FD4E-4292-9FF6-B67025791B69",
      lineItems: {
        1: {
          lineItemNo: "1",
          lineItemId: "D37FD639-E831-420C-B37B-40481DCA910E",
          status: "0001",
          itemName: "Amoxicillin 250mg capsules",
          quantity: 20,
          quantityForm: "tablet",
          dosageInstruction: "2 times a day for 10 days",
          pendingCancellation: false
        },
        2: {
          lineItemNo: "2",
          lineItemId: "407685A2-A1A2-4B6B-B281-CAED41733C2B",
          status: "0001",
          itemName: "Co-codamol 30mg/500mg tablets",
          quantity: 20,
          quantityForm: "tablet",
          dosageInstruction: "2 times a day for 10 days",
          pendingCancellation: false
        },
        3: {
          lineItemNo: "3",
          lineItemId: "20D6D69F-7BDD-4798-86DF-30F902BD2936",
          status: "0001",
          itemName: "Pseudoephedrine hydrochloride 60mg tablets",
          quantity: 30,
          quantityForm: "tablet",
          dosageInstruction: "3 times a day for 10 days",
          pendingCancellation: false
        },
        4: {
          lineItemNo: "4",
          lineItemId: "BF1B0BD8-0E6D-4D90-989E-F32065200CA3",
          status: "0001",
          itemName: "Azithromycin 250mg capsules",
          quantity: 30,
          quantityForm: "tablet",
          dosageInstruction: "3 times a day for 10 days",
          pendingCancellation: false
        }
      },
      dispenseNotifications: {
        "20250424111602543458_4D3B83_1614371148": {
          dispenseNotificationId: "DF525024-FD4E-4292-9FF6-B67025791B69",
          dispenseNotificationDocumentKey: "20250424111602543458_4D3B83_1614371148",
          timestamp: "2025-04-24T11:15:49.000Z",
          status: "0006",
          isLastDispenseNotification: true,
          lineItems: {
            1: {
              lineItemNo: "1",
              lineItemId: "D37FD639-E831-420C-B37B-40481DCA910E",
              status: "0001",
              itemName: "Amoxicillin 250mg capsules",
              quantity: 20,
              quantityForm: "tablet",
              dosageInstruction: "2 times a day for 10 days"
            },
            2: {
              lineItemNo: "2",
              lineItemId: "407685A2-A1A2-4B6B-B281-CAED41733C2B",
              status: "0001",
              itemName: "Co-codamol 30mg/500mg tablets",
              quantity: 20,
              quantityForm: "tablet",
              dosageInstruction: "2 times a day for 10 days"
            },
            3: {
              lineItemNo: "3",
              lineItemId: "20D6D69F-7BDD-4798-86DF-30F902BD2936",
              status: "0001",
              itemName: "Pseudoephedrine hydrochloride 60mg tablets",
              quantity: 30,
              quantityForm: "tablet",
              dosageInstruction: "3 times a day for 10 days"
            },
            4: {
              lineItemNo: "4",
              status: "0001",
              lineItemId: "BF1B0BD8-0E6D-4D90-989E-F32065200CA3",
              itemName: "Azithromycin 250mg capsules",
              quantity: 30,
              quantityForm: "tablet",
              dosageInstruction: "3 times a day for 10 days"
            }
          }
        }
      },
      history: {
        2: {
          eventId: "2",
          internalId: "20250424111005000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-04-24T11:10:05.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        3: {
          eventId: "3",
          internalId: "20250424111244000000_HISTORY_RELEASE",
          message: "Release Request successful",
          timestamp: "2025-04-24T11:12:44.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false
        },
        4: {
          eventId: "4",
          internalId: "20250424111602543458_4D3B83_1614371148",
          message: "Dispense notification successful",
          timestamp: "2025-04-24T11:16:02.000Z",
          org: "FA565",
          newStatus: "0006",
          isDispenseNotification: true
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteDispensed, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns a dispensed acute prescription with a single item", async () => {
    const expected: Prescription = {
      prescriptionId: "EA1CBC-A83008-F1F8A8",
      nhsNumber: "5839945242",
      prefix: "MS",
      given: "STACEY",
      family: "TWITCHETT",
      suffix: "OBE",
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
      lastDispenseNotification: "2416B1D1-82D3-4D14-BB34-1F3C6B57CFFB",
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
        "20250429132704108575_90B308_1614371148": {
          dispenseNotificationId: "2416B1D1-82D3-4D14-BB34-1F3C6B57CFFB",
          dispenseNotificationDocumentKey: "20250429132704108575_90B308_1614371148",
          timestamp: "2025-04-29T13:26:57.000Z",
          status: "0006",
          isLastDispenseNotification: true,
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
          internalId: "20250429132634000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-04-29T13:26:34.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        3: {
          eventId: "3",
          internalId: "20250429132645000000_HISTORY_RELEASE",
          message: "Release Request successful",
          timestamp: "2025-04-29T13:26:45.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false
        },
        4: {
          eventId: "4",
          internalId: "20250429132704108575_90B308_1614371148",
          message: "Dispense notification successful",
          timestamp: "2025-04-29T13:27:04.000Z",
          org: "FA565",
          newStatus: "0006",
          isDispenseNotification: true
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteDispensedWithASingleItem, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns a cancelled acute prescription", async () => {
    const expected: Prescription = {
      prescriptionId: "4F30E7-A83008-160FB1",
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
      status: "0005",
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
          lineItemId: "D45D0481-4182-4D33-B4A6-45ADBA5AF989",
          status: "0005",
          itemName: "Amoxicillin 250mg capsules",
          quantity: 20,
          quantityForm: "tablet",
          dosageInstruction: "2 times a day for 10 days",
          cancellationReason: "Prescribing Error",
          pendingCancellation: false
        },
        2: {
          lineItemNo: "2",
          lineItemId: "EC975A10-C2C0-49F5-A485-88A03A1FCFDD",
          status: "0005",
          itemName: "Co-codamol 30mg/500mg tablets",
          quantity: 20,
          quantityForm: "tablet",
          dosageInstruction: "2 times a day for 10 days",
          cancellationReason: "Prescribing Error",
          pendingCancellation: false
        },
        3: {
          lineItemNo: "3",
          lineItemId: "51FFBC54-33F5-40F3-8EB0-94F1A8E981CE",
          status: "0005",
          itemName: "Pseudoephedrine hydrochloride 60mg tablets",
          quantity: 30,
          quantityForm: "tablet",
          dosageInstruction: "3 times a day for 10 days",
          cancellationReason: "Prescribing Error",
          pendingCancellation: false
        },
        4: {
          lineItemNo: "4",
          lineItemId: "C74B3BB5-8DCC-4C0F-88D9-16B404F92B38",
          status: "0005",
          itemName: "Azithromycin 250mg capsules",
          quantity: 30,
          quantityForm: "tablet",
          dosageInstruction: "3 times a day for 10 days",
          cancellationReason: "Prescribing Error",
          pendingCancellation: false
        }
      },
      dispenseNotifications: {},
      history: {
        2: {
          eventId: "2",
          internalId: "20250424122612000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-04-24T12:26:12.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        3: {
          eventId: "3",
          internalId: "20250424122621000000_HISTORY_CANCELLED",
          message: "Prescription/item was cancelled",
          timestamp: "2025-04-24T12:26:21.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        4: {
          eventId: "4",
          internalId: "20250424122630000000_HISTORY_CANCELLED",
          message: "Prescription/item was cancelled",
          timestamp: "2025-04-24T12:26:30.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        5: {
          eventId: "5",
          internalId: "20250424122640000000_HISTORY_CANCELLED",
          message: "Prescription/item was cancelled",
          timestamp: "2025-04-24T12:26:40.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        6: {
          eventId: "6",
          internalId: "20250424122647000000_HISTORY_CANCELLED",
          message: "Prescription/item was cancelled",
          timestamp: "2025-04-24T12:26:47.000Z",
          org: "A83008",
          newStatus: "0005",
          isDispenseNotification: false
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteCancelled, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns an acute prescription with a cancelled item", async () => {
    const expected: Prescription = {
      prescriptionId: "54F746-A83008-E8A05J",
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
          lineItemId: "625D6DEC-473B-41F7-AAB9-F5201754A028",
          status: "0005",
          itemName: "Amoxicillin 250mg capsules",
          quantity: 20,
          quantityForm: "tablet",
          dosageInstruction: "2 times a day for 10 days",
          cancellationReason: "Prescribing Error",
          pendingCancellation: false
        },
        2: {
          lineItemNo: "2",
          lineItemId: "787E24BB-7287-4204-A28D-7C3C7C77DB3E",
          status: "0007",
          itemName: "Co-codamol 30mg/500mg tablets",
          quantity: 20,
          quantityForm: "tablet",
          dosageInstruction: "2 times a day for 10 days",
          pendingCancellation: false
        },
        3: {
          lineItemNo: "3",
          lineItemId: "A953CCD1-151F-4DC2-A8AF-68B63466ECB3",
          status: "0007",
          itemName: "Pseudoephedrine hydrochloride 60mg tablets",
          quantity: 30,
          quantityForm: "tablet",
          dosageInstruction: "3 times a day for 10 days",
          pendingCancellation: false
        },
        4: {
          lineItemNo: "4",
          lineItemId: "0A52C8D4-DE23-4A0E-99C1-7B92799527FE",
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
          internalId: "20250424112054000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-04-24T11:20:54.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        3: {
          eventId: "3",
          internalId: "20250424112132000000_HISTORY_CANCELLED",
          message: "Prescription/item was cancelled",
          timestamp: "2025-04-24T11:21:32.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteWithCancelledItem, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns a partially dispensed acute prescription", async () => {
    const expected: Prescription = {
      prescriptionId: "F7032A-A83008-03481F",
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
      status: "0003",
      prescriptionPendingCancellation: false,
      treatmentType: "0001",
      prescriptionType: "0101",
      daysSupply: 28,
      prescriberOrg: "A83008",
      nominatedDispenserOrg: "FA565",
      nominatedDisperserType: "P1",
      dispenserOrg: "FA565",
      lastDispenseNotification: "70EE28E2-896B-448F-9454-4DD333141CFB",
      lineItems: {
        1: {
          lineItemNo: "1",
          lineItemId: "D186BD0E-394F-4DB5-B298-51B326E2C7A9",
          status: "0001",
          itemName: "Amoxicillin 250mg capsules",
          quantity: 20,
          quantityForm: "tablet",
          dosageInstruction: "2 times a day for 10 days",
          pendingCancellation: false
        },
        2: {
          lineItemNo: "2",
          lineItemId: "92AEF41F-6C09-43CA-907A-F289FBBF589F",
          status: "0001",
          itemName: "Co-codamol 30mg/500mg tablets",
          quantity: 20,
          quantityForm: "tablet",
          dosageInstruction: "2 times a day for 10 days",
          pendingCancellation: false
        },
        3: {
          lineItemNo: "3",
          lineItemId: "2BBF2CCD-309A-452A-A12D-C2595BD88E12",
          status: "0004",
          itemName: "Pseudoephedrine hydrochloride 60mg tablets",
          quantity: 30,
          quantityForm: "tablet",
          dosageInstruction: "3 times a day for 10 days",
          pendingCancellation: false
        },
        4: {
          lineItemNo: "4",
          lineItemId: "BE479811-383E-4B7F-8438-4ACFA9FDE91B",
          status: "0004",
          itemName: "Azithromycin 250mg capsules",
          quantity: 30,
          quantityForm: "tablet",
          dosageInstruction: "3 times a day for 10 days",
          pendingCancellation: false
        }
      },
      dispenseNotifications: {
        "20250424113658383065_2F620E_1614371148": {
          dispenseNotificationId: "70EE28E2-896B-448F-9454-4DD333141CFB",
          dispenseNotificationDocumentKey: "20250424113658383065_2F620E_1614371148",
          timestamp: "2025-04-24T11:36:46.000Z",
          status: "0003",
          isLastDispenseNotification: true,
          lineItems: {
            1: {
              lineItemNo: "1",
              lineItemId: "D186BD0E-394F-4DB5-B298-51B326E2C7A9",
              status: "0001",
              itemName: "Amoxicillin 250mg capsules",
              quantity: 20,
              quantityForm: "tablet"
            },
            2: {
              lineItemNo: "2",
              lineItemId: "92AEF41F-6C09-43CA-907A-F289FBBF589F",
              status: "0001",
              itemName: "Co-codamol 30mg/500mg tablets",
              quantity: 20,
              quantityForm: "tablet"
            },
            3: {
              lineItemNo: "3",
              lineItemId: "2BBF2CCD-309A-452A-A12D-C2595BD88E12",
              status: "0004",
              itemName: "Pseudoephedrine hydrochloride 60mg tablets",
              quantity: 0,
              quantityForm: "tablet"
            },
            4: {
              lineItemNo: "4",
              lineItemId: "BE479811-383E-4B7F-8438-4ACFA9FDE91B",
              status: "0004",
              itemName: "Azithromycin 250mg capsules",
              quantity: 0,
              quantityForm: "tablet"
            }
          }
        }
      },
      history: {
        2: {
          eventId: "2",
          internalId: "20250424113525000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-04-24T11:35:25.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        3: {
          eventId: "3",
          internalId: "20250424113530000000_HISTORY_RELEASE",
          message: "Release Request successful",
          timestamp: "2025-04-24T11:35:30.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false
        },
        4: {
          eventId: "4",
          internalId: "20250424113658383065_2F620E_1614371148",
          message: "Dispense notification successful",
          timestamp: "2025-04-24T11:36:58.000Z",
          org: "FA565",
          newStatus: "0003",
          isDispenseNotification: true
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acutePartiallyDispensed, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns an acute prescription with a partially dispensed item", async () => {
    const expected: Prescription = {
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
      status: "0003",
      prescriptionPendingCancellation: false,
      treatmentType: "0001",
      prescriptionType: "0101",
      daysSupply: 28,
      prescriberOrg: "A83008",
      nominatedDispenserOrg: "FA565",
      nominatedDisperserType: "P1",
      dispenserOrg: "FA565",
      lastDispenseNotification: "42A6A1A0-596C-482C-B018-0D15F8FFF9F3",
      lineItems: {
        1: {
          lineItemNo: "1",
          lineItemId: "3CA6AF12-560E-4DB4-B419-6E0DD99BEE40",
          status: "0003",
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
        "20250424114532061265_E7C077_1614371148": {
          dispenseNotificationId: "42A6A1A0-596C-482C-B018-0D15F8FFF9F3",
          dispenseNotificationDocumentKey: "20250424114532061265_E7C077_1614371148",
          timestamp: "2025-04-24T11:45:17.000Z",
          status: "0003",
          isLastDispenseNotification: true,
          lineItems: {
            1: {
              lineItemNo: "1",
              lineItemId: "3CA6AF12-560E-4DB4-B419-6E0DD99BEE40",
              status: "0003",
              itemName: "Amoxicillin 250mg capsules",
              quantity: 10,
              quantityForm: "tablet"
            },
            2: {
              lineItemNo: "2",
              lineItemId: "18434F2E-AAE5-4001-8BB6-005ED2D3DF23",
              status: "0001",
              itemName: "Co-codamol 30mg/500mg tablets",
              quantity: 20,
              quantityForm: "tablet"
            },
            3: {
              lineItemNo: "3",
              lineItemId: "0D73CBCD-36E9-4943-9EBE-502CA6B85216",
              status: "0001",
              itemName: "Pseudoephedrine hydrochloride 60mg tablets",
              quantity: 30,
              quantityForm: "tablet"
            },
            4: {
              lineItemNo: "4",
              lineItemId: "453F161C-3A76-42B5-BA7F-7A4EBF61023B",
              status: "0001",
              itemName: "Azithromycin 250mg capsules",
              quantity: 30,
              quantityForm: "tablet"
            }
          }
        }
      },
      history: {
        2: {
          eventId: "2",
          internalId: "20250424114457000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-04-24T11:44:57.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        3: {
          eventId: "3",
          internalId: "20250424114512000000_HISTORY_RELEASE",
          message: "Release Request successful",
          timestamp: "2025-04-24T11:45:12.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false
        },
        4: {
          eventId: "4",
          internalId: "20250424114532061265_E7C077_1614371148",
          message: "Dispense notification successful",
          timestamp: "2025-04-24T11:45:32.000Z",
          org: "FA565",
          newStatus: "0003",
          isDispenseNotification: true
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteWithItemPartiallyDispensed, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns an acute prescription with multiple dispense notifications", async () => {
    /* Tests DN's where items previously dispensed are included again with 0 quantity in subsequent DN's*/
    const expected: Prescription = {
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
      lastDispenseNotification: "B358A55E-A423-48E2-A9D8-2612B4E66604",
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
        "20250424114532061265_E7C077_1614371148": {
          dispenseNotificationId: "42A6A1A0-596C-482C-B018-0D15F8FFF9F3",
          dispenseNotificationDocumentKey: "20250424114532061265_E7C077_1614371148",
          timestamp: "2025-04-24T11:45:17.000Z",
          status: "0003",
          isLastDispenseNotification: false,
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
        "20250424114941724337_A1DAC3_1614371148": {
          dispenseNotificationId: "B358A55E-A423-48E2-A9D8-2612B4E66604",
          dispenseNotificationDocumentKey: "20250424114941724337_A1DAC3_1614371148",
          timestamp: "2025-04-24T11:49:31.000Z",
          status: "0006",
          isLastDispenseNotification: true,
          lineItems: {
            1: {
              lineItemNo: "1",
              lineItemId: "3CA6AF12-560E-4DB4-B419-6E0DD99BEE40",
              status: "0001",
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
              quantity: 0,
              quantityForm: "tablet",
              dosageInstruction: "2 times a day for 10 days"
            },
            3: {
              lineItemNo: "3",
              lineItemId: "0D73CBCD-36E9-4943-9EBE-502CA6B85216",
              status: "0001",
              itemName: "Pseudoephedrine hydrochloride 60mg tablets",
              quantity: 0,
              quantityForm: "tablet",
              dosageInstruction: "3 times a day for 10 days"
            },
            4: {
              lineItemNo: "4",
              lineItemId: "453F161C-3A76-42B5-BA7F-7A4EBF61023B",
              status: "0001",
              itemName: "Azithromycin 250mg capsules",
              quantity: 0,
              quantityForm: "tablet",
              dosageInstruction: "3 times a day for 10 days"
            }
          }
        }
      },
      history: {
        2: {
          eventId: "2",
          internalId: "20250424114457000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-04-24T11:44:57.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        3: {
          eventId: "3",
          internalId: "20250424114512000000_HISTORY_UPLOAD",
          message: "Release Request successful",
          timestamp: "2025-04-24T11:45:12.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false
        },
        4: {
          eventId: "4",
          internalId: "20250424114532061265_E7C077_1614371148",
          message: "Dispense notification successful",
          timestamp: "2025-04-24T11:45:32.000Z",
          org: "FA565",
          newStatus: "0003",
          isDispenseNotification: true
        },
        5: {
          eventId: "5",
          internalId: "20250424114941724337_A1DAC3_1614371148",
          message: "Dispense notification successful",
          timestamp: "2025-04-24T11:49:41.000Z",
          org: "FA565",
          newStatus: "0006",
          isDispenseNotification: true
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteMultipleDispenseNotifications, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns an acute prescription with an alternative multiple dispense notifications format", async () => {
    /* Tests DN's where items previously dispensed are not included in subsequent DN's*/
    const expected: Prescription = {
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
      lastDispenseNotification: "B358A55E-A423-48E2-A9D8-2612B4E66604",
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
        "20250424114532061265_E7C077_1614371148": {
          dispenseNotificationId: "42A6A1A0-596C-482C-B018-0D15F8FFF9F3",
          dispenseNotificationDocumentKey: "20250424114532061265_E7C077_1614371148",
          timestamp: "2025-04-24T11:45:17.000Z",
          status: "0003",
          isLastDispenseNotification: false,
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
              status: "0003",
              itemName: "Azithromycin 250mg capsules",
              quantity: 20,
              quantityForm: "tablet",
              dosageInstruction: "3 times a day for 10 days"
            }
          }
        },
        "20250424114941724337_A1DAC3_1614371148": {
          dispenseNotificationId: "B358A55E-A423-48E2-A9D8-2612B4E66604",
          dispenseNotificationDocumentKey: "20250424114941724337_A1DAC3_1614371148",
          timestamp: "2025-04-24T11:49:31.000Z",
          status: "0006",
          isLastDispenseNotification: true,
          lineItems: {
            1: {
              lineItemNo: "1",
              lineItemId: "3CA6AF12-560E-4DB4-B419-6E0DD99BEE40",
              status: "0001",
              itemName: "Amoxicillin 250mg capsules",
              quantity: 10,
              quantityForm: "tablet",
              dosageInstruction: "2 times a day for 10 days"
            },
            4: {
              lineItemNo: "4",
              lineItemId: "453F161C-3A76-42B5-BA7F-7A4EBF61023B",
              status: "0001",
              itemName: "Azithromycin 250mg capsules",
              quantity: 10,
              quantityForm: "tablet",
              dosageInstruction: "3 times a day for 10 days"
            }
          }
        }
      },
      history: {
        2: {
          eventId: "2",
          internalId: "20250424114457000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-04-24T11:44:57.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        3: {
          eventId: "3",
          internalId: "20250424114512000000_HISTORY_RELEASE",
          message: "Release Request successful",
          timestamp: "2025-04-24T11:45:12.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false
        },
        4: {
          eventId: "4",
          internalId: "20250424114532061265_E7C077_1614371148",
          message: "Dispense notification successful",
          timestamp: "2025-04-24T11:45:32.000Z",
          org: "FA565",
          newStatus: "0003",
          isDispenseNotification: true
        },
        5: {
          eventId: "5",
          internalId: "20250424114941724337_A1DAC3_1614371148",
          message: "Dispense notification successful",
          timestamp: "2025-04-24T11:49:41.000Z",
          org: "FA565",
          newStatus: "0006",
          isDispenseNotification: true
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(altAcuteMultipleDispenseNotifications, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns an acute prescription pending cancellation", async () => {
    const expected: Prescription = {
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
      prescriptionPendingCancellation: false,
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
          internalId: "20250424120953000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-04-24T12:09:53.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        3: {
          eventId: "3",
          internalId: "20250424120958000000_HISTORY_RELEASE",
          message: "Release Request successful",
          timestamp: "2025-04-24T12:09:58.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false
        },
        4: {
          eventId: "4",
          internalId: "20250424121113000000_HISTORY_CANCELLED",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          timestamp: "2025-04-24T12:11:13.000Z",
          org: "A83008",
          newStatus: "0002",
          isDispenseNotification: false
        },
        5: {
          eventId: "5",
          internalId: "20250424121437000000_HISTORY_CANCELLED",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          timestamp: "2025-04-24T12:14:37.000Z",
          org: "A83008",
          newStatus: "0002",
          isDispenseNotification: false
        },
        6: {
          eventId: "6",
          internalId: "20250424121446000000_HISTORY_CANCELLED",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          timestamp: "2025-04-24T12:14:46.000Z",
          org: "A83008",
          newStatus: "0002",
          isDispenseNotification: false
        },
        7: {
          eventId: "7",
          internalId: "20250424121457000000_HISTORY_CANCELLED",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          timestamp: "2025-04-24T12:14:57.000Z",
          org: "A83008",
          newStatus: "0002",
          isDispenseNotification: false
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acutePendingCancellation, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns an acute prescription with an item pending cancellation", async () => {
    const expected: Prescription = {
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
      prescriptionPendingCancellation: false,
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
          pendingCancellation: false
        },
        3: {
          lineItemNo: "3",
          lineItemId: "3E3D4CCA-DFE1-4D8E-9BC8-6A1F0FA95C86",
          status: "0008",
          itemName: "Pseudoephedrine hydrochloride 60mg tablets",
          quantity: 30,
          quantityForm: "tablet",
          dosageInstruction: "3 times a day for 10 days",
          pendingCancellation: false
        },
        4: {
          lineItemNo: "4",
          lineItemId: "44E252BD-2AB3-4AB1-A5A3-879DEA9B25C3",
          status: "0008",
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
          internalId: "20250424120953000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-04-24T12:09:53.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        3: {
          eventId: "3",
          internalId: "20250424120958000000_HISTORY_RELEASE",
          message: "Release Request successful",
          timestamp: "2025-04-24T12:09:58.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false
        },
        4: {
          eventId: "4",
          internalId: "20250424121113000000_HISTORY_CANCELLED",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          timestamp: "2025-04-24T12:11:13.000Z",
          org: "A83008",
          newStatus: "0002",
          isDispenseNotification: false
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteWithItemPendingCancellation, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns a HL7 cancelled acute prescription", async () => {
    const expected: Prescription = {
      prescriptionId: "4F30E7-A83008-160FB1",
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
      status: "0005",
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
          lineItemId: "D45D0481-4182-4D33-B4A6-45ADBA5AF989",
          status: "0005",
          itemName: "Amoxicillin 250mg capsules",
          quantity: 20,
          quantityForm: "tablet",
          dosageInstruction: "2 times a day for 10 days",
          cancellationReason: "Prescribing Error",
          pendingCancellation: false
        },
        2: {
          lineItemNo: "2",
          lineItemId: "EC975A10-C2C0-49F5-A485-88A03A1FCFDD",
          status: "0005",
          itemName: "Co-codamol 30mg/500mg tablets",
          quantity: 20,
          quantityForm: "tablet",
          dosageInstruction: "2 times a day for 10 days",
          cancellationReason: "Prescribing Error",
          pendingCancellation: false
        },
        3: {
          lineItemNo: "3",
          lineItemId: "51FFBC54-33F5-40F3-8EB0-94F1A8E981CE",
          status: "0005",
          itemName: "Pseudoephedrine hydrochloride 60mg tablets",
          quantity: 30,
          quantityForm: "tablet",
          dosageInstruction: "3 times a day for 10 days",
          cancellationReason: "Prescribing Error",
          pendingCancellation: false
        },
        4: {
          lineItemNo: "4",
          lineItemId: "C74B3BB5-8DCC-4C0F-88D9-16B404F92B38",
          status: "0005",
          itemName: "Azithromycin 250mg capsules",
          quantity: 30,
          quantityForm: "tablet",
          dosageInstruction: "3 times a day for 10 days",
          cancellationReason: "Prescribing Error",
          pendingCancellation: false
        }
      },
      dispenseNotifications: {},
      history: {
        2: {
          eventId: "2",
          internalId: "20250424122612000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-04-24T12:26:12.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        3: {
          eventId: "3",
          internalId: "20250424122621000000_HISTORY_CANCELLED",
          message: "Prescription/item was cancelled",
          timestamp: "2025-04-24T12:26:21.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        4: {
          eventId: "4",
          internalId: "20250424122630000000_HISTORY_CANCELLED",
          message: "Prescription/item was cancelled",
          timestamp: "2025-04-24T12:26:30.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        5: {
          eventId: "5",
          internalId: "20250424122640000000_HISTORY_CANCELLED",
          message: "Prescription/item was cancelled",
          timestamp: "2025-04-24T12:26:40.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        6: {
          eventId: "6",
          internalId: "20250424122647000000_HISTORY_CANCELLED",
          message: "Prescription/item was cancelled",
          timestamp: "2025-04-24T12:26:47.000Z",
          org: "A83008",
          newStatus: "0005",
          cancellationReason: "Prescribing Error",
          isDispenseNotification: false
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteHl7Cancelled, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns an acute prescription pending HL7 cancellation", async () => {
    const expected: Prescription = {
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
          internalId: "20250424120953000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-04-24T12:09:53.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        3: {
          eventId: "3",
          internalId: "20250424120958000000_HISTORY_RELEASE",
          message: "Release Request successful",
          timestamp: "2025-04-24T12:09:58.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false
        },
        4: {
          eventId: "4",
          internalId: "20250424121113000000_HISTORY_CANCELLED",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          timestamp: "2025-04-24T12:11:13.000Z",
          org: "A83008",
          newStatus: "0002",
          isDispenseNotification: false
        },
        5: {
          eventId: "5",
          internalId: "20250424121437000000_HISTORY_CANCELLED",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          timestamp: "2025-04-24T12:14:37.000Z",
          org: "A83008",
          newStatus: "0002",
          isDispenseNotification: false
        },
        6: {
          eventId: "6",
          internalId: "20250424121446000000_HISTORY_CANCELLED",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          timestamp: "2025-04-24T12:14:46.000Z",
          org: "A83008",
          newStatus: "0002",
          isDispenseNotification: false
        },
        7: {
          eventId: "7",
          internalId: "20250424121457000000_HISTORY_CANCELLED",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          timestamp: "2025-04-24T12:14:57.000Z",
          org: "A83008",
          newStatus: "0002",
          cancellationReason: "Prescribing Error",
          isDispenseNotification: false
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteHl7PendingCancellation, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns an acute prescription without optional patient details", async () => {
    const expected: Prescription = {
      prescriptionId: "EA1CBC-A83008-F1F8A8",
      nhsNumber: "5839945242",
      birthDate: "1948-04-30",
      address: {
        line: []
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
      lastDispenseNotification: "2416B1D1-82D3-4D14-BB34-1F3C6B57CFFB",
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
        "20250429132704108575_90B308_1614371148": {
          dispenseNotificationId: "2416B1D1-82D3-4D14-BB34-1F3C6B57CFFB",
          dispenseNotificationDocumentKey: "20250429132704108575_90B308_1614371148",
          timestamp: "2025-04-29T13:26:57.000Z",
          status: "0006",
          isLastDispenseNotification: true,
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
          internalId: "20250429132634000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-04-29T13:26:34.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        3: {
          eventId: "3",
          internalId: "20250429132645000000_HISTORY_RELEASE",
          message: "Release Request successful",
          timestamp: "2025-04-29T13:26:45.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false
        },
        4: {
          eventId: "4",
          internalId: "20250429132704108575_90B308_1614371148",
          message: "Dispense notification successful",
          timestamp: "2025-04-29T13:27:04.000Z",
          org: "FA565",
          newStatus: "0006",
          isDispenseNotification: true
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteWithoutOptionalPatientDetails, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns an acute prescription without optional days supply", async () => {
    const expected: Prescription = {
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
          internalId: "20250424111005000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-04-24T11:10:05.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteWithoutOptionalDaysSupply, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns an acute prescription with a withdrawn dispense notification", async () => {
    const expected: Prescription = {
      prescriptionId: "6284D0-A83008-0F9E2U",
      nhsNumber: "9651193484",
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
      issueDate: "2025-07-01T13:12:47.000Z",
      issueNumber: 1,
      status: "0003",
      prescriptionPendingCancellation: false,
      treatmentType: "0001",
      prescriptionType: "1001",
      daysSupply: 28,
      prescriberOrg: "A99968",
      nominatedDispenserOrg: "FA565",
      nominatedDisperserType: "P1",
      dispenserOrg: "FA565",
      lastDispenseNotification: "AA23ADE2-DACD-4128-A2A2-3C223576F866",
      lineItems: {
        1: {
          lineItemNo: "1",
          lineItemId: "68E6D829-5F15-4908-8FD6-096120C0C5AF",
          status: "0003",
          itemName: "Methotrexate 10mg/0.2ml solution for injection pre-filled syringes",
          quantity: 1,
          quantityForm: "pre-filled disposable injection",
          dosageInstruction: "Inject 10 milligram - 5 times a day - Subcutaneous route - for 10 days",
          pendingCancellation: false
        }
      },
      dispenseNotifications: {
        "20250701131454709685_DF2826_1614371148": {
          dispenseNotificationId: "AA23ADE2-DACD-4128-A2A2-3C223576F866",
          dispenseNotificationDocumentKey: "20250701131454709685_DF2826_1614371148",
          timestamp: "2023-08-29T15:46:00.000Z",
          status: "0003",
          isLastDispenseNotification: true,
          lineItems: {
            1: {
              lineItemNo: "1",
              lineItemId: "68E6D829-5F15-4908-8FD6-096120C0C5AF",
              status: "0003",
              itemName: "Methotrexate 10mg/0.2ml solution for injection pre-filled syringes",
              quantity: 1,
              quantityForm: "pre-filled disposable injection"
            }
          }
        },
        "20250701131500268279_99E058_1614371148": {
          dispenseNotificationId: "11FBC05E-E1D4-4FF2-A384-E0FAE93DB8B3",
          dispenseNotificationDocumentKey: "20250701131500268279_99E058_1614371148",
          timestamp: "2023-08-29T15:46:00.000Z",
          status: "0006",
          isLastDispenseNotification: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              lineItemId: "68E6D829-5F15-4908-8FD6-096120C0C5AF",
              status: "0001",
              itemName: "Methotrexate 10mg/0.2ml solution for injection pre-filled syringes",
              quantity: 1,
              quantityForm: "pre-filled disposable injection"
            }
          }
        }
      },
      history: {
        2: {
          eventId: "2",
          internalId: "20250701131247000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-07-01T13:12:47.000Z",
          org: "A99968",
          newStatus: "0001",
          isDispenseNotification: false
        },
        3: {
          eventId: "3",
          internalId: "20250701131410000000_HISTORY_RELEASE",
          message: "Release Request successful",
          timestamp: "2025-07-01T13:14:10.000Z",
          org: "FA565",
          newStatus: "0002",
          isDispenseNotification: false
        },
        4: {
          eventId: "4",
          internalId: "20250701131454709685_DF2826_1614371148",
          message: "Dispense notification successful",
          timestamp: "2025-07-01T13:14:54.000Z",
          org: "FA565",
          newStatus: "0003",
          isDispenseNotification: true
        },
        5: {
          eventId: "5",
          internalId: "20250701131500268279_99E058_1614371148",
          message: "Dispense notification successful",
          timestamp: "2025-07-01T13:15:00.000Z",
          org: "FA565",
          newStatus: "0006",
          isDispenseNotification: true
        },
        6: {
          eventId: "6",
          internalId: "20250701131541000000_HISTORY_WITHDRAWAL",
          message: "Dispense Withdrawal successful",
          timestamp: "2025-07-01T13:15:41.000Z",
          org: "X25",
          newStatus: "0003",
          isDispenseNotification: false
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteWithWithdrawnDispenseNotification, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns an acute prescription with a withdrawn amendment", async () => {
    const expected: Prescription = {
      prescriptionId: "D35F49-A83008-F621DP",
      nhsNumber: "9651193484",
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
      issueDate: "2025-07-01T13:20:02.000Z",
      issueNumber: 1,
      status: "0006",
      prescriptionPendingCancellation: false,
      treatmentType: "0001",
      prescriptionType: "1001",
      daysSupply: 28,
      prescriberOrg: "A99968",
      nominatedDispenserOrg: "FA565",
      nominatedDisperserType: "P1",
      dispenserOrg: "FA565",
      lastDispenseNotification: "F591B992-F8D9-4E10-BB62-E0D0FB06AF22",
      lineItems: {
        1: {
          lineItemNo: "1",
          lineItemId: "A0A5B176-887D-4014-8ABB-FA730B97DB55",
          status: "0001",
          itemName: "Methotrexate 10mg/0.2ml solution for injection pre-filled syringes",
          quantity: 1,
          quantityForm: "pre-filled disposable injection",
          dosageInstruction: "Inject 10 milligram - 5 times a day - Subcutaneous route - for 10 days",
          pendingCancellation: false
        }
      },
      dispenseNotifications: {
        "20250701132045768648_BF73BA_1614371148": {
          dispenseNotificationId: "F591B992-F8D9-4E10-BB62-E0D0FB06AF22",
          dispenseNotificationDocumentKey: "20250701132045768648_BF73BA_1614371148",
          timestamp: "2023-08-29T15:46:00.000Z",
          status: "0006",
          isLastDispenseNotification: true,
          lineItems: {
            1: {
              lineItemNo: "1",
              lineItemId: "A0A5B176-887D-4014-8ABB-FA730B97DB55",
              status: "0001",
              itemName: "Methotrexate 10mg/0.2ml solution for injection pre-filled syringes",
              quantity: 1,
              quantityForm: "pre-filled disposable injection"
            }
          }
        },
        "20250701132049868382_4DB207_1614371148": {
          dispenseNotificationId: "83DBA921-DFB4-4BFB-B5B5-AB6824CD35ED",
          dispenseNotificationDocumentKey: "20250701132049868382_4DB207_1614371148",
          timestamp: "2023-08-29T15:46:00.000Z",
          status: "0006",
          isLastDispenseNotification: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              lineItemId: "A0A5B176-887D-4014-8ABB-FA730B97DB55",
              status: "0001",
              itemName: "Azithromycin 250mg capsules",
              quantity: 13,
              quantityForm: "tablets"
            }
          }
        }
      },
      history: {
        2: {
          eventId: "2",
          internalId: "20250701132005000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-07-01T13:20:05.000Z",
          org: "A99968",
          newStatus: "0001",
          isDispenseNotification: false
        },
        3: {
          eventId: "3",
          internalId: "20250701132037_HISTORY_RELEASE",
          message: "Release Request successful",
          timestamp: "2025-07-01T13:20:37.000Z",
          org: "FA565",
          newStatus: "0002",
          isDispenseNotification: false
        },
        4: {
          eventId: "4",
          internalId: "20250701132045768648_BF73BA_1614371148",
          message: "Dispense notification successful",
          timestamp: "2025-07-01T13:20:45.000Z",
          org: "FA565",
          newStatus: "0006",
          isDispenseNotification: true
        },
        5: {
          eventId: "5",
          internalId: "20250701132049868382_4DB207_1614371148",
          message: "Dispense notification successful",
          timestamp: "2025-07-01T13:20:49.000Z",
          org: "FA565",
          newStatus: "0006",
          isDispenseNotification: true
        },
        6: {
          eventId: "6",
          internalId: "20250701132110000000_HISTORY_WITHDRAWAL",
          message: "Dispense Withdrawal successful",
          timestamp: "2025-07-01T13:21:10.000Z",
          org: "X25",
          newStatus: "0006",
          isDispenseNotification: false
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteWithWithdrawnAmendment, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns a withdrawn acute prescription", async () => {
    const expected: Prescription = {
      prescriptionId: "C0503B-A83008-9DAB3Z",
      nhsNumber: "9651193484",
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
      issueDate: "2025-07-01T10:36:13.000Z",
      issueNumber: 1,
      status: "0002",
      prescriptionPendingCancellation: false,
      treatmentType: "0001",
      prescriptionType: "1001",
      daysSupply: 28,
      prescriberOrg: "A99968",
      nominatedDispenserOrg: "FA565",
      nominatedDisperserType: "P1",
      dispenserOrg: "VNFKT",
      lineItems: {
        1: {
          lineItemNo: "1",
          lineItemId: "82D17E9A-A5A2-4DE1-9F78-324BE5892119",
          status: "0008",
          itemName: "Methotrexate 10mg/0.2ml solution for injection pre-filled syringes",
          quantity: 1,
          quantityForm: "pre-filled disposable injection",
          dosageInstruction: "Inject 10 milligram - 5 times a day - Subcutaneous route - for 10 days",
          pendingCancellation: false
        }
      },
      dispenseNotifications: {
        "20250701103621847697_9F46B0_1614371148": {
          dispenseNotificationId: "A55BCAA4-64D3-467F-A538-17A6B2FB2A09",
          dispenseNotificationDocumentKey: "20250701103621847697_9F46B0_1614371148",
          timestamp: "2025-07-01T10:36:21.000Z",
          status: "0006",
          isLastDispenseNotification: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              lineItemId: "82D17E9A-A5A2-4DE1-9F78-324BE5892119",
              status: "0001",
              itemName: "Methotrexate 10mg/0.2ml solution for injection pre-filled syringes",
              quantity: 1,
              quantityForm: "pre-filled disposable injection"
            }
          }
        }
      },
      history: {
        2: {
          eventId: "2",
          internalId: "20250701103613000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-07-01T10:36:13.000Z",
          org: "A99968",
          newStatus: "0001",
          isDispenseNotification: false
        },
        3: {
          eventId: "3",
          internalId: "20250701103617000000_HISTORY_RELEASE",
          message: "Release Request successful",
          timestamp: "2025-07-01T10:36:17.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false
        },
        4: {
          eventId: "4",
          internalId: "20250701103621847697_9F46B0_1614371148",
          message: "Dispense notification successful",
          timestamp: "2025-07-01T10:36:21.000Z",
          org: "FA565",
          newStatus: "0006",
          isDispenseNotification: true
        },
        5: {
          eventId: "5",
          internalId: "20250701103627000000_HISTORY_WITHDRAWAL",
          message: "Dispense Withdrawal successful",
          timestamp: "2025-07-01T10:36:27.000Z",
          org: "VNE51",
          newStatus: "0002",
          isDispenseNotification: false
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteWithdrawn, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns an acute prescription without optional dosage instructions", async () => {
    const expected: Prescription = {
      prescriptionId: "C0C3E6-A83008-93D8FL",
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
      lastDispenseNotification: "DF525024-FD4E-4292-9FF6-B67025791B69",
      lineItems: {
        1: {
          lineItemNo: "1",
          lineItemId: "D37FD639-E831-420C-B37B-40481DCA910E",
          status: "0001",
          itemName: "Amoxicillin 250mg capsules",
          quantity: 20,
          quantityForm: "tablet",
          pendingCancellation: false
        },
        2: {
          lineItemNo: "2",
          lineItemId: "407685A2-A1A2-4B6B-B281-CAED41733C2B",
          status: "0001",
          itemName: "Co-codamol 30mg/500mg tablets",
          quantity: 20,
          quantityForm: "tablet",
          pendingCancellation: false
        },
        3: {
          lineItemNo: "3",
          lineItemId: "20D6D69F-7BDD-4798-86DF-30F902BD2936",
          status: "0001",
          itemName: "Pseudoephedrine hydrochloride 60mg tablets",
          quantity: 30,
          quantityForm: "tablet",
          pendingCancellation: false
        },
        4: {
          lineItemNo: "4",
          lineItemId: "BF1B0BD8-0E6D-4D90-989E-F32065200CA3",
          status: "0001",
          itemName: "Azithromycin 250mg capsules",
          quantity: 30,
          quantityForm: "tablet",
          pendingCancellation: false
        }
      },
      dispenseNotifications: {
        "20250424111602543458_4D3B83_1614371148": {
          dispenseNotificationId: "DF525024-FD4E-4292-9FF6-B67025791B69",
          dispenseNotificationDocumentKey: "20250424111602543458_4D3B83_1614371148",
          timestamp: "2025-04-24T11:15:49.000Z",
          status: "0006",
          isLastDispenseNotification: true,
          lineItems: {
            1: {
              lineItemNo: "1",
              lineItemId: "D37FD639-E831-420C-B37B-40481DCA910E",
              status: "0001",
              itemName: "Amoxicillin 250mg capsules",
              quantity: 20,
              quantityForm: "tablet"
            },
            2: {
              lineItemNo: "2",
              lineItemId: "407685A2-A1A2-4B6B-B281-CAED41733C2B",
              status: "0001",
              itemName: "Co-codamol 30mg/500mg tablets",
              quantity: 20,
              quantityForm: "tablet"
            },
            3: {
              lineItemNo: "3",
              lineItemId: "20D6D69F-7BDD-4798-86DF-30F902BD2936",
              status: "0001",
              itemName: "Pseudoephedrine hydrochloride 60mg tablets",
              quantity: 30,
              quantityForm: "tablet"
            },
            4: {
              lineItemNo: "4",
              lineItemId: "BF1B0BD8-0E6D-4D90-989E-F32065200CA3",
              status: "0001",
              itemName: "Azithromycin 250mg capsules",
              quantity: 30,
              quantityForm: "tablet"
            }
          }
        }
      },
      history: {
        2: {
          eventId: "2",
          internalId: "20250424111005000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-04-24T11:10:05.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false
        },
        3: {
          eventId: "3",
          internalId: "20250424111244000000_HISTORY_RELEASE",
          message: "Release Request successful",
          timestamp: "2025-04-24T11:12:44.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false
        },
        4: {
          eventId: "4",
          internalId: "20250424111602543458_4D3B83_1614371148",
          message: "Dispense notification successful",
          timestamp: "2025-04-24T11:16:02.000Z",
          org: "FA565",
          newStatus: "0006",
          isDispenseNotification: true
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteWithoutOptionalDosageInstructions, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns a created erd", async () => {
    const expected: Prescription = {
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
          internalId: "20250429162913000000_HISTORY_UPLOAD",
          message: "Prescription upload successful",
          timestamp: "2025-04-29T16:29:13.000Z",
          org: "A99968",
          newStatus: "0001",
          isDispenseNotification: false
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(erdCreated, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns undefined and a 404 error when the spine response contains a not found error,", async () => {
    const expected: ServiceError = {
      description: "Prescription not found",
      severity: "error",
      status: 404
    }

    const result: ParsedSpineResponse = parseSpineResponse(notFound, logger)
    expect(result).toEqual({spineError: expected})
  })

  it("returns undefined and a 500 error when the spine response contains an error,", async () => {
    const expected: ServiceError = {
      description: "Unknown Error",
      severity: "error",
      status: 500
    }

    const result: ParsedSpineResponse = parseSpineResponse(unknownError, logger)
    expect(result).toEqual({spineError: expected})
  })

  it("returns undefined and a 500 error when the spine response contains an error,", async () => {
    const expected: ServiceError = {
      description: "Unknown Error",
      severity: "error",
      status: 500
    }

    const result: ParsedSpineResponse = parseSpineResponse(malformedError, logger)
    expect(result).toEqual({spineError: expected})
  })

  it("returns undefined and a 500 error when the spine response contains invalid xml,", async () => {
    const expected: ServiceError = {
      description: "Unknown Error.",
      severity: "error",
      status: 500
    }

    const result: ParsedSpineResponse = parseSpineResponse("", logger)
    expect(result).toEqual({spineError: expected})
  })
})
