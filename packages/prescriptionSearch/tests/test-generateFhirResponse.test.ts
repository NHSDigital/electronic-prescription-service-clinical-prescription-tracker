/* eslint-disable max-len */
import {jest} from "@jest/globals"
import {
  Bundle,
  BundleEntry,
  Extension,
  Patient,
  RequestGroup,
  RequestGroupAction
} from "fhir/r4"
import {Prescription} from "../src/types"

const mockUUID = jest.fn()

jest.unstable_mockModule("crypto", () => {
  return {
    randomUUID: mockUUID
  }
})

const {generateFhirResponse} = await import("../src/generateFhirResponse")

describe("Test generateFhirResponse", () => {

  it("returns a searchset bundle when called", async () => {
    const expected: Bundle = {
      resourceType: "Bundle",
      type: "searchset",
      total: 0,
      entry: []
    }

    const actual: Bundle = generateFhirResponse([])
    expect(actual).toEqual(expected)
  })

  it("returns a Patient entry in the bundle when called with a prescription", async () => {
    mockUUID.mockImplementation(() => "PATIENT-123-567-890")

    const examplePrescription: Prescription = {
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

    const expected: BundleEntry<Patient> = {
      fullUrl: "urn:uuid:PATIENT-123-567-890",
      resource: {
        resourceType: "Patient",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/nhs-number",
          value: "5839945242"
        }],
        name: [{
          prefix: ["MS"],
          suffix: [""],
          given: ["STACEY"],
          family: "TWITCHETT"
        }]
      }
    }
    const actual = generateFhirResponse([examplePrescription]).entry as Array<BundleEntry>
    expect(actual[0]).toEqual(expected)
  })

  it("returns a RequestGroup entry in the bundle when called with a prescription", async () => {
    mockUUID.mockImplementationOnce(() => "PATIENT-123-567-890")
      .mockImplementationOnce(() => "PRESCRIPTION-111-111-111")

    const examplePrescription: Prescription = {
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

    const expected: BundleEntry<RequestGroup> = {
      fullUrl: "urn:uuid:PRESCRIPTION-111-111-111",
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
        intent: "proposal",
        extension: [{
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory", // is this the right one?
          extension: [{
            url: "status",
            valueCoding : {
              code: "0001"
            }
          }]
        },
        {
          url: "",
          extension: [{
            url: "pendingCancellation",
            valueBoolean: false
          }]
        }],
        action: [{
          timingDateTime: "20250204000000",
          cardinalityBehavior: "single",
          precheckBehavior: "no",
          extension: [{
            url: "",
            extension: [{
              url: "pendingCancellation",
              valueBoolean: false
            }]
          }]
        }]
      }
    }

    const actual = generateFhirResponse([examplePrescription]).entry as Array<BundleEntry>
    expect(actual[1]).toEqual(expected)
  })

  it("includes a prescription status extension on the RequestGroup when called with a prescription", async () => {
    mockUUID.mockImplementationOnce(() => "PATIENT-123-567-890")
      .mockImplementationOnce(() => "PRESCRIPTION-111-111-111")

    const examplePrescription: Prescription = {
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

    const expected: Extension = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory", // is this the right one?
      extension: [{
        url: "status",
        valueCoding : {
          code: "0001"
        }
      }]
    }

    const actualEntries = generateFhirResponse([examplePrescription]).entry as Array<BundleEntry>
    const actualRequestGroup = actualEntries[1] as BundleEntry<RequestGroup>
    const actualExtensions = actualRequestGroup.resource?.extension as Array<Extension>

    expect(actualExtensions[0]).toEqual(expected)
  })

  it("includes a repeat information extension on the RequestGroup when called with a erd prescription", async () => {
    mockUUID.mockImplementationOnce(() => "PATIENT-123-567-890")
      .mockImplementationOnce(() => "PRESCRIPTION-111-111-111")

    const examplePrescription: Prescription = {
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

    const expected: Extension = {
      url: "https://fhir.hl7.org.uk/StructureDefinition/Extension-UKCore-MedicationRepeatInformation",
      extension: [{
        url: "numberOfPrescriptionsIssued",
        valueUnsignedInt: 1
      }]
    }

    const actualEntries = generateFhirResponse([examplePrescription]).entry as Array<BundleEntry>
    const actualRequestGroup = actualEntries[1] as BundleEntry<RequestGroup>
    const actualExtensions = actualRequestGroup.resource?.extension as Array<Extension>

    expect(actualExtensions[1]).toEqual(expected)
    expect(actualExtensions.length).toEqual(3)
  })

  it("does not include a repeat information extension on the RequestGroup when called with a acute prescription", async () => {
    mockUUID.mockImplementationOnce(() => "PATIENT-123-567-890")
      .mockImplementationOnce(() => "PRESCRIPTION-111-111-111")

    const examplePrescription: Prescription = {
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

    const actualEntries = generateFhirResponse([examplePrescription]).entry as Array<BundleEntry>
    const actualRequestGroup = actualEntries[1] as BundleEntry<RequestGroup>
    const actualExtensions = actualRequestGroup.resource?.extension as Array<Extension>

    expect(actualExtensions.length).toEqual(2)
  })

  it("does not include a repeat information extension on the RequestGroup when called with a repeat prescription", async () => {
    mockUUID.mockImplementationOnce(() => "PATIENT-123-567-890")
      .mockImplementationOnce(() => "PRESCRIPTION-111-111-111")

    const examplePrescription: Prescription = {
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

    const actualEntries = generateFhirResponse([examplePrescription]).entry as Array<BundleEntry>
    const actualRequestGroup = actualEntries[1] as BundleEntry<RequestGroup>
    const actualExtensions = actualRequestGroup.resource?.extension as Array<Extension>

    expect(actualExtensions.length).toEqual(2)
  })

  it("includes a correct Action on the RequestGroup when called with a acute prescription", async () => {
    mockUUID.mockImplementationOnce(() => "PATIENT-123-567-890")
      .mockImplementationOnce(() => "PRESCRIPTION-111-111-111")

    const examplePrescription: Prescription = {
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

    const expected: RequestGroupAction = {
      timingDateTime: "20250204000000",
      cardinalityBehavior: "single",
      precheckBehavior: "no",
      extension: [{
        url: "",
        extension: [{
          url: "pendingCancellation",
          valueBoolean: false
        }]
      }]
    }

    const actualEntries = generateFhirResponse([examplePrescription]).entry as Array<BundleEntry>
    const actualRequestGroup = actualEntries[1] as BundleEntry<RequestGroup>
    const actualActions = actualRequestGroup.resource?.action as Array<RequestGroupAction>
    expect(actualActions[0]).toEqual(expected)
  })

  it("includes a correct Action on the RequestGroup when called with a erd prescription", async () => {
    mockUUID.mockImplementationOnce(() => "PATIENT-123-567-890")
      .mockImplementationOnce(() => "PRESCRIPTION-111-111-111")

    const examplePrescription: Prescription = {
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

    const expected: RequestGroupAction = {
      timingDateTime: "20250205000000",
      cardinalityBehavior: "multiple",
      precheckBehavior: "no",
      extension: [{
        url: "",
        extension: [{
          url: "pendingCancellation",
          valueBoolean: false
        }]
      }
      ]
    }

    const actualEntries = generateFhirResponse([examplePrescription]).entry as Array<BundleEntry>
    const actualRequestGroup = actualEntries[1] as BundleEntry<RequestGroup>
    const actualActions = actualRequestGroup.resource?.action as Array<RequestGroupAction>
    expect(actualActions[0]).toEqual(expected)
  })

  it("includes a correct Action on the RequestGroup when called with a repeat prescription", async () => {
    mockUUID.mockImplementationOnce(() => "PATIENT-123-567-890")
      .mockImplementationOnce(() => "PRESCRIPTION-111-111-111")

    const examplePrescription: Prescription = {
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

    const expected: RequestGroupAction = {
      timingDateTime: "20250212122302",
      cardinalityBehavior: "multiple",
      precheckBehavior: "yes",
      extension: [{
        url: "",
        extension: [{
          url: "pendingCancellation",
          valueBoolean: false
        }]
      }

      ]
    }

    const actualEntries = generateFhirResponse([examplePrescription]).entry as Array<BundleEntry>
    const actualRequestGroup = actualEntries[1] as BundleEntry<RequestGroup>
    const actualActions = actualRequestGroup.resource?.action as Array<RequestGroupAction>
    expect(actualActions[0]).toEqual(expected)
  })

  it("includes a correct pending cancellation extension on the RequestGroup when called with a prescription pending cancellation", async () => {
    mockUUID.mockImplementationOnce(() => "PATIENT-123-567-890")
      .mockImplementationOnce(() => "PRESCRIPTION-111-111-111")

    const examplePrescription: Prescription = {
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
      prescriptionPendingCancellation: true,
      itemsPendingCancellation: false
    }

    const expected: Extension = {
      url: "",
      extension: [{
        url: "pendingCancellation",
        valueBoolean: true
      }]
    }

    const actualEntries = generateFhirResponse([examplePrescription]).entry as Array<BundleEntry>
    const actualRequestGroup = actualEntries[1] as BundleEntry<RequestGroup>
    const actualExtensions = actualRequestGroup.resource?.extension as Array<Extension>

    expect(actualExtensions[1]).toEqual(expected)
  })

  it("includes a correct pending cancellation extension on the RequestGroup when called with a prescription without a pending cancellation", async () => {
    mockUUID.mockImplementationOnce(() => "PATIENT-123-567-890")
      .mockImplementationOnce(() => "PRESCRIPTION-111-111-111")

    const examplePrescription: Prescription = {
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

    const expected: Extension = {
      url: "",
      extension: [{
        url: "pendingCancellation",
        valueBoolean: false
      }]
    }

    const actualEntries = generateFhirResponse([examplePrescription]).entry as Array<BundleEntry>
    const actualRequestGroup = actualEntries[1] as BundleEntry<RequestGroup>
    const actualExtensions = actualRequestGroup.resource?.extension as Array<Extension>

    expect(actualExtensions[1]).toEqual(expected)
  })

  it("includes a correct pending cancellation extension on the Action when called with a prescription with items pending cancellation", async () => {
    mockUUID.mockImplementationOnce(() => "PATIENT-123-567-890")
      .mockImplementationOnce(() => "PRESCRIPTION-111-111-111")

    const examplePrescription: Prescription = {
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
      itemsPendingCancellation: true
    }

    const expected: Extension = {
      url: "",
      extension: [{
        url: "pendingCancellation",
        valueBoolean: true
      }]
    }

    const actualEntries = generateFhirResponse([examplePrescription]).entry as Array<BundleEntry>
    const actualRequestGroup = actualEntries[1] as BundleEntry<RequestGroup>
    const actualActions = actualRequestGroup.resource?.action as Array<RequestGroupAction>
    const actualActionExtensions = actualActions[0].extension as Array<Extension>

    expect(actualActionExtensions[0]).toEqual(expected)
  })

  it("includes a correct pending cancellation extension on the Action when called with a prescription without items pending cancellation", async () => {
    mockUUID.mockImplementationOnce(() => "PATIENT-123-567-890")
      .mockImplementationOnce(() => "PRESCRIPTION-111-111-111")

    const examplePrescription: Prescription = {
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

    const expected: Extension = {
      url: "",
      extension: [{
        url: "pendingCancellation",
        valueBoolean: false
      }]
    }

    const actualEntries = generateFhirResponse([examplePrescription]).entry as Array<BundleEntry>
    const actualRequestGroup = actualEntries[1] as BundleEntry<RequestGroup>
    const actualActions = actualRequestGroup.resource?.action as Array<RequestGroupAction>
    const actualActionExtensions = actualActions[0].extension as Array<Extension>

    expect(actualActionExtensions[0]).toEqual(expected)
  })
})
// TODO: tests for multiple prescriptions
