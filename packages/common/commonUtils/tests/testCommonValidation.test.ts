/* eslint-disable max-len */

import {jest} from "@jest/globals"
import {Logger} from "@aws-lambda-powertools/logger"
import {APIGatewayProxyEventHeaders} from "aws-lambda"
import {CommonHeaderParameters, ServiceError} from "@cpt-common/common-types/service"
import {validateCommonHeaders, validateNhsNumber, validatePrescriptionId} from "../src/commonValidation"

const logger: Logger = new Logger({serviceName: "commonUtils", logLevel: "DEBUG"})
const mockHeaders: APIGatewayProxyEventHeaders = {
  "x-request-id": "REQ-123-456-789",
  "nhsd-organization-uuid": "ORG-123-456-789",
  "nhsd-session-urid": "SESS-123-456-789",
  "nhsd-identity-uuid": "ID-123-456-789",
  "nhsd-session-jobrole": "JOB-123-456-789"
}

describe("Test validateCommonHeaders", () => {
  it("returns headers when called with valid headers", async () => {
    const expectedHeaders = {
      jobRoleCode: "JOB-123-456-789",
      organizationId: "ORG-123-456-789",
      requestId: "REQ-123-456-789",
      sdsId: "ID-123-456-789",
      sdsRoleProfileId: "SESS-123-456-789"
    }

    const [actualHeaders, actualError]: [CommonHeaderParameters, Array<ServiceError>] = validateCommonHeaders(mockHeaders, logger)
    expect(expectedHeaders).toEqual(actualHeaders)
    expect(actualError).toEqual([])
  })

  it("returns the correct error when x-request-id is missing from the requests headers", async () => {
    const headers: APIGatewayProxyEventHeaders = {...mockHeaders, "x-request-id": undefined}

    const expectedErrors: Array<ServiceError> = [{
      status: 400,
      severity: "error",
      description: "Missing required header, x-request-id."
    }]

    const [, actualError]: [CommonHeaderParameters, Array<ServiceError>] = validateCommonHeaders(headers, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("updates the logger when called with a x-request-id header", async () => {
    const appendKeySpy = jest.spyOn(Logger.prototype, "appendKeys")

    validateCommonHeaders(mockHeaders, logger)
    expect(appendKeySpy).toHaveBeenLastCalledWith({
      "x-request-id": "REQ-123-456-789"
    })
  })

  it("returns the correct error when nhsd-organization-uuid is missing from the requests headers", async () => {
    const headers: APIGatewayProxyEventHeaders = {...mockHeaders, "nhsd-organization-uuid": undefined}

    const expectedErrors: Array<ServiceError> = [{
      status: 400,
      severity: "error",
      description: "Missing required header, nhsd-organization-uuid."
    }]

    const [, actualError]: [CommonHeaderParameters, Array<ServiceError>] = validateCommonHeaders(headers, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("returns the correct error when nhsd-session-urid is missing from the requests headers", async () => {
    const headers: APIGatewayProxyEventHeaders = {...mockHeaders, "nhsd-session-urid": undefined}

    const expectedErrors: Array<ServiceError> = [{
      status: 400,
      severity: "error",
      description: "Missing required header, nhsd-session-urid."
    }]

    const [, actualError]: [CommonHeaderParameters, Array<ServiceError>] = validateCommonHeaders(headers, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("returns the correct error when nhsd-identity-uuid is missing from the requests headers", async () => {
    const headers: APIGatewayProxyEventHeaders = {...mockHeaders, "nhsd-identity-uuid": undefined}

    const expectedErrors: Array<ServiceError> = [{
      status: 400,
      severity: "error",
      description: "Missing required header, nhsd-identity-uuid."
    }]

    const [, actualError]: [CommonHeaderParameters, Array<ServiceError>] = validateCommonHeaders(headers, logger)
    expect(actualError).toEqual(expectedErrors)
  })

  it("returns the correct error when nhsd-session-jobrole is missing from the requests headers", async () => {
    const headers: APIGatewayProxyEventHeaders = {...mockHeaders, "nhsd-session-jobrole": undefined}

    const expectedErrors: Array<ServiceError> = [{
      status: 400,
      severity: "error",
      description: "Missing required header, nhsd-session-jobrole."
    }]

    const [, actualError]: [CommonHeaderParameters, Array<ServiceError>] = validateCommonHeaders(headers, logger)
    expect(actualError).toEqual(expectedErrors)
  })
})

describe("Test validatePrescriptionId", () => {
  it("returns no errors when called with a valid prescriptionId with a numeric checksum", () => {
    const mockPrescriptionId = "0308BB-000X26-4410B0"

    const expectedErrors: Array<ServiceError> = []

    const actualErrors = validatePrescriptionId(mockPrescriptionId, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns no errors when called with a valid prescriptionId with a alpha checksum", () => {
    const mockPrescriptionId = "54F746-A83008-E8A05J"

    const expectedErrors: Array<ServiceError> = []

    const actualErrors = validatePrescriptionId(mockPrescriptionId, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns no errors when called with a valid prescriptionId with a + checksum", () => {
    const mockPrescriptionId = "CBEF44-000X26-41E1B+"

    const expectedErrors: Array<ServiceError> = []

    const actualErrors = validatePrescriptionId(mockPrescriptionId, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns the correct errors when called with a invalid prescriptionId with a short first part", () => {
    const mockPrescriptionId = "CBEF4-000X26-41E1B+"

    const expectedErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "prescriptionId does not match required format."
      },
      {
        status: 400,
        severity: "error",
        description: "prescriptionId checksum is invalid."
      }
    ]

    const actualErrors = validatePrescriptionId(mockPrescriptionId, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns the correct errors when called with a invalid prescriptionId with a long first part", () => {
    const mockPrescriptionId = "CBEF444-000X26-41E1B+"

    const expectedErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "prescriptionId does not match required format."
      },
      {
        status: 400,
        severity: "error",
        description: "prescriptionId checksum is invalid."
      }
    ]

    const actualErrors = validatePrescriptionId(mockPrescriptionId, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns the correct errors when called with a invalid prescriptionId with non alphanumeric characters in the first part", () => {
    const mockPrescriptionId = "CBEF4?-000X26-41E1B+"

    const expectedErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "prescriptionId does not match required format."
      },
      {
        status: 400,
        severity: "error",
        description: "prescriptionId checksum is invalid."
      }
    ]

    const actualErrors = validatePrescriptionId(mockPrescriptionId, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns the correct errors when called with a invalid prescriptionId with a short middle part", () => {
    const mockPrescriptionId = "CBEF44-000X2-41E1B+"

    const expectedErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "prescriptionId does not match required format."
      },
      {
        status: 400,
        severity: "error",
        description: "prescriptionId checksum is invalid."
      }
    ]

    const actualErrors = validatePrescriptionId(mockPrescriptionId, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns the correct errors when called with a invalid prescriptionId with a long middle part", () => {
    const mockPrescriptionId = "CBEF44-000X266-41E1B+"

    const expectedErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "prescriptionId does not match required format."
      },
      {
        status: 400,
        severity: "error",
        description: "prescriptionId checksum is invalid."
      }
    ]

    const actualErrors = validatePrescriptionId(mockPrescriptionId, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns the correct errors when called with a invalid prescriptionId with non alphanumeric characters in the middle part", () => {
    const mockPrescriptionId = "CBEF44-000X2?-41E1B+"

    const expectedErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "prescriptionId does not match required format."
      },
      {
        status: 400,
        severity: "error",
        description: "prescriptionId checksum is invalid."
      }
    ]

    const actualErrors = validatePrescriptionId(mockPrescriptionId, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns the correct errors when called with a invalid prescriptionId with a short end part", () => {
    const mockPrescriptionId = "CBEF44-000X2-41E1B"

    const expectedErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "prescriptionId does not match required format."
      },
      {
        status: 400,
        severity: "error",
        description: "prescriptionId checksum is invalid."
      }
    ]

    const actualErrors = validatePrescriptionId(mockPrescriptionId, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns the correct errors when called with a invalid prescriptionId with a long end part", () => {
    const mockPrescriptionId = "CBEF44-000X2-41E1B+1"

    const expectedErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "prescriptionId does not match required format."
      },
      {
        status: 400,
        severity: "error",
        description: "prescriptionId checksum is invalid."
      }
    ]

    const actualErrors = validatePrescriptionId(mockPrescriptionId, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns the correct errors when called with a invalid prescriptionId with non alphanumeric characters in the end part", () => {
    const mockPrescriptionId = "CBEF44-000X2-41?1B+"

    const expectedErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "prescriptionId does not match required format."
      },
      {
        status: 400,
        severity: "error",
        description: "prescriptionId checksum is invalid."
      }
    ]

    const actualErrors = validatePrescriptionId(mockPrescriptionId, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns the correct errors when called with a invalid prescriptionId with invalid characters in the checksum", () => {
    const mockPrescriptionId = "CBEF44-000X2-411B?"

    const expectedErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "prescriptionId does not match required format."
      },
      {
        status: 400,
        severity: "error",
        description: "prescriptionId checksum is invalid."
      }
    ]

    const actualErrors = validatePrescriptionId(mockPrescriptionId, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns the correct errors when called with a invalid prescriptionId with invalid delimiters", () => {
    const mockPrescriptionId = "CBEF44_000X2_411B?"

    const expectedErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "prescriptionId does not match required format."
      },
      {
        status: 400,
        severity: "error",
        description: "prescriptionId checksum is invalid."
      }
    ]

    const actualErrors = validatePrescriptionId(mockPrescriptionId, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns the correct errors when called with an empty prescriptionId", () => {
    const mockPrescriptionId = ""

    const expectedErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "prescriptionId does not match required format."
      },
      {
        status: 400,
        severity: "error",
        description: "prescriptionId checksum is invalid."
      }
    ]

    const actualErrors = validatePrescriptionId(mockPrescriptionId, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns the correct errors when called with a prescriptionId with an incorrect checksum", () => {
    const mockPrescriptionId = "CBEF44-000X26-41E1B1"

    const expectedErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "prescriptionId checksum is invalid."
      }
    ]

    const actualErrors = validatePrescriptionId(mockPrescriptionId, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })
})

