import './table-of-contents.sass'

import { List, ListItemButton, ListItemText } from '@mui/material'
import { useNavigate } from 'react-router-dom'

import { getAllSchemasToShow, getSchemaDisplayName, routeToSchema, useSelectedSchemaId } from './utils.js'

export function TableOfContents () {
  const navigate = useNavigate()
  const selSchemaId = useSelectedSchemaId()
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
  const categories = Object.keys(schemasByCategory)
  categories.sort()

  return (
    <div className={`table-of-contents${selSchemaId ? '' : ' need-to-pick'}`}>
      <div className='schemas'>
        {categories.map(category => {
          const schemasInCat = schemasByCategory[category]
          return (
            <div className='schemas-for-category' key={category}>
              <h1>{category}</h1>
              <List>
                {schemasInCat.map(schema => (
                  <ListItemButton
                    key={schema.$id}
                    onClick={() => navigate(routeToSchema(schema))}
                    className={schema.$id === selSchemaId ? 'selected' : ''}
                  >
                    <ListItemText className='schema-text'>
                      {getSchemaDisplayName(schema)}
                    </ListItemText>
                  </ListItemButton>
                ))}
              </List>
            </div>
          )
        })}
      </div>
    </div>
  )
}
