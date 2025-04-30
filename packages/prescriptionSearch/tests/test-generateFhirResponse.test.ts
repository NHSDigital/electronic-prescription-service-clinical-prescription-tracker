/* eslint-disable max-len */

import {Logger} from "@aws-lambda-powertools/logger"
import {jest} from "@jest/globals"

// Types
import {
  Bundle,
  BundleEntry,
  Extension,
  OperationOutcome,
  OperationOutcomeIssue,
  Patient,
  RequestGroup
} from "fhir/r4"
import {SearchError} from "../src/parseSpineResponse"
import {Prescription} from "../src/parseSpineResponse"
import {PrescriptionStatusExtensionType} from "../src/schema/response"

type PrescriptionStatusCode = PrescriptionStatusExtensionType["extension"][0]["valueCoding"]["code"]

const logger: Logger = new Logger({serviceName: "prescriptionSearch", logLevel: "DEBUG"})

const mockUUID = jest.fn()
jest.unstable_mockModule("crypto", () => {
  return {
    randomUUID: mockUUID
  }
})

const {generateFhirResponse, generateFhirErrorResponse} = await import("../src/generateFhirResponse")

const mockAcutePrescription: Prescription = {
  nhsNumber: "9732730684",
  prefix: "MISS",
  suffix: "",
  family: "CORY",
  given: "ETTA",
  prescriptionId: "335C70-A83008-84058A",
  issueDate: "20250204000000",
  treatmentType: "0001",
  maxRepeats: undefined,
  issueNumber: 1,
  status: "0001",
  prescriptionPendingCancellation: false,
  itemsPendingCancellation: false
}

