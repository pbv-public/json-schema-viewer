import './table-of-contents.sass'

import { List, ListItemButton, ListItemText } from '@mui/material'

import { getAllSchemasToShow, getSchemaDisplayName, routeToSchema, useSelectedSchemaId } from './utils.js'

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
