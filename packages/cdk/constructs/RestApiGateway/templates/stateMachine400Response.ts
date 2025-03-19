/* eslint-disable max-len */
export const stateMachine400ResponseTemplate = `#set($context.responseOverride.header["Content-Type"] ="application/fhir+json")
{"resourceType":"OperationOutcome","issue": [{"severity":"error","code":"value","diagnostics":"Badly formatted request body."}]}`
