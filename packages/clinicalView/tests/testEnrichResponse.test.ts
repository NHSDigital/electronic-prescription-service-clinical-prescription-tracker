/* eslint-disable max-len */

import {Logger} from "@aws-lambda-powertools/logger"
import jsonata from "jsonata"
import {
  extractPrescriptionIdExpression,
  extractDispenserOdsCodeExpression,
  enrichResponseExpression
} from "../src/enrichResponseJsonata.cjs"
import {generateFhirResponse} from "../src/generateFhirResponse"
import {ParsedSpineResponse, parseSpineResponse, Prescription} from "../src/parseSpineResponse"
import {BundleType} from "../src/schema/bundle"
import {acuteDispensed, acuteDispensedWithASingleItem} from "./examples/examples"
import {MedicationRequestBundleEntryType} from "../src/schema/medicationRequest"
import {TaskBusinessStatusNpptExtensionType} from "../src/schema/extensions"

const logger = new Logger({serviceName: "enrichClinicalView", logLevel: "DEBUG"})

const generateFhirFromExample = (exampleSpineResponse: string) => {
  const parsedSpineResponse: ParsedSpineResponse = parseSpineResponse(exampleSpineResponse, logger)
  if ("spineError" in parsedSpineResponse) {
    throw new Error("Parsed response should not contain an error")
  }

  const responseBundle: BundleType = generateFhirResponse(parsedSpineResponse.prescription as Prescription, logger)
  return responseBundle
}

const acuteDispensedWithASingleItemGsuResult = {
  "schemaVersion": 1,
  "isSuccess": true,
  "prescriptions": [
    {
      "prescriptionID": "EA1CBC-A83008-F1F8A8",
      "onboarded": true,
      "items": [
        {
          "itemId": "101875F7-400C-43FE-AC04-7F29DBF854AF",
          "latestStatus": "Collected",
          "isTerminalState": true,
          "lastUpdateDateTime": "1970-01-01T00:00:00Z"
        }
      ]
    }
  ]
}

