import fs from "fs"
import path from "path"
import {prescriptionSearchBundle} from "prescriptionSearch"
import {clinicalViewBundle} from "clinicalView"
import {operationOutcome} from "@cpt-common/common-types/schema"
import {JSONSchema} from "json-schema-to-ts"

const schemas: Record<string, JSONSchema> = {prescriptionSearchBundle, clinicalViewBundle, operationOutcome}

const schemasFolder = path.join(".", "schemas")
const resourcesFolder = path.join(schemasFolder, "resources")

if (!fs.existsSync(schemasFolder)) {
  fs.mkdirSync(schemasFolder)
}

if (!fs.existsSync(resourcesFolder)) {
  fs.mkdirSync(resourcesFolder)
}

function isNotJSONSchemaArray(schema: JSONSchema | ReadonlyArray<JSONSchema>): schema is JSONSchema {
  return !Array.isArray(schema)
}

export function collapseExamples(schema: JSONSchema): JSONSchema {
  if (typeof schema !== "object" || schema === null) {
    return schema
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {...schema}

  if (Array.isArray(schema.examples) && schema.examples.length > 0) {
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
    const properties: Record<string, JSONSchema> = {}
    for (const key in schema.properties) {
      if (Object.prototype.hasOwnProperty.call(schema.properties, key)) {
        properties[key] = collapseExamples(schema.properties[key])
      }
    }
    result.properties = properties
  }

  return result
}

for (const name in schemas) {
  if (Object.prototype.hasOwnProperty.call(schemas, name)) {
    const schema = schemas[name]
    const fileName = `${name}.json`
    const filePath = path.join(resourcesFolder, fileName)

    try {
      fs.writeFileSync(filePath, JSON.stringify(collapseExamples(schema), null, 2))
      console.log(`Schema ${fileName} written successfully.`)
    } catch (error) {
      console.error(`Error writing schema ${fileName}:`, error)
    }
  }
}
