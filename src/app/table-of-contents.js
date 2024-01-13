'use client'
import './table-of-contents.sass'

import { List, ListItemButton, ListItemText } from '@mui/material'
import { usePathname } from 'next/navigation'

import { schemas } from '../generated-schemas.js'
import { getSchemaDisplayName } from '../utils/getSchemaDisplayName.js'

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

export function schemaIdWithoutSlashes (schemaId) {
  return schemaId.replace(/[/]/g, '~')
}

export function useSelectedSchemaId () {
  const urlPathName = usePathname()
  const pieces = urlPathName.split('/')
  console.log(urlPathName, pieces)
  if (pieces[pieces.length - 2] === 'schema') {
    const schemaIdWithoutSlashes = pieces[pieces.length - 1]
    return schemaIdWithoutSlashes.replace(/~/g, '/')
  }
}

export function routeToSchema (schema) {
  return `/schema/${schemaIdWithoutSlashes(schema.$id)}`
}

export function TableOfContents () {
  const selSchemaId = useSelectedSchemaId()
  console.log(selSchemaId)
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
            <List>
              {schemasInCat.map(schema => (
                <ListItemButton
                  key={schema.$id}
                  href={routeToSchema(schema)}
                  className={schema.$id === selSchemaId ? 'selected' : ''}
                >
                  <ListItemText className="schema-text">
                    {getSchemaDisplayName(schema)}
                  </ListItemText>
                </ListItemButton>
              ))}
            </List>
          </div>
        ))}
      </div>
    </div>
  )
}
