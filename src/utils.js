import { useSearchParams } from 'react-router-dom'
import traverse from 'traverse'

import { schemas } from './generated-schemas.js'

// flatten $ref but keep $ref in the flattened objects so the UI knows the
// schema from which something is from
traverse(schemas.schemas).forEach(function (x) {
  // xRest has the custom title and description for the node, if any
  const { $ref, ...xRest } = (x ?? {})
  if ($ref) {
    const schema = schemas.schemas[$ref]
    if (schema) {
      const { $id, $schema, ...rest } = schema
      this.update({ ...rest, ...xRest, $ref })
    }
  }
})

export function cmpCaseInsensitive (a, b) {
  const aName = getSchemaDisplayName(a).toLocaleLowerCase()
  const bName = getSchemaDisplayName(b).toLocaleLowerCase()
  return aName.localeCompare(bName)
}

export function getAllSchemasToShow () {
  const allSchemas = Object.values(schemas.schemas)
  const schemasToShow = allSchemas.filter(
    x => x.$id && x.$id !== schemas.main_schema_id)
  schemasToShow.sort(cmpCaseInsensitive)
  return schemasToShow
}

export function getMainSchema () {
  if (schemas.main_schema_id) {
    return schemas.schemas[schemas.main_schema_id]
  }
}

export function getSchemaDisplayName (schema) {
  return schema.title ?? schema.$id
}

export function schemaIdWithoutSlashes (schemaId, targetChar = '~') {
  return schemaId.replace(/[/]/g, targetChar)
}

export function useSelectedSchemaId () {
  return useSearchParams()[0].get('s')?.replace(/~/g, '/')
}

export function routeToSchema (schema) {
  return `/?s=${schemaIdWithoutSlashes(schema.$id)}`
}
