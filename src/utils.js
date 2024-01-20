import { useParams } from 'react-router-dom'

import { schemas } from './generated-schemas.js'

function cmpCaseInsensitive (a, b) {
  const aName = getSchemaDisplayName(a).toLocaleLowerCase()
  const bName = getSchemaDisplayName(b).toLocaleLowerCase()
  return aName.localeCompare(bName)
}

export function getAllSchemasToShow () {
  const idsToShow = new Set(schemas.key_schema_ids)
  const allSchemas = Object.values(schemas.schemas).filter(
    x => idsToShow.has(x.$id))
  allSchemas.sort(cmpCaseInsensitive)
  return allSchemas
}

export function getSchemaDisplayName (schema) {
  return schema.title ?? schema.$id
}

export function schemaIdWithoutSlashes (schemaId) {
  return schemaId.replace(/[/]/g, '~')
}

export function useSelectedSchemaId () {
  return useParams().schemaId?.replace(/~/g, '/')
}

export function routeToSchema (schema) {
  return `/?s=${schemaIdWithoutSlashes(schema.$id)}`
}