const mockRepeatPrescription: Prescription = {
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

const mockErdPrescription: Prescription = {
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
}

describe("Test generateFhirResponse", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2015-04-09T12:34:56.001Z"))
    mockUUID.mockImplementationOnce(() => "PATIENT-123-567-890")
      .mockImplementationOnce(() => "PRESCRIPTION-111-111-111")
      .mockImplementationOnce(() => "PRESCRIPTION-222-222-222")
      .mockImplementationOnce(() => "PRESCRIPTION-333-333-333")
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it("returns a searchset bundle when called", async () => {
    const actual: Bundle = generateFhirResponse([mockAcutePrescription], logger)

    expect(actual.resourceType).toEqual("Bundle")
    expect(actual.type).toEqual("searchset")
  })

  it("returns an empty bundle when called with no results", async () => {
    const actual: Bundle = generateFhirResponse([], logger)

    expect(actual.entry?.length).toEqual(0)
  })

  it("returns a Patient entry in the bundle when called with a prescription", async () => {
    const expected: BundleEntry<Patient> = {
      fullUrl: "urn:uuid:PATIENT-123-567-890",
      search: {
        mode: "include"
      },
      resource: {
        resourceType: "Patient",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/nhs-number",
          value: "9732730684"
        }],
        name: [{
          prefix: ["MISS"],
          suffix: [""],
          given: ["ETTA"],
          family: "CORY"
        }]
      }
    }

    const actual = generateFhirResponse([mockAcutePrescription], logger).entry as Array<BundleEntry<RequestGroup>>

    expect(actual[0]).toEqual(expected)
  })

  it("returns a RequestGroup entry in the bundle when called with a prescription", async () => {
    const expected: BundleEntry<RequestGroup> = {
      fullUrl: "urn:uuid:PRESCRIPTION-111-111-111",
      search: {
        mode: "match"
      },
      resource: {
        resourceType: "RequestGroup",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-number",
          value: "335C70-A83008-84058A"
        }],
        subject: {
          reference: "urn:uuid:PATIENT-123-567-890"
        },
        status: "active",
        intent: "order",
        authoredOn: "20250204000000",
        extension: [{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory", // is this the right one?
          extension: [{
            url: "status",
            valueCoding : {
              system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
              code: "0001",
              display: "To be Dispensed"
            }
          }]
        },
        {
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PendingCancellation",
          extension: [
            {
              url: "prescriptionPendingCancellation",
              valueBoolean: false
            },
            {
              url: "lineItemPendingCancellation",
              valueBoolean: false
            }
          ]
        }]
      }
    }

    const actual = generateFhirResponse([mockAcutePrescription], logger).entry as Array<BundleEntry<RequestGroup>>

    expect(actual[1]).toEqual(expected)
  })

  const intentTestCases = [
    {treatmentType: "acute", mockPrescription: mockAcutePrescription, expectedIntent: "order"},
    {treatmentType: "repeat", mockPrescription: mockRepeatPrescription, expectedIntent: "instance-order"},
    {treatmentType: "erd", mockPrescription: mockErdPrescription, expectedIntent: "reflex-order"}
  ]
  intentTestCases.forEach(({treatmentType, mockPrescription, expectedIntent}) => {
    it(`includes the correct intent in the RequestGroup when called with a ${treatmentType}} prescription`, async () => {
      const actual = generateFhirResponse([mockPrescription], logger).entry as Array<BundleEntry<RequestGroup>>

      expect(actual[1].resource?.intent).toEqual(expectedIntent)
    })
  })

  it("includes a PrescriptionStatus extension on the RequestGroup when called with a prescription", async () => {
    const expected: Extension = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory", // is this the right one?
      extension: [{
        url: "status",
        valueCoding : {
          system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
          code: "0001",
          display: "To be Dispensed"
        }
      }]
    }

    const actualEntries = generateFhirResponse([mockAcutePrescription], logger).entry as Array<BundleEntry>
    const actualRequestGroup = actualEntries[1] as BundleEntry<RequestGroup>
    const actualExtensions = actualRequestGroup.resource?.extension as Array<Extension>

    expect(actualExtensions[0]).toEqual(expected)
  })

  const statusDisplayTestCases: Array<{status: PrescriptionStatusCode, expectedDisplay: string}> = [
    {status: "0001", expectedDisplay: "To be Dispensed"},
    {status: "0002", expectedDisplay: "With Dispenser"},
    {status: "0003", expectedDisplay: "With Dispenser - Active"},
    {status: "0004", expectedDisplay: "Expired"},
    {status: "0005", expectedDisplay: "Cancelled"},
    {status: "0006", expectedDisplay: "Dispensed"},
    {status: "0007", expectedDisplay: "Not Dispensed"},
    {status: "0008", expectedDisplay: "Claimed"},
    {status: "0009", expectedDisplay: "No-Claimed"},
    {status: "9000", expectedDisplay: "Repeat Dispense future instance"},
    {status: "9001", expectedDisplay: "Prescription future instance"},
    {status: "9005", expectedDisplay: "Cancelled future instance"}
  ]
  statusDisplayTestCases.forEach(({status, expectedDisplay}) => {
    it(`includes the correct display in the PrescriptionStatus extension when called with a prescription of status ${status}`, async () => {
      const mockPrescription: Prescription = {...mockAcutePrescription, ...{status}}

      const actualEntries = generateFhirResponse([mockPrescription], logger).entry as Array<BundleEntry>
      const actualRequestGroup = actualEntries[1] as BundleEntry<RequestGroup>
      const actualExtensions = actualRequestGroup.resource?.extension as Array<Extension>
      const actualStatusDisplay = actualExtensions?.[0].extension?.[0].valueCoding?.display as string

      expect(actualStatusDisplay).toEqual(expectedDisplay)
    })
  })

  it("includes a repeat information extension on the RequestGroup when called with a repeat prescription", async () => {
    const expected: Extension = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-RepeatInformation",
      extension: [
        {
          url: "numberOfRepeatsAllowed",
          valueInteger: 1
        },
        {
          url: "numberOfRepeatsIssued",
          valueInteger: 1
        }
      ]
    }

    const actualEntries = generateFhirResponse([mockRepeatPrescription], logger).entry as Array<BundleEntry>
    const actualRequestGroup = actualEntries[1] as BundleEntry<RequestGroup>
    const actualExtensions = actualRequestGroup.resource?.extension as Array<Extension>

    expect(actualExtensions[1]).toEqual(expected)
    expect(actualExtensions.length).toEqual(3)
  })

  it("includes a repeat information extension on the RequestGroup when called with a erd prescription", async () => {
    const expected: Extension = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-RepeatInformation",
      extension: [
        {
          url: "numberOfRepeatsAllowed",
          valueInteger: 7
        },
        {
          url: "numberOfRepeatsIssued",
          valueInteger: 1
        }
      ]
    }

    const actualEntries = generateFhirResponse([mockErdPrescription], logger).entry as Array<BundleEntry>
    const actualRequestGroup = actualEntries[1] as BundleEntry<RequestGroup>
    const actualExtensions = actualRequestGroup.resource?.extension as Array<Extension>

    expect(actualExtensions[1]).toEqual(expected)
    expect(actualExtensions.length).toEqual(3)
  })

  it("does not include a repeat information extension on the RequestGroup when called with a acute prescription", async () => {
    const actualEntries = generateFhirResponse([mockAcutePrescription], logger).entry as Array<BundleEntry>
    const actualRequestGroup = actualEntries[1] as BundleEntry<RequestGroup>
    const actualExtensions = actualRequestGroup.resource?.extension as Array<Extension>

    expect(actualExtensions.length).toEqual(2)
  })

  it("includes a correct pending cancellation extension on the RequestGroup when called with a prescription with a pending cancellation", async () => {
    const mockPrescription: Prescription = {...mockAcutePrescription, ...{prescriptionPendingCancellation: true}}

    const expected: Extension = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PendingCancellation",
      extension: [
        {
          url: "prescriptionPendingCancellation",
          valueBoolean: true
        },
        {
          url: "lineItemPendingCancellation",
          valueBoolean: false
        }
      ]
    }

    const actualEntries = generateFhirResponse([mockPrescription], logger).entry as Array<BundleEntry>
    const actualRequestGroup = actualEntries[1] as BundleEntry<RequestGroup>
    const actualExtensions = actualRequestGroup.resource?.extension as Array<Extension>

    expect(actualExtensions[1]).toEqual(expected)
  })

  it("includes a correct pending cancellation extension on the RequestGroup when called with a prescription with items pending cancellation", async () => {
    const mockPrescription: Prescription = {...mockAcutePrescription, ...{itemsPendingCancellation: true}}

    const expected: Extension = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PendingCancellation",
      extension: [
        {
          url: "prescriptionPendingCancellation",
          valueBoolean: false
        },
        {
          url: "lineItemPendingCancellation",
          valueBoolean: true
        }
      ]
    }

    const actualEntries = generateFhirResponse([mockPrescription], logger).entry as Array<BundleEntry>
    const actualRequestGroup = actualEntries[1] as BundleEntry<RequestGroup>
    const actualExtensions = actualRequestGroup.resource?.extension as Array<Extension>

    expect(actualExtensions[1]).toEqual(expected)
  })

  it("includes a correct pending cancellation extension on the RequestGroup when called with a prescription and items pending cancellation", async () => {
    const mockPrescription: Prescription = {
      ...mockAcutePrescription,
      ...{prescriptionPendingCancellation: true, itemsPendingCancellation: true}
    }

    const expected: Extension = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PendingCancellation",
      extension: [
        {
          url: "prescriptionPendingCancellation",
          valueBoolean: true
        },
        {
          url: "lineItemPendingCancellation",
          valueBoolean: true
        }
      ]
    }

    const actualEntries = generateFhirResponse([mockPrescription], logger).entry as Array<BundleEntry>
    const actualRequestGroup = actualEntries[1] as BundleEntry<RequestGroup>
    const actualExtensions = actualRequestGroup.resource?.extension as Array<Extension>

    expect(actualExtensions[1]).toEqual(expected)
  })

  it("includes a correct pending cancellation extension on the RequestGroup when called with a prescription with no pending cancellations", async () => {
    const expected: Extension = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PendingCancellation",
      extension: [
        {
          url: "prescriptionPendingCancellation",
          valueBoolean: false
        },
        {
          url: "lineItemPendingCancellation",
          valueBoolean: false
        }
      ]
    }

    const actualEntries = generateFhirResponse([mockAcutePrescription], logger).entry as Array<BundleEntry>
    const actualRequestGroup = actualEntries[1] as BundleEntry<RequestGroup>
    const actualExtensions = actualRequestGroup.resource?.extension as Array<Extension>

    expect(actualExtensions[1]).toEqual(expected)
  })

  it("it returns a correct bundle of resources when called with a list of prescriptions", async () => {
    const mockPrescriptions: Array<Prescription> = [
      mockAcutePrescription,
      mockRepeatPrescription,
      mockErdPrescription
    ]

    const expected: Bundle = {
      resourceType: "Bundle",
      type: "searchset",
      total: 3,
      entry: [
        {
          fullUrl: "urn:uuid:PATIENT-123-567-890",
          search: {
            mode: "include"
          },
          resource: {
            resourceType: "Patient",
            identifier: [
              {
                system: "https://fhir.nhs.uk/Id/nhs-number",
                value: "9732730684"
              }
            ],
            name: [
              {
                prefix: [ "MISS" ],
                suffix: [ "" ],
                given: [ "ETTA" ],
                family: "CORY"
              }
            ]
          }
        },
        {
          fullUrl: "urn:uuid:PRESCRIPTION-111-111-111",
          search: {
            mode: "match"
          },
          resource: {
            resourceType: "RequestGroup",
            identifier: [
              {
                system: "https://fhir.nhs.uk/Id/prescription-order-number",
                value: "335C70-A83008-84058A"
              }
            ],
            subject: {
              reference: "urn:uuid:PATIENT-123-567-890"
            },
            status: "active",
            intent: "order",
            authoredOn: "20250204000000",
            extension: [
              {
                url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory",
                extension: [
                  {
                    url: "status",
                    valueCoding: {
                      system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
                      code: "0001",
                      display: "To be Dispensed"
                    }
                  }
                ]
              },
              {
                url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PendingCancellation",
                extension: [
                  {
                    url: "prescriptionPendingCancellation",
                    valueBoolean: false
                  },
                  {
                    url: "lineItemPendingCancellation",
                    valueBoolean: false
                  }
                ]
              }
            ]
          }
        },
        {
          fullUrl: "urn:uuid:PRESCRIPTION-222-222-222",
          search: {
            mode: "match"
          },
          resource: {
            resourceType: "RequestGroup",
            identifier: [
              {
                system: "https://fhir.nhs.uk/Id/prescription-order-number",
                value: "1CFAAA-A83008-BE0B3Y"
              }
            ],
            subject: {
              reference: "urn:uuid:PATIENT-123-567-890"
            },
            status: "active",
            intent: "instance-order",
            authoredOn: "20250212122302",
            extension: [
              {
                url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory",
                extension: [
                  {
                    url: "status",
                    valueCoding: {
                      system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
                      code: "0001",
                      display: "To be Dispensed"
                    }
                  }
                ]
              },
              {
                url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-RepeatInformation",
                extension: [
                  {
                    url: "numberOfRepeatsAllowed",
                    valueInteger: 1
                  },
                  {
                    url: "numberOfRepeatsIssued",
                    valueInteger: 1
                  }
                ]
              },
              {
                url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PendingCancellation",
                extension: [
                  {
                    url: "prescriptionPendingCancellation",
                    valueBoolean: false
                  },
                  {
                    url: "lineItemPendingCancellation",
                    valueBoolean: false
                  }
                ]
              }
            ]
          }
        },
        {
          fullUrl: "urn:uuid:PRESCRIPTION-333-333-333",
          search: {
            mode: "match"
          },
          resource: {
            resourceType: "RequestGroup",
            identifier: [
              {
                system: "https://fhir.nhs.uk/Id/prescription-order-number",
                value: "0131A6-A83008-DDFE5P"
              }
            ],
            subject: {
              reference: "urn:uuid:PATIENT-123-567-890"
            },
            status: "active",
            intent: "reflex-order",
            authoredOn: "20250205000000",
            extension: [
              {
                url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory",
                extension: [
                  {
                    url: "status",
                    valueCoding: {
                      system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
                      code: "0001",
                      display: "To be Dispensed"
                    }
                  }
                ]
              },
              {
                url: "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-RepeatInformation",
                extension: [
                  {
                    url: "numberOfRepeatsAllowed",
                    valueInteger: 7
                  },
                  {
                    url: "numberOfRepeatsIssued",
                    valueInteger: 1
                  }
                ]
              },
              {
                url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PendingCancellation",
                extension: [
                  {
                    url: "prescriptionPendingCancellation",
                    valueBoolean: false
                  },
                  {
                    url: "lineItemPendingCancellation",
                    valueBoolean: false
                  }
                ]
              }
            ]
          }
        }
      ]
    }

    const actual = generateFhirResponse(mockPrescriptions, logger) as Bundle<BundleEntry>
    expect(actual).toEqual(expected)
  })
})

