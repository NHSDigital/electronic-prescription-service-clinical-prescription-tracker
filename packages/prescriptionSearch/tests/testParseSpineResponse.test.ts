/* eslint-disable max-len */
import {Logger} from "@aws-lambda-powertools/logger"
import {
  ParsedSpineResponse,
  parseSpineResponse,
  Prescription,
  SpineJsonResponse
} from "../src/parseSpineResponse"
import {
  error,
  errorAlt,
  multipleAcute,
  multipleErd,
  multipleIncR1,
  multipleMixed,
  multipleRepeat,
  notFound,
  singleAcute,
  singleAcuteWithoutOptionalPatientDetails,
  singleErd,
  singleRepeat
} from "./examples/examples"

const logger: Logger = new Logger({serviceName: "prescriptionSearch", logLevel: "DEBUG"})

describe("Test parseSpineResponse", () => {
  it("returns a correctly parsed response and no error when spine returns a single acute prescription", async () => {
    const expected: Array<Prescription> = [
      {
        nhsNumber: "5839945242",
        prefix: "MS",
        suffix: "OBE",
        family: "TWITCHETT",
        given: "STACEY",
        prescriptionId: "335C70-A83008-84058A",
        issueDate: "2025-02-04T00:00:00.000Z",
        treatmentType: "0001",
        issueNumber: 1,
        status: "0001",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      }
    ]
    const result: ParsedSpineResponse = parseSpineResponse(singleAcute as SpineJsonResponse, logger)
    expect(result).toEqual({prescriptions: expected})
  })

  it("returns a correctly parsed response and no error when spine returns a single acute prescription without a patient name", async () => {
    const expected: Array<Prescription> = [
      {
        nhsNumber: "5839945242",
        prescriptionId: "335C70-A83008-84058A",
        issueDate: "2025-02-04T00:00:00.000Z",
        treatmentType: "0001",
        issueNumber: 1,
        status: "0001",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      }
    ]
    const result: ParsedSpineResponse = parseSpineResponse(singleAcuteWithoutOptionalPatientDetails as SpineJsonResponse, logger)
    expect(result).toEqual({prescriptions: expected})
  })

  it("returns a correctly parsed response and no error when spine returns multiple acute prescriptions", async () => {
    const expected: Array<Prescription> = [
      {
        nhsNumber: "5839945242",
        prefix: "MS",
        given: "STACEY",
        family: "TWITCHETT",
        prescriptionId: "335C70-A83008-84058A",
        issueDate: "2025-02-04T00:00:00.000Z",
        treatmentType: "0001",
        issueNumber: 1,
        status: "0001",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: true
      },
      {
        nhsNumber: "5839945242",
        prefix: "MS",
        given: "STACEY",
        family: "TWITCHETT",
        prescriptionId: "5ABA40-000X26-D48018",
        issueDate: "2025-02-04T00:00:00.000Z",
        treatmentType: "0001",
        issueNumber: 1,
        status: "0001",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      }
    ]
    const result: ParsedSpineResponse = parseSpineResponse(multipleAcute as SpineJsonResponse, logger)
    expect(result).toEqual({prescriptions: expected})
  })

  it("It returns a correctly parsed response and no error when spine returns a single erd prescription", async () => {
    const expected: Array<Prescription> = [
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "2025-02-05T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 1,
        status: "0001",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "2025-02-05T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 2,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "2025-02-05T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 3,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "2025-02-05T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 4,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "2025-02-05T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 5,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "2025-02-05T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 6,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "2025-02-05T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 7,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      }
    ]
    const result: ParsedSpineResponse = parseSpineResponse(singleErd as SpineJsonResponse, logger)
    expect(result).toEqual({prescriptions: expected})
  })

  it("returns a correctly parsed response and no error when spine returns multiple erd prescriptions", async () => {
    const expected: Array<Prescription> = [
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "05BF8D-A83008-F11164",
        issueDate: "2025-03-03T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 1,
        status: "0001",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "05BF8D-A83008-F11164",
        issueDate: "2025-03-03T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 2,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "05BF8D-A83008-F11164",
        issueDate: "2025-03-03T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 3,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "05BF8D-A83008-F11164",
        issueDate: "2025-03-03T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 4,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "05BF8D-A83008-F11164",
        issueDate: "2025-03-03T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 5,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "05BF8D-A83008-F11164",
        issueDate: "2025-03-03T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 6,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "05BF8D-A83008-F11164",
        issueDate: "2025-03-03T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 7,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "4DDA5B-A83008-0530E5",
        issueDate: "2025-02-28T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 1,
        status: "0001",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "4DDA5B-A83008-0530E5",
        issueDate: "2025-02-28T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 2,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "4DDA5B-A83008-0530E5",
        issueDate: "2025-02-28T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 3,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "4DDA5B-A83008-0530E5",
        issueDate: "2025-02-28T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 4,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "4DDA5B-A83008-0530E5",
        issueDate: "2025-02-28T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 5,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "4DDA5B-A83008-0530E5",
        issueDate: "2025-02-28T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 6,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "4DDA5B-A83008-0530E5",
        issueDate: "2025-02-28T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 7,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      }
    ]
    const result: ParsedSpineResponse = parseSpineResponse(multipleErd as SpineJsonResponse, logger)
    expect(result).toEqual({prescriptions: expected})
  })

  it("returns a correctly parsed response and no error when spine returns a single repeat prescription", async () => {
    const expected: Array<Prescription> = [
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        family: "CORY",
        given: "ETTA",
        prescriptionId: "1CFAAA-A83008-BE0B3Y",
        issueDate: "2025-02-12T12:23:02.000Z",
        treatmentType: "0002",
        maxRepeats: 1,
        issueNumber: 1,
        status: "0001",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      }
    ]
    const result: ParsedSpineResponse = parseSpineResponse(singleRepeat as SpineJsonResponse, logger)
    expect(result).toEqual({prescriptions: expected})
  })

  it("returns a correctly parsed response and no error when spine returns multiple repeat prescriptions", async () => {
    const expected: Array<Prescription> = [
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        family: "CORY",
        given: "ETTA",
        prescriptionId: "1CFAAA-A83008-BE0B3Y",
        issueDate: "2025-02-12T12:23:02.000Z",
        treatmentType: "0002",
        maxRepeats: 1,
        issueNumber: 1,
        status: "0001",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        family: "CORY",
        given: "ETTA",
        prescriptionId: "5ABA40-000X26-D48018",
        issueDate: "2025-02-12T12:23:02.000Z",
        treatmentType: "0002",
        maxRepeats: 1,
        issueNumber: 1,
        status: "0001",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      }
    ]
    const result: ParsedSpineResponse = parseSpineResponse(multipleRepeat as SpineJsonResponse, logger)
    expect(result).toEqual({prescriptions: expected})
  })

  it("returns a correctly parsed response and no error when spine returns multiple mixed prescriptions", async () => {
    const expected: Array<Prescription> = [
      {
        nhsNumber: "5839945242",
        prefix: "MS",
        family: "TWITCHETT",
        given: "STACEY",
        prescriptionId: "335C70-A83008-84058A",
        issueDate: "2025-02-04T00:00:00.000Z",
        treatmentType: "0001",
        maxRepeats: undefined,
        issueNumber: 1,
        status: "0001",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "5839945242",
        prefix: "MS",
        family: "TWITCHETT",
        given: "STACEY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "2025-02-05T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 1,
        status: "0001",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "5839945242",
        prefix: "MS",
        family: "TWITCHETT",
        given: "STACEY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "2025-02-05T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 2,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "5839945242",
        prefix: "MS",
        family: "TWITCHETT",
        given: "STACEY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "2025-02-05T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 3,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "5839945242",
        prefix: "MS",
        family: "TWITCHETT",
        given: "STACEY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "2025-02-05T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 4,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "5839945242",
        prefix: "MS",
        family: "TWITCHETT",
        given: "STACEY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "2025-02-05T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 5,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "5839945242",
        prefix: "MS",
        family: "TWITCHETT",
        given: "STACEY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "2025-02-05T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 6,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "5839945242",
        prefix: "MS",
        family: "TWITCHETT",
        given: "STACEY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "2025-02-05T00:00:00.000Z",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 7,
        status: "9000",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "5839945242",
        prefix: "MS",
        family: "TWITCHETT",
        given: "STACEY",
        prescriptionId: "1CFAAA-A83008-BE0B3Y",
        issueDate: "2025-02-12T12:23:02.000Z",
        treatmentType: "0002",
        maxRepeats: 1,
        issueNumber: 1,
        status: "0001",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      }
    ]
    const result: ParsedSpineResponse = parseSpineResponse(multipleMixed as SpineJsonResponse, logger)
    expect(result).toEqual({prescriptions: expected})
  })

  it("returns a correctly parsed response and no error when spine returns a single deleted acute prescription", async () => {
    const mockPrescription = {...singleAcute}
    mockPrescription.Response.prescriptions[0].nextActivity = "purge"

    const expected: Array<Prescription> = [
      {
        nhsNumber: "5839945242",
        prefix: "MS",
        suffix: "OBE",
        family: "TWITCHETT",
        given: "STACEY",
        prescriptionId: "335C70-A83008-84058A",
        issueDate: "2025-02-04T00:00:00.000Z",
        treatmentType: "0001",
        issueNumber: 1,
        status: "0001",
        deleted: true,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      }
    ]
    const result: ParsedSpineResponse = parseSpineResponse(mockPrescription as SpineJsonResponse, logger)
    expect(result).toEqual({prescriptions: expected})
  })

  it("returns a correctly parsed response when spine response contains an R1 prescription", async () => {
    const expected: Array<Prescription> = [
      {
        nhsNumber: "5839945242",
        prefix: "MS",
        suffix: "OBE",
        family: "TWITCHETT",
        given: "STACEY",
        prescriptionId: "335C70-A83008-84058A",
        issueDate: "2025-02-04T00:00:00.000Z",
        treatmentType: "0001",
        issueNumber: 1,
        status: "0001",
        deleted: false,
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      }
    ]
    const result: ParsedSpineResponse = parseSpineResponse(multipleIncR1 as SpineJsonResponse, logger)
    expect(result).toEqual({prescriptions: expected})
  })

  it("returns a correctly parsed response when spine returns not found", async () => {
    const result: ParsedSpineResponse = parseSpineResponse(notFound, logger)
    expect(result).toEqual({prescriptions: []})
  })

  it("returns undefined and an error when spine returns an error", async () => {
    const result: ParsedSpineResponse = parseSpineResponse(error, logger)
    expect(result).toEqual({
      spineError: {
        status: 500,
        severity: "error",
        description: "Invalid prescription checksum"
      }
    })
  })

  it("returns undefined and an error when spine returns an error with an alternative SOAP structure", async () => {
    const result: ParsedSpineResponse = parseSpineResponse(errorAlt, logger)
    expect(result).toEqual({
      spineError: {
        status: 500,
        severity: "error",
        description: "Invalid prescription checksum"
      }
    })
  })

  it("returns undefined and an error when spine returns an invalid response", async () => {
    const result: ParsedSpineResponse = parseSpineResponse("invalid", logger)
    expect(result).toEqual({
      spineError: {
        status: 500,
        severity: "error",
        description: "Unknown Error."
      }
    })
  })

  it("returns undefined and an error when spine returns an invalid json response", async () => {
    const mockResponse = {test: "invalid"} as unknown as SpineJsonResponse
    const result: ParsedSpineResponse = parseSpineResponse(mockResponse, logger)
    expect(result).toEqual({
      spineError: {
        status: 500,
        severity: "error",
        description: "Unknown Error."
      }
    })
  })
})
