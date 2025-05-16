/* eslint-disable @typescript-eslint/no-unused-vars */
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
  acuteWithItemPartiallyDispensed,
  acuteWithItemPendingCancellation,
  acuteWithoutOptionalDaysSupply,
  acuteWithoutOptionalDosageInstructions,
  acuteWithoutOptionalPatientDetails,
  erdCreated,
  malformedError,
  notFound,
  unknownError
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
      itemsPendingCancellation: false,
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
          isDispenseNotification: false,
          isPrescriptionUpload: true,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0007"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0007"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0007"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
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
      itemsPendingCancellation: false,
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
          message: "Prescription upload successful",
          messageId: "32187B1F-9A74-4237-BD41-B4811D4282A7",
          timestamp: "2025-04-29T14:13:02.000Z",
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
      itemsPendingCancellation: false,
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
          message: "Prescription upload successful",
          messageId: "F1204DE7-9434-4EDE-B1A2-ACB849891919",
          timestamp: "2025-04-24T11:10:05.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false,
          isPrescriptionUpload: true,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0007"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0007"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0007"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
        },
        3: {
          eventId: "3",
          message: "Release Request successful",
          messageId: "C85C92E5-9793-4EE7-806B-AD1D678094D5",
          timestamp: "2025-04-24T11:12:44.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false,
          isPrescriptionUpload: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0008"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0008"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0008"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0008"
            }
          }
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
        "DF525024-FD4E-4292-9FF6-B67025791B69": {
          dispenseNotificationId: "DF525024-FD4E-4292-9FF6-B67025791B69",
          timestamp: "2025-04-24T11:15:49.000Z",
          status: "0006",
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
          message: "Prescription upload successful",
          messageId: "F1204DE7-9434-4EDE-B1A2-ACB849891919",
          timestamp: "2025-04-24T11:10:05.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false,
          isPrescriptionUpload: true,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0007"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0007"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0007"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
        },
        3: {
          eventId: "3",
          message: "Release Request successful",
          messageId: "C85C92E5-9793-4EE7-806B-AD1D678094D5",
          timestamp: "2025-04-24T11:12:44.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false,
          isPrescriptionUpload: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0008"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0008"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0008"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0008"
            }
          }
        },
        4: {
          eventId: "4",
          message: "Dispense notification successful; Update applied to issue=1",
          messageId: "DF525024-FD4E-4292-9FF6-B67025791B69",
          timestamp: "2025-04-24T11:16:02.000Z",
          org: "FA565",
          newStatus: "0006",
          isDispenseNotification: true,
          isPrescriptionUpload: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0001"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0001"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0001"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0001"
            }
          }
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
          message: "Dispense notification successful; Update applied to issue=1",
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
      itemsPendingCancellation: false,
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
          message: "Prescription upload successful",
          messageId: "916B1535-8912-42BD-9CB8-273EE88B65B4",
          timestamp: "2025-04-24T12:26:12.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false,
          isPrescriptionUpload: true,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0007"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0007"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0007"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
        },
        3: {
          eventId: "3",
          message: "Prescription/item was cancelled",
          messageId: "0B1C1EFC-84F4-497F-BDB5-6A2E6E109954",
          timestamp: "2025-04-24T12:26:21.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false,
          isPrescriptionUpload: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0005",
              cancellationReason: "Prescribing Error"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0007"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0007"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
        },
        4: {
          eventId: "4",
          message: "Prescription/item was cancelled",
          messageId: "79495C27-D892-4D27-9D14-3E1E13189A51",
          timestamp: "2025-04-24T12:26:30.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false,
          isPrescriptionUpload: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0005",
              cancellationReason: "Prescribing Error"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0005",
              cancellationReason: "Prescribing Error"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0007"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
        },
        5: {
          eventId: "5",
          message: "Prescription/item was cancelled",
          messageId: "2BE8F145-FD8B-4786-86F3-79D03A2E77C3",
          timestamp: "2025-04-24T12:26:40.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false,
          isPrescriptionUpload: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0005",
              cancellationReason: "Prescribing Error"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0005",
              cancellationReason: "Prescribing Error"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0005",
              cancellationReason: "Prescribing Error"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
        },
        6: {
          eventId: "6",
          message: "Prescription/item was cancelled",
          messageId: "4FCC251F-BD2C-4D11-BC8F-BFB12EE03997",
          timestamp: "2025-04-24T12:26:47.000Z",
          org: "A83008",
          newStatus: "0005",
          isDispenseNotification: false,
          isPrescriptionUpload: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0005",
              cancellationReason: "Prescribing Error"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0005",
              cancellationReason: "Prescribing Error"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0005",
              cancellationReason: "Prescribing Error"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0005",
              cancellationReason: "Prescribing Error"
            }
          }
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
      itemsPendingCancellation: false,
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
          message: "Prescription upload successful",
          messageId: "F197EEFF-16CE-473E-A5FC-D3D1DAEC9CD8",
          timestamp: "2025-04-24T11:20:54.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false,
          isPrescriptionUpload: true,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0007"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0007"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0007"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
        },
        3: {
          eventId: "3",
          message: "Prescription/item was cancelled",
          messageId: "2D58192A-3A62-4D99-93CD-F49162053CF3",
          timestamp: "2025-04-24T11:21:32.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false,
          isPrescriptionUpload: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0005",
              cancellationReason: "Prescribing Error"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0007"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0007"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
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
        "70EE28E2-896B-448F-9454-4DD333141CFB": {
          dispenseNotificationId: "70EE28E2-896B-448F-9454-4DD333141CFB",
          timestamp: "2025-04-24T11:36:46.000Z",
          status: "0003",
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
            }
          }
        }
      },
      history: {
        2: {
          eventId: "2",
          message: "Prescription upload successful",
          messageId: "3B3D0C25-A95E-4F7A-A5F5-16C79E35249B",
          timestamp: "2025-04-24T11:35:25.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false,
          isPrescriptionUpload: true,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0007"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0007"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0007"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
        },
        3: {
          eventId: "3",
          message: "Release Request successful",
          messageId: "C7784FC6-3CF8-48E7-B373-D55426DEEDEF",
          timestamp: "2025-04-24T11:35:30.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false,
          isPrescriptionUpload: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0008"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0008"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0008"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0008"
            }
          }
        },
        4: {
          eventId: "4",
          message: "Dispense notification successful; Update applied to issue=1",
          messageId: "70EE28E2-896B-448F-9454-4DD333141CFB",
          timestamp: "2025-04-24T11:36:58.000Z",
          org: "FA565",
          newStatus: "0003",
          isDispenseNotification: true,
          isPrescriptionUpload: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0001"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0001"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0004"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0004"
            }
          }
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
          message: "Prescription upload successful",
          messageId: "345FC11F-FF5C-4AE2-9FD6-A3F20FDB849A",
          timestamp: "2025-04-24T11:44:57.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false,
          isPrescriptionUpload: true,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0007"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0007"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0007"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
        },
        3: {
          eventId: "3",
          message: "Release Request successful",
          messageId: "E2463A18-C098-4B2A-B723-1D7779DEAA26",
          timestamp: "2025-04-24T11:45:12.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false,
          isPrescriptionUpload: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0008"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0008"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0008"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0008"
            }
          }
        },
        4: {
          eventId: "4",
          message: "Dispense notification successful; Update applied to issue=1",
          messageId: "42A6A1A0-596C-482C-B018-0D15F8FFF9F3",
          timestamp: "2025-04-24T11:45:32.000Z",
          org: "FA565",
          newStatus: "0003",
          isDispenseNotification: true,
          isPrescriptionUpload: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0003"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0001"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0001"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0001"
            }
          }
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteWithItemPartiallyDispensed, logger)
    expect(result).toEqual({prescription: expected})
  })

  it("returns a correctly parsed response and no error when spine returns an acute prescription with multiple dispense notifications", async () => {
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
              quantityForm: "tablet"
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
          isDispenseNotification: false,
          isPrescriptionUpload: true,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0007"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0007"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0007"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
        },
        3: {
          eventId: "3",
          message: "Release Request successful",
          messageId: "E2463A18-C098-4B2A-B723-1D7779DEAA26",
          timestamp: "2025-04-24T11:45:12.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false,
          isPrescriptionUpload: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0008"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0008"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0008"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0008"
            }
          }
        },
        4: {
          eventId: "4",
          message: "Dispense notification successful; Update applied to issue=1",
          messageId: "42A6A1A0-596C-482C-B018-0D15F8FFF9F3",
          timestamp: "2025-04-24T11:45:32.000Z",
          org: "FA565",
          newStatus: "0003",
          isDispenseNotification: true,
          isPrescriptionUpload: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0003"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0001"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0001"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0001"
            }
          }
        },
        5: {
          eventId: "5",
          message: "Dispense notification successful; Update applied to issue=1",
          messageId: "B358A55E-A423-48E2-A9D8-2612B4E66604",
          timestamp: "2025-04-24T11:49:41.000Z",
          org: "FA565",
          newStatus: "0006",
          isDispenseNotification: true,
          isPrescriptionUpload: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0001"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0001"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0001"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0001"
            }
          }
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteMultipleDispenseNotifications, logger)
    expect(result).toEqual({prescription: expected})
  })

  /*it("returns a correctly parsed response and no error when spine returns an acute prescription pending cancellation", async () => {
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
      itemsPendingCancellation: true,
      treatmentType: "0001",
      prescriptionType: "0101",
      daysSupply: 28,
      prescriberOrg: "A83008",
      nominatedDispenserOrg: "FA565",
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
          cancellationReason: "Pending: Prescribing Error",
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
          cancellationReason: "Pending: Prescribing Error",
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
          cancellationReason: "Pending: Prescribing Error",
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
          cancellationReason: "Pending: Prescribing Error",
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
          isDispenseNotification: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0007"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0007"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0007"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
        },
        3: {
          eventId: "3",
          message: "Release Request successful",
          messageId: "3339B7A4-4D62-48B3-A58B-9360D565CE68",
          timestamp: "2025-04-24T12:09:58.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0008"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0008"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0008"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0008"
            }
          }
        },
        4: {
          eventId: "4",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          messageId: "074269EB-C2AC-4571-B6A8-401B90A6F40A",
          timestamp: "2025-04-24T12:11:13.000Z",
          org: "A83008",
          newStatus: "0002",
          isDispenseNotification: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0008",
              cancellationReason: "Pending: Prescribing Error"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0008"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0008"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0008"
            }
          }
        },
        5: {
          eventId: "5",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          messageId: "7C6E7789-ED69-4580-A5AC-4F310CF652DA",
          timestamp: "2025-04-24T12:14:37.000Z",
          org: "A83008",
          newStatus: "0002",
          isDispenseNotification: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0008",
              cancellationReason: "Pending: Prescribing Error"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0008",
              cancellationReason: "Pending: Prescribing Error"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0008"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0008"
            }
          }
        },
        6: {
          eventId: "6",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          messageId: "F501683B-79A4-4032-A460-48B3BAB21C4C",
          timestamp: "2025-04-24T12:14:46.000Z",
          org: "A83008",
          newStatus: "0002",
          isDispenseNotification: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0008",
              cancellationReason: "Pending: Prescribing Error"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0008",
              cancellationReason: "Pending: Prescribing Error"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0008",
              cancellationReason: "Pending: Prescribing Error"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0008"
            }
          }
        },
        7: {
          eventId: "7",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          messageId: "B94DF589-CE8C-4740-8657-CB62428388A2",
          timestamp: "2025-04-24T12:14:57.000Z",
          org: "A83008",
          newStatus: "0002",
          isDispenseNotification: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0008",
              cancellationReason: "Pending: Prescribing Error"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0008",
              cancellationReason: "Pending: Prescribing Error"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0008",
              cancellationReason: "Pending: Prescribing Error"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0008",
              cancellationReason: "Pending: Prescribing Error"
            }
          }
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acutePendingCancellation, logger)
    expect(result).toEqual({prescription: expected})
  }) */

  /* it("returns a correctly parsed response and no error when spine returns an acute prescription with an item pending cancellation", async () => {
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
      itemsPendingCancellation: true,
      treatmentType: "0001",
      prescriptionType: "0101",
      daysSupply: 28,
      prescriberOrg: "A83008",
      nominatedDispenserOrg: "FA565",
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
          cancellationReason: "Pending: Prescribing Error",
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
          message: "Prescription upload successful",
          messageId: "1E042BB0-164D-48C2-B4F4-CB94771838A0",
          timestamp: "2025-04-24T12:09:53.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0007"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0007"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0007"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
        },
        3: {
          eventId: "3",
          message: "Release Request successful",
          messageId: "3339B7A4-4D62-48B3-A58B-9360D565CE68",
          timestamp: "2025-04-24T12:09:58.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0008"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0008"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0008"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0008"
            }
          }
        },
        4: {
          eventId: "4",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          messageId: "074269EB-C2AC-4571-B6A8-401B90A6F40A",
          timestamp: "2025-04-24T12:11:13.000Z",
          org: "A83008",
          newStatus: "0002",
          isDispenseNotification: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0008",
              cancellationReason: "Pending: Prescribing Error"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0008"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0008"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0008"
            }
          }
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteWithItemPendingCancellation, logger)
    expect(result).toEqual({prescription: expected})
  }) */

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
      itemsPendingCancellation: false,
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
          message: "Prescription upload successful",
          messageId: "916B1535-8912-42BD-9CB8-273EE88B65B4",
          timestamp: "2025-04-24T12:26:12.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false,
          isPrescriptionUpload: true,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0007"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0007"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0007"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
        },
        3: {
          eventId: "3",
          message: "Prescription/item was cancelled",
          messageId: "0B1C1EFC-84F4-497F-BDB5-6A2E6E109954",
          timestamp: "2025-04-24T12:26:21.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false,
          isPrescriptionUpload: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0005",
              cancellationReason: "Prescribing Error"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0007"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0007"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
        },
        4: {
          eventId: "4",
          message: "Prescription/item was cancelled",
          messageId: "79495C27-D892-4D27-9D14-3E1E13189A51",
          timestamp: "2025-04-24T12:26:30.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false,
          isPrescriptionUpload: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0005",
              cancellationReason: "Prescribing Error"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0005",
              cancellationReason: "Prescribing Error"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0007"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
        },
        5: {
          eventId: "5",
          message: "Prescription/item was cancelled",
          messageId: "2BE8F145-FD8B-4786-86F3-79D03A2E77C3",
          timestamp: "2025-04-24T12:26:40.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false,
          isPrescriptionUpload: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0005",
              cancellationReason: "Prescribing Error"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0005",
              cancellationReason: "Prescribing Error"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0005",
              cancellationReason: "Prescribing Error"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
        },
        6: {
          eventId: "6",
          message: "Prescription/item was cancelled",
          messageId: "4FCC251F-BD2C-4D11-BC8F-BFB12EE03997",
          timestamp: "2025-04-24T12:26:47.000Z",
          org: "A83008",
          newStatus: "0005",
          cancellationReason: "Prescribing Error",
          isDispenseNotification: false,
          isPrescriptionUpload: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0005",
              cancellationReason: "Prescribing Error"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0005",
              cancellationReason: "Prescribing Error"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0005",
              cancellationReason: "Prescribing Error"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0005",
              cancellationReason: "Prescribing Error"
            }
          }
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteHl7Cancelled, logger)
    expect(result).toEqual({prescription: expected})
  })

  /* it("returns a correctly parsed response and no error when spine returns an acute prescription pending HL7 cancellation", async () => {
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
      itemsPendingCancellation: true,
      treatmentType: "0001",
      prescriptionType: "0101",
      daysSupply: 28,
      prescriberOrg: "A83008",
      nominatedDispenserOrg: "FA565",
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
          cancellationReason: "Pending: Prescribing Error",
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
          cancellationReason: "Pending: Prescribing Error",
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
          cancellationReason: "Pending: Prescribing Error",
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
          cancellationReason: "Pending: Prescribing Error",
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
          isDispenseNotification: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0007"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0007"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0007"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
        },
        3: {
          eventId: "3",
          message: "Release Request successful",
          messageId: "3339B7A4-4D62-48B3-A58B-9360D565CE68",
          timestamp: "2025-04-24T12:09:58.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0008"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0008"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0008"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0008"
            }
          }
        },
        4: {
          eventId: "4",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          messageId: "074269EB-C2AC-4571-B6A8-401B90A6F40A",
          timestamp: "2025-04-24T12:11:13.000Z",
          org: "A83008",
          newStatus: "0002",
          isDispenseNotification: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0008",
              cancellationReason: "Pending: Prescribing Error"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0008"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0008"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0008"
            }
          }
        },
        5: {
          eventId: "5",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          messageId: "7C6E7789-ED69-4580-A5AC-4F310CF652DA",
          timestamp: "2025-04-24T12:14:37.000Z",
          org: "A83008",
          newStatus: "0002",
          isDispenseNotification: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0008",
              cancellationReason: "Pending: Prescribing Error"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0008",
              cancellationReason: "Pending: Prescribing Error"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0008"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0008"
            }
          }
        },
        6: {
          eventId: "6",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          messageId: "F501683B-79A4-4032-A460-48B3BAB21C4C",
          timestamp: "2025-04-24T12:14:46.000Z",
          org: "A83008",
          newStatus: "0002",
          isDispenseNotification: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0008",
              cancellationReason: "Pending: Prescribing Error"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0008",
              cancellationReason: "Pending: Prescribing Error"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0008",
              cancellationReason: "Pending: Prescribing Error"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0008"
            }
          }
        },
        7: {
          eventId: "7",
          message: "Prescription/item was not cancelled. With dispenser. Marked for cancellation",
          messageId: "B94DF589-CE8C-4740-8657-CB62428388A2",
          timestamp: "2025-04-24T12:14:57.000Z",
          org: "A83008",
          newStatus: "0002",
          cancellationReason: "Pending: Prescribing Error",
          isDispenseNotification: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0008",
              cancellationReason: "Pending: Prescribing Error"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0008",
              cancellationReason: "Pending: Prescribing Error"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0008",
              cancellationReason: "Pending: Prescribing Error"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0008",
              cancellationReason: "Pending: Prescribing Error"
            }
          }
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteHl7PendingCancellation, logger)
    expect(result).toEqual({prescription: expected})
  }) */

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
          message: "Dispense notification successful; Update applied to issue=1",
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
      itemsPendingCancellation: false,
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
          message: "Prescription upload successful",
          messageId: "F1204DE7-9434-4EDE-B1A2-ACB849891919",
          timestamp: "2025-04-24T11:10:05.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false,
          isPrescriptionUpload: true,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0007"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0007"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0007"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
        }
      }
    }

    const result: ParsedSpineResponse = parseSpineResponse(acuteWithoutOptionalDaysSupply, logger)
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
        "DF525024-FD4E-4292-9FF6-B67025791B69": {
          dispenseNotificationId: "DF525024-FD4E-4292-9FF6-B67025791B69",
          timestamp: "2025-04-24T11:15:49.000Z",
          status: "0006",
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
          message: "Prescription upload successful",
          messageId: "F1204DE7-9434-4EDE-B1A2-ACB849891919",
          timestamp: "2025-04-24T11:10:05.000Z",
          org: "A83008",
          newStatus: "0001",
          isDispenseNotification: false,
          isPrescriptionUpload: true,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0007"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0007"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0007"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0007"
            }
          }
        },
        3: {
          eventId: "3",
          message: "Release Request successful",
          messageId: "C85C92E5-9793-4EE7-806B-AD1D678094D5",
          timestamp: "2025-04-24T11:12:44.000Z",
          org: "VNFKT",
          newStatus: "0002",
          isDispenseNotification: false,
          isPrescriptionUpload: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0008"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0008"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0008"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0008"
            }
          }
        },
        4: {
          eventId: "4",
          message: "Dispense notification successful; Update applied to issue=1",
          messageId: "DF525024-FD4E-4292-9FF6-B67025791B69",
          timestamp: "2025-04-24T11:16:02.000Z",
          org: "FA565",
          newStatus: "0006",
          isDispenseNotification: true,
          isPrescriptionUpload: false,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0001"
            },
            2: {
              lineItemNo: "2",
              newStatus: "0001"
            },
            3: {
              lineItemNo: "3",
              newStatus: "0001"
            },
            4: {
              lineItemNo: "4",
              newStatus: "0001"
            }
          }
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
      itemsPendingCancellation: false,
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
          isDispenseNotification: false,
          isPrescriptionUpload: true,
          lineItems: {
            1: {
              lineItemNo: "1",
              newStatus: "0007"
            }
          }
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
      status: "404"
    }

    const result: ParsedSpineResponse = parseSpineResponse(notFound, logger)
    expect(result).toEqual({spineError: expected})
  })

  it("returns undefined and a 500 error when the spine response contains an error,", async () => {
    const expected: ServiceError = {
      description: "Unknown Error",
      severity: "error",
      status: "500"
    }

    const result: ParsedSpineResponse = parseSpineResponse(unknownError, logger)
    expect(result).toEqual({spineError: expected})
  })

  it("returns undefined and a 500 error when the spine response contains an error,", async () => {
    const expected: ServiceError = {
      description: "Unknown Error",
      severity: "error",
      status: "500"
    }

    const result: ParsedSpineResponse = parseSpineResponse(malformedError, logger)
    expect(result).toEqual({spineError: expected})
  })

  it("returns undefined and a 500 error when the spine response contains invalid xml,", async () => {
    const expected: ServiceError = {
      description: "Unknown Error.",
      severity: "error",
      status: "500"
    }

    const result: ParsedSpineResponse = parseSpineResponse("", logger)
    expect(result).toEqual({spineError: expected})
  })
})
