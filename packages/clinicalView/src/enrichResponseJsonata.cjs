/*
NOTE:
This is explicitly a .cjs file to allow both the cdk package(cjs) and the tests in this package(esm) to import it correctly.
*/
const extractPrescriptionIdExpression = `$clinicalViewResponseBody.entry.resource[resourceType="RequestGroup"].identifier[0].value`

const extractDispenserOdsCodeExpression = `($clinicalViewResponseBody.entry.resource[resourceType="MedicationRequest"].performer.identifier[0].value)[0]`

const enrichResponseExpression = `$string((
  $clinicalViewResponseBody ~> | entry.resource[resourceType="MedicationRequest"] |
  $@$resource.identifier[0].value@$lineItemId
  {
    "extension": $append(
      $resource.extension,
      $getStatusUpdatesResponse.prescriptions[prescriptionID=$prescriptionId].items[itemId=$lineItemId] ?
      {
        "url": "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionStatusHistory",
        "extension": [
          {
            "url": "status",
            "valueCoding": {
              "system": "https://fhir.nhs.uk/CodeSystem/task-businessStatus-nppt",
              "code": $getStatusUpdatesResponse.prescriptions[prescriptionID=$prescriptionId].items[itemId=$lineItemId].latestStatus
            }
          },
          {
            "url": "statusDate",
            "valueDateTime": $getStatusUpdatesResponse.prescriptions[prescriptionID=$prescriptionId].items[itemId=$lineItemId].lastUpdateDateTime
          }
        ]
      } : []
    )
  }|))`

module.exports = {
  extractPrescriptionIdExpression,
  extractDispenserOdsCodeExpression,
  enrichResponseExpression
}
