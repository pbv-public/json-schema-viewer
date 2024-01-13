'use client'
import './table-of-contents.sass'

import { schemas } from '../generated-schemas.js'
import { getSchemaDisplayName } from '../utils/getSchemaDisplayName.js'

function cmpCaseInsensitive (a, b) {
  const aName = getSchemaDisplayName(a).toLocaleLowerCase()
  const bName = getSchemaDisplayName(b).toLocaleLowerCase()
  return aName.localeCompare(bName)
}

function schemaIdWithoutSlashes (schemaId) {
  return schemaId.replace(/[/]/g, '~')
}

export function routeToSchema (schema) {
  return `/schema/${schemaIdWithoutSlashes(schema.$id)}`
}

export function getAllSchemasToShow () {
  const idsToShow = new Set(schemas.key_schema_ids)
  const allSchemas = Object.values(schemas.schemas).filter(
    x => idsToShow.has(x.$id))
  allSchemas.sort(cmpCaseInsensitive)
  return allSchemas
}

export function TableOfContents () {
  const allSchemas = getAllSchemasToShow()
  const schemasByCategory = {}
  for (const schema of allSchemas) {
    const category = schema.$id.split('/').reduce(
      (prev, cur) => prev || cur)
    if (!schemasByCategory[category]) {
      schemasByCategory[category] = []
    }
    schemasByCategory[category].push(schema)
  }

  return (
    <div className="table-of-contents">
      <div className="schemas">
        {Object.entries(schemasByCategory).map(([category, schemasInCat]) => (
          <div className="schemas-for-category" key={category}>
            <h1>{category}</h1>
            <div className="schemas">
              <ul>
                {schemasInCat.map(schema => (
                  <li key={schema.$id}>
                    <a href={routeToSchema(schema)}>
                      {getSchemaDisplayName(schema)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
