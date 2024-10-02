import fs from "fs"
import path from "path"
import {
  responseBundleSchema as ResponseBundle,
  outcomeSchema as OperationOutcome
} from "prescriptionSearch"
import {JSONSchema} from "json-schema-to-ts"

const schemas: Record<string, JSONSchema> = {ResponseBundle, OperationOutcome}

const outputFolder = path.join(".", "schemas", "resources")

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder)
}

function isNotJSONSchemaArray(schema: JSONSchema | ReadonlyArray<JSONSchema>): schema is JSONSchema {
  return !Array.isArray(schema)
}

function collapseExamples(schema: JSONSchema) {
  if (typeof schema !== "object") {
    return
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {...schema}
  if (schema.examples) {
    result.example = schema.examples[0]
    delete result.examples
  }
  if (schema.items) {
    if (isNotJSONSchemaArray(schema.items)) {
      result.items = collapseExamples(schema.items)
    } else {
      result.items = schema.items.map(collapseExamples)
    }
  }
  if (schema.properties) {
    for (const key in schema.properties) {
      result.properties[key] = collapseExamples(schema.properties[key])
    }
  }
  return result
}

for (const name in schemas) {
  const schema = schemas[name]
  const fileName = `${name}.json`
  const filePath = path.join(outputFolder, fileName)
  fs.writeFileSync(filePath, JSON.stringify(collapseExamples(schema), null, 2))
}
