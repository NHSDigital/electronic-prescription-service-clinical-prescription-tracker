import fs from "fs"
import path from "path"
import {
  bundleSchema as ResponseBundle,
  outcomeSchema as OperationOutcome,
} from "prescriptionSearch"
import {JSONSchema} from "json-schema-to-ts"

// Record to store schemas
const schemas: Record<string, JSONSchema> = {ResponseBundle, OperationOutcome}

// Define the folder paths
const schemasFolder = path.join(".", "schemas")
const resourcesFolder = path.join(schemasFolder, "resources")

// Create `schemas` folder if it doesn't exist
if (!fs.existsSync(schemasFolder)) {
  fs.mkdirSync(schemasFolder)
}

// Create `resources` folder if it doesn't exist
if (!fs.existsSync(resourcesFolder)) {
  fs.mkdirSync(resourcesFolder)
}

// Function to check if the schema is not an array
function isNotJSONSchemaArray(schema: JSONSchema | ReadonlyArray<JSONSchema>): schema is JSONSchema {
  return !Array.isArray(schema)
}

// Function to collapse examples
function collapseExamples(schema: JSONSchema): JSONSchema {
  if (typeof schema !== "object" || schema === null) {
    return schema
  }

  // Create a new object for the result
  const result: any = {...schema}

  // Collapse `examples` to a single `example`
  if (Array.isArray(schema.examples) && schema.examples.length > 0) {
    result.example = schema.examples[0]
    delete result.examples
  }

  // Recursively handle `items` if present
  if (schema.items) {
    if (isNotJSONSchemaArray(schema.items)) {
      result.items = collapseExamples(schema.items)
    } else {
      result.items = schema.items.map(collapseExamples)
    }
  }

  // Recursively handle `properties` if present
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

// Write the schemas to the `resources` folder
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