describe("Enrich clinical view response", () => {
  it("correctly extracts the prescriptionId from the clinicalView response", async () => {
    const expression = jsonata(extractPrescriptionIdExpression)
    const result = await expression.evaluate(
      {}, {clinicalViewResponseBody: generateFhirFromExample(acuteDispensedWithASingleItem)})

    expect(result).toEqual("EA1CBC-A83008-F1F8A8")
  })

  it("correctly extracts the Dispenser ODS code from the clinicalView response", async () => {
    const expression = jsonata(extractDispenserOdsCodeExpression)
    const result = await expression.evaluate(
      {}, {clinicalViewResponseBody: generateFhirFromExample(acuteDispensedWithASingleItem)})

    expect(result).toEqual("FA565")
  })

  it("correctly enriches the Medication Request entry with the NPPTS status extension", async () => {
    const clinicalViewResponseBundle: BundleType = generateFhirFromExample(acuteDispensedWithASingleItem)

    const expression = jsonata(enrichResponseExpression)
    const result = await expression.evaluate({}, {
      clinicalViewResponseBody: clinicalViewResponseBundle,
      getStatusUpdatesResponse: acuteDispensedWithASingleItemGsuResult,
      prescriptionId: "EA1CBC-A83008-F1F8A8"
    })

    const parsedResult: BundleType = JSON.parse(result)

    const expectedExtension: TaskBusinessStatusNpptExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory",
      extension: [
        {
          url: "status",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/task-businessStatus-nppt",
            code: "Collected"
          }
        },
        {
          url: "statusDate",
          valueDateTime: "1970-01-01T00:00:00Z"
        }
      ]
    }

    expect(parsedResult.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "MedicationRequest",
        extension: expect.arrayContaining([expectedExtension])
      })
    }))
  })

  it("does not overwrite existing extensions on the Medication Request entry when enriching the response", async () => {
    const clinicalViewResponseBundle: BundleType = generateFhirFromExample(acuteDispensedWithASingleItem)
    const originalMedicationRequest = clinicalViewResponseBundle.entry.find(
      (entry) => entry.resource.resourceType === "MedicationRequest")! as MedicationRequestBundleEntryType

    const expression = jsonata(enrichResponseExpression)
    const result = await expression.evaluate({}, {
      clinicalViewResponseBody: clinicalViewResponseBundle,
      getStatusUpdatesResponse: acuteDispensedWithASingleItemGsuResult,
      prescriptionId: "EA1CBC-A83008-F1F8A8"
    })

    const parsedResult: BundleType = JSON.parse(result)
    const enrichedMedicationRequest = parsedResult.entry.find(
      (entry) => entry.resource.resourceType === "MedicationRequest")! as MedicationRequestBundleEntryType

    expect(enrichedMedicationRequest.resource.extension).toHaveLength(3)
    expect(enrichedMedicationRequest.resource.extension.length)
      .toBeGreaterThan(originalMedicationRequest.resource.extension.length)
  })

  it("returns a the enriched response body in the correct form", async () => {
    const clinicalViewResponseBundle: BundleType = generateFhirFromExample(acuteDispensedWithASingleItem)
    const expression = jsonata(enrichResponseExpression)
    const result = await expression.evaluate({}, {
      clinicalViewResponseBody: clinicalViewResponseBundle,
      getStatusUpdatesResponse: acuteDispensedWithASingleItemGsuResult,
      prescriptionId: "EA1CBC-A83008-F1F8A8"
    })

    expect(typeof result).toBe("string")
  })

  it("correctly enriches the Medication Request entries with the NPPTS status extension when called with a prescription with multiple items", async () => {
    const clinicalViewResponseBundle: BundleType = generateFhirFromExample(acuteDispensed)
    const acuteDispensedWithASingleItemGsuResult = {
      "schemaVersion": 1,
      "isSuccess": true,
      "prescriptions": [
        {
          "prescriptionID": "C0C3E6-A83008-93D8FL",
          "onboarded": true,
          "items": [
            {
              "itemId": "D37FD639-E831-420C-B37B-40481DCA910E",
              "latestStatus": "Collected",
              "isTerminalState": true,
              "lastUpdateDateTime": "1970-01-01T00:00:00Z"
            },
            {
              "itemId": "407685A2-A1A2-4B6B-B281-CAED41733C2B",
              "latestStatus": "Ready to Collect",
              "isTerminalState": true,
              "lastUpdateDateTime": "1970-02-02T00:00:00Z"
            },
            {
              "itemId": "20D6D69F-7BDD-4798-86DF-30F902BD2936",
              "latestStatus": "Ready to Dispatch",
              "isTerminalState": true,
              "lastUpdateDateTime": "1970-03-03T00:00:00Z"
            },
            {
              "itemId": "BF1B0BD8-0E6D-4D90-989E-F32065200CA3",
              "latestStatus": "Dispatched",
              "isTerminalState": true,
              "lastUpdateDateTime": "1970-04-04T00:00:00Z"
            }
          ]
        }
      ]
    }

    const expression = jsonata(enrichResponseExpression)
    const result = await expression.evaluate({}, {
      clinicalViewResponseBody: clinicalViewResponseBundle,
      getStatusUpdatesResponse: acuteDispensedWithASingleItemGsuResult,
      prescriptionId: "C0C3E6-A83008-93D8FL"
    })

    const parsedResult: BundleType = JSON.parse(result)

    const lineItem1ExpectedExtension: TaskBusinessStatusNpptExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory",
      extension: [
        {
          url: "status",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/task-businessStatus-nppt",
            code: "Collected"
          }
        },
        {
          url: "statusDate",
          valueDateTime: "1970-01-01T00:00:00Z"
        }
      ]
    }
    const lineItem2ExpectedExtension: TaskBusinessStatusNpptExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory",
      extension: [
        {
          url: "status",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/task-businessStatus-nppt",
            code:  "Ready to Collect"
          }
        },
        {
          url: "statusDate",
          valueDateTime: "1970-02-02T00:00:00Z"
        }
      ]
    }
    const lineItem3ExpectedExtension: TaskBusinessStatusNpptExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory",
      extension: [
        {
          url: "status",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/task-businessStatus-nppt",
            code: "Ready to Dispatch"
          }
        },
        {
          url: "statusDate",
          valueDateTime: "1970-03-03T00:00:00Z"
        }
      ]
    }
    const lineItem4ExpectedExtension: TaskBusinessStatusNpptExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory",
      extension: [
        {
          url: "status",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/task-businessStatus-nppt",
            code: "Dispatched"
          }
        },
        {
          url: "statusDate",
          valueDateTime: "1970-04-04T00:00:00Z"
        }
      ]
    }

    expect(parsedResult.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "MedicationRequest",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "D37FD639-E831-420C-B37B-40481DCA910E"
        }],
        extension: expect.arrayContaining([lineItem1ExpectedExtension])
      })
    }))

    expect(parsedResult.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "MedicationRequest",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "407685A2-A1A2-4B6B-B281-CAED41733C2B"
        }],
        extension: expect.arrayContaining([lineItem2ExpectedExtension])
      })
    }))

    expect(parsedResult.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "MedicationRequest",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "20D6D69F-7BDD-4798-86DF-30F902BD2936"
        }],
        extension: expect.arrayContaining([lineItem3ExpectedExtension])
      })
    }))

    expect(parsedResult.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "MedicationRequest",
        identifier: [{
          system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
          value: "BF1B0BD8-0E6D-4D90-989E-F32065200CA3"
        }],
        extension: expect.arrayContaining([lineItem4ExpectedExtension])
      })
    }))
  })

  it("does not enrich the Medication Request entry when prescriptionID's do not match", async () => {
    const clinicalViewResponseBundle: BundleType = generateFhirFromExample(acuteDispensedWithASingleItem)
    const gsuResult = {...acuteDispensedWithASingleItemGsuResult}
    gsuResult.prescriptions[0].prescriptionID = "1111-1111-111"

    const expression = jsonata(enrichResponseExpression)
    const result = await expression.evaluate({}, {
      clinicalViewResponseBody: clinicalViewResponseBundle,
      getStatusUpdatesResponse: acuteDispensedWithASingleItemGsuResult,
      prescriptionId: "EA1CBC-A83008-F1F8A8"
    })

    const parsedResult: BundleType = JSON.parse(result)

    const expectedExtension: TaskBusinessStatusNpptExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory",
      extension: [
        {
          url: "status",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/task-businessStatus-nppt",
            code: "Collected"
          }
        },
        {
          url: "statusDate",
          valueDateTime: "1970-01-01T00:00:00Z"
        }
      ]
    }

    expect(parsedResult.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "MedicationRequest",
        extension: expect.not.arrayContaining([expectedExtension])
      })
    }))
  })

  it("does not enrich the Medication Request entry when line item ID's do not match", async () => {
    const clinicalViewResponseBundle: BundleType = generateFhirFromExample(acuteDispensedWithASingleItem)
    const gsuResult = {...acuteDispensedWithASingleItemGsuResult}
    gsuResult.prescriptions[0].items[0].itemId = "1111-1111-1111"

    const expression = jsonata(enrichResponseExpression)
    const result = await expression.evaluate({}, {
      clinicalViewResponseBody: clinicalViewResponseBundle,
      getStatusUpdatesResponse: acuteDispensedWithASingleItemGsuResult,
      prescriptionId: "EA1CBC-A83008-F1F8A8"
    })

    const parsedResult: BundleType = JSON.parse(result)

    const expectedExtension: TaskBusinessStatusNpptExtensionType = {
      url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory",
      extension: [
        {
          url: "status",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/task-businessStatus-nppt",
            code: "Collected"
          }
        },
        {
          url: "statusDate",
          valueDateTime: "1970-01-01T00:00:00Z"
        }
      ]
    }

    expect(parsedResult.entry).toContainEqual(expect.objectContaining({
      resource: expect.objectContaining({
        resourceType: "MedicationRequest",
        extension: expect.not.arrayContaining([expectedExtension])
      })
    }))
  })
})
