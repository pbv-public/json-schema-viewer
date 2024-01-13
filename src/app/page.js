'use client'
import './page.sass'

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

export default function Home () {
  const idsToShow = new Set(schemas.key_schema_ids)
  const allSchemas = Object.values(schemas.schemas).filter(
    x => idsToShow.has(x.$id))
  allSchemas.sort(cmpCaseInsensitive)

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
    <main className="home-page">
      <div className="schemas">
        {Object.entries(schemasByCategory).map(([category, schemasInCat]) => (
          <div className="schemas-for-category" key={category}>
            <h1>{category}</h1>
            <div className="schemas">
              <ul>
                {schemasInCat.map(schema => (
                  <li key={schema.$id}>
                    <a href={`/schema/${schemaIdWithoutSlashes(schema.$id)}`}>
                      {getSchemaDisplayName(schema)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
