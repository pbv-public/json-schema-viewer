import { useSearchParams } from 'react-router-dom'

import { schemas } from './generated-schemas.js'

function cmpCaseInsensitive (a, b) {
  const aName = getSchemaDisplayName(a).toLocaleLowerCase()
  const bName = getSchemaDisplayName(b).toLocaleLowerCase()
  return aName.localeCompare(bName)
}

export function getAllSchemasToShow () {
  const idsToShow = new Set(schemas.key_schema_ids)
  idsToShow.delete(schemas.main_schema_id)
  const allSchemas = Object.values(schemas.schemas).filter(
    x => idsToShow.has(x.$id))
  allSchemas.sort(cmpCaseInsensitive)
  return allSchemas
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