describe("Test validateNhsNumber", () => {
  it("returns no errors when called with a valid nhsNumber with a 1-9 checksum", () => {
    const mockNhsNumber = "7994647952"

    const expectedErrors: Array<ServiceError> = []

    const actualErrors = validateNhsNumber(mockNhsNumber, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns no errors when called with a valid nhsNumber with a 11/0 checksum", () => {
    const mockNhsNumber = "3116610770"

    const expectedErrors: Array<ServiceError> = []

    const actualErrors = validateNhsNumber(mockNhsNumber, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns the correct errors when called with a invalid nhsNumber that is too short", () => {
    const mockNhsNumber = "311661077"

    const expectedErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "nhsNumber does not match required format."
      },
      {
        status: 400,
        severity: "error",
        description: "nhsNumber checksum is invalid."
      }
    ]

    const actualErrors = validateNhsNumber(mockNhsNumber, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns the correct errors when called with a invalid nhsNumber that is too long", () => {
    const mockNhsNumber = "31166107700"

    const expectedErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "nhsNumber does not match required format."
      }
    ]

    const actualErrors = validateNhsNumber(mockNhsNumber, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns the correct errors when called with a invalid nhsNumber that contains alpha characters", () => {
    const mockNhsNumber = "311661A770"

    const expectedErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "nhsNumber does not match required format."
      },
      {
        status: 400,
        severity: "error",
        description: "nhsNumber checksum is invalid."
      }
    ]

    const actualErrors = validateNhsNumber(mockNhsNumber, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns the correct errors when called with a invalid nhsNumber that contains special characters", () => {
    const mockNhsNumber = "311661?770"

    const expectedErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "nhsNumber does not match required format."
      },
      {
        status: 400,
        severity: "error",
        description: "nhsNumber checksum is invalid."
      }
    ]

    const actualErrors = validateNhsNumber(mockNhsNumber, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns the correct errors when called with a nhsNumber with a calculated invalid checksum of 10", () => {
    const mockNhsNumber = "1000070000"

    const expectedErrors: Array<ServiceError> = [{
      status: 400,
      severity: "error",
      description: "nhsNumber checksum is invalid."
    }]

    const actualErrors = validateNhsNumber(mockNhsNumber, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns the correct errors when called with a nhsNumber with invalid checksum", () => {
    const mockNhsNumber = "7994647953"

    const expectedErrors: Array<ServiceError> = [{
      status: 400,
      severity: "error",
      description: "nhsNumber checksum is invalid."
    }]

    const actualErrors = validateNhsNumber(mockNhsNumber, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })

  it("returns the correct errors when called with an empty nhsNumber", () => {
    const mockNhsNumber = ""

    const expectedErrors: Array<ServiceError> = [
      {
        status: 400,
        severity: "error",
        description: "nhsNumber does not match required format."
      },
      {
        status: 400,
        severity: "error",
        description: "nhsNumber checksum is invalid."
      }
    ]

    const actualErrors = validateNhsNumber(mockNhsNumber, logger)
    expect(actualErrors).toEqual(expectedErrors)
  })
})
