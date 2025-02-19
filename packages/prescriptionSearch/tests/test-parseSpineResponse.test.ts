import {parseSpineResponse} from "../src/parseSpineResponse"
import {
  singleAcute,
  singleErd,
  singleRepeat,
  multipleAcute,
  multipleErd,
  multipleRepeat,
  multipleMixed,
  notFound,
  error,
  invalid
} from "./exampleSpineResponses/examples"

// TODO: types
describe("Test parseSpineResponse", () => {
  it("returns a correctly parsed response and no error when spine returns a single acute prescription", async () => {
    const expected = [
      {
        nhsNumber: "5839945242",
        prefix: "MS",
        suffix: "",
        family: "TWITCHETT",
        given: "STACEY",
        prescriptionId: "335C70-A83008-84058A",
        issueDate: "20250204000000",
        treatmentType: "0001",
        maxRepeats: null,
        issueNumber: 1,
        status: "0001",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      }
    ]
    const result = parseSpineResponse(singleAcute)
    expect(result).toEqual([expected, undefined])
  })

  it("returns a correctly parsed response and no error when spine returns multiple acute prescriptions", async () => {
    const expected = [
      {
        nhsNumber: "5839945242",
        prefix: "MS",
        suffix: "",
        given: "STACEY",
        family: "TWITCHETT",
        prescriptionId: "335C70-A83008-84058A",
        issueDate: "20250204000000",
        treatmentType: "0001",
        maxRepeats: null,
        issueNumber: 1,
        status: "0001",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: true
      },
      {
        nhsNumber: "5839945242",
        prefix: "MS",
        suffix: "",
        given: "STACEY",
        family: "TWITCHETT",
        prescriptionId: "5ABA40-000X26-D48018",
        issueDate: "20250204000000",
        treatmentType: "0001",
        maxRepeats: null,
        issueNumber: 1,
        status: "0001",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      }
    ]
    const result = parseSpineResponse(multipleAcute)
    expect(result).toEqual([expected, undefined])
  })

  it("It returns a correctly parsed response and no error when spine returns a single erd prescription", async () => {
    const expected = [
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 1,
        status: "0001",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 2,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 3,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 4,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 5,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 6,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 7,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      }
    ]
    const result = parseSpineResponse(singleErd)
    expect(result).toEqual([expected, undefined])
  })

  it("returns a correctly parsed response and no error when spine returns multiple erd prescriptions", async () => {
    const expected = [
      {
        nhsNumber: "4669955012",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "5ABA40-000X26-D48018",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 1,
        status: "0001",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "4669955012",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "5ABA40-000X26-D48018",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 2,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "4669955012",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "5ABA40-000X26-D48018",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 3,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "4669955012",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "5ABA40-000X26-D48018",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 4,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "4669955012",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "5ABA40-000X26-D48018",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 5,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "4669955012",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "5ABA40-000X26-D48018",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 6,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "4669955012",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "5ABA40-000X26-D48018",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 7,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "4669955012",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "37E35F-000X26-FCC06H",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 1,
        status: "0001",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "4669955012",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "37E35F-000X26-FCC06H",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 2,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "4669955012",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "37E35F-000X26-FCC06H",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 3,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "4669955012",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "37E35F-000X26-FCC06H",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 4,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "4669955012",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "37E35F-000X26-FCC06H",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 5,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "4669955012",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "37E35F-000X26-FCC06H",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 6,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "4669955012",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "37E35F-000X26-FCC06H",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 7,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      }
    ]
    const result = parseSpineResponse(multipleErd)
    console.log(result)
    expect(result).toEqual([expected, undefined])
  })

  it("returns a correctly parsed response and no error when spine returns a single repeat prescription", async () => {
    const expected = [
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        suffix: "",
        family: "CORY",
        given: "ETTA",
        prescriptionId: "1CFAAA-A83008-BE0B3Y",
        issueDate: "20250212122302",
        treatmentType: "0002",
        maxRepeats: 1,
        issueNumber: 1,
        status: "0001",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      }
    ]
    const result = parseSpineResponse(singleRepeat)
    expect(result).toEqual([expected, undefined])
  })

  it("returns a correctly parsed response and no error when spine returns multiple repeat prescriptions", async () => {
    const expected = [
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        suffix: "",
        family: "CORY",
        given: "ETTA",
        prescriptionId: "1CFAAA-A83008-BE0B3Y",
        issueDate: "20250212122302",
        treatmentType: "0002",
        maxRepeats: 1,
        issueNumber: 1,
        status: "0001",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        suffix: "",
        family: "CORY",
        given: "ETTA",
        prescriptionId: "5ABA40-000X26-D48018",
        issueDate: "20250212122302",
        treatmentType: "0002",
        maxRepeats: 1,
        issueNumber: 1,
        status: "0001",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      }
    ]
    const result = parseSpineResponse(multipleRepeat)
    expect(result).toEqual([expected, undefined])
  })

  it("returns a correctly parsed response and no error when spine returns multiple mixed prescriptions", async () => {
    const expected = [
      {
        nhsNumber: "5839945242",
        prefix: "MS",
        suffix: "",
        family: "TWITCHETT",
        given: "STACEY",
        prescriptionId: "335C70-A83008-84058A",
        issueDate: "20250204000000",
        treatmentType: "0001",
        maxRepeats: null,
        issueNumber: 1,
        status: "0001",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 1,
        status: "0001",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 2,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 3,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 4,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 5,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 6,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        suffix: "",
        given: "ETTA",
        family: "CORY",
        prescriptionId: "0131A6-A83008-DDFE5P",
        issueDate: "20250205000000",
        treatmentType: "0003",
        maxRepeats: 7,
        issueNumber: 7,
        status: "9000",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      },
      {
        nhsNumber: "9732730684",
        prefix: "MISS",
        suffix: "",
        family: "CORY",
        given: "ETTA",
        prescriptionId: "1CFAAA-A83008-BE0B3Y",
        issueDate: "20250212122302",
        treatmentType: "0002",
        maxRepeats: 1,
        issueNumber: 1,
        status: "0001",
        prescriptionPendingCancellation: false,
        itemsPendingCancellation: false
      }
    ]
    const result = parseSpineResponse(multipleMixed)
    expect(result).toEqual([expected, undefined])
  })

  // todo: test for not found
  it("returns undefined and no error when spine returns not found", async () => {
    const result = parseSpineResponse(notFound)
    expect(result).toEqual([undefined, undefined])
  })

  it("returns undefined and an error when spine returns an error", async () => {
    const result = parseSpineResponse(error)
    expect(result).toEqual([
      undefined,
      {
        status: "500",
        severity: "error",
        description: "hl7:{interactionId}/hl7:ControlActEvent/hl7:author is missing, empty or invalid"
      }
    ])
  })

  it("returns undefined and an error when spine returns an invalid response", async () => {
    const result = parseSpineResponse(invalid)
    expect(result).toEqual([
      undefined,
      {
        status: "500",
        severity: "error",
        description: "Unknown Error."
      }
    ])
  })
})