describe("Test generateFhirErrorResponse", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2015-04-09T12:34:56.001Z"))
  })

  it("returns a OperationOutcome when called", async () => {
    const expected: OperationOutcome = {
      resourceType: "OperationOutcome",
      meta: {
        lastUpdated: "2015-04-09T12:34:56.001Z"
      },
      issue: []
    }

    const actual: OperationOutcome = generateFhirErrorResponse([], logger)
    expect(actual).toEqual(expected)
  })

  it("returns a correct issue on the OperationOutcome when called with an error", async () => {
    const mockError: SearchError = {
      status: "500",
      severity: "error",
      description: "An unknown error."
    }

    const expected: OperationOutcomeIssue = {
      code: "exception",
      severity: "error",
      diagnostics: "An unknown error.",
      details: {
        coding: [{
          system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
          code: "SERVER_ERROR",
          display: "500: The Server has encountered an error processing the request."
        }]
      }
    }

    const actualIssues = generateFhirErrorResponse([mockError], logger).issue as Array<OperationOutcomeIssue>
    const actualOperationOutcome = actualIssues[0] as BundleEntry<OperationOutcome>
    expect(actualOperationOutcome).toEqual(expected)
  })

  it("returns a correct OperationOutcome with multiple issues when called with a list errors", async () => {
    const mockErrors: Array<SearchError> = [
      {
        status: "400",
        severity: "error",
        description: "Header A missing."
      },
      {
        status: "400",
        severity: "error",
        description: "Header B missing."
      },
      {
        status: "400",
        severity: "error",
        description: "Header C missing."
      }
    ]

    const expected: OperationOutcome = {
      resourceType: "OperationOutcome",
      meta: {
        lastUpdated: "2015-04-09T12:34:56.001Z"
      },
      issue: [
        {
          code: "value",
          severity: "error",
          diagnostics: "Header A missing.",
          details: {
            coding: [{
              system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
              code: "BAD_REQUEST",
              display: "400: The Server was unable to process the request."
            }]
          }
        },
        {
          code: "value",
          severity: "error",
          diagnostics: "Header B missing.",
          details: {
            coding: [{
              system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
              code: "BAD_REQUEST",
              display: "400: The Server was unable to process the request."
            }]
          }
        },
        {
          code: "value",
          severity: "error",
          diagnostics: "Header C missing.",
          details: {
            coding: [{
              system: "https://fhir.nhs.uk/CodeSystem/http-error-codes",
              code: "BAD_REQUEST",
              display: "400: The Server was unable to process the request."
            }]
          }
        }
      ]
    }
    const actual = generateFhirErrorResponse(mockErrors, logger) as OperationOutcome
    expect(actual).toEqual(expected)
  })
})
