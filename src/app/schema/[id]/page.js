'use client'
import './schema.sass'

import { ArrowRight } from '@mui/icons-material'
import { Breadcrumbs, Chip, Link } from '@mui/material'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import Markdown from 'react-markdown'

import { schemas } from '../../../generated-schemas.js'
import { getSchemaDisplayName } from '../../../utils/getSchemaDisplayName.js'

export function useSelectedSchemaId () {
  const urlPathName = usePathname()
  const pieces = urlPathName.split('/')
  console.log(urlPathName, pieces)
  if (pieces[pieces.length - 2] === 'schema') {
    const schemaIdWithoutSlashes = pieces[pieces.length - 1]
    return schemaIdWithoutSlashes.replace(/~/g, '/')
  }
}

export default function SchemaViewer ({ params }) {
  const urlPathName = usePathname()
  const router = useRouter()
  const schemaId = params.id.replace(/~/g, '/')
  const schema = schemas.schemas[schemaId]

  const searchParams = useSearchParams()
  const pathStr = searchParams.get('p') ?? '' // empty=root, x.y.z = child
  const pathKeys = pathStr ? pathStr.split('.') : []

  const goToPropPath = useCallback(pathKeys => {
    router.push(urlPathName + '?p=' + pathKeys.join('.'))
  }, [router, urlPathName])

  // find the properties at this path, and the names of the path segments to it
  let at = schema
  const pathNames = [getTypeInfo(at).name]
  function goPastArrays () {
    while (at.type === 'array') {
      at = at.items
    }
  }
  for (const curPiece of pathKeys) {
    goPastArrays()
    at = at.properties[curPiece]
    pathNames.push(getTypeInfo(at, curPiece).name)
    goPastArrays()
  }
  const directProps = at.properties ?? {} // omitted if `at` is a primitive type

  return (
    <div className="json-schema-viewer">
      <Breadcrumbs separator={<ArrowRight />}>
        {pathNames.map((x, i) => (
          <Link
            key={i}
            className={`path-part clickable${i === pathNames.length - 1 ? ' last-item' : ''}`}
            underline="hover"
            color={i === pathNames.length - 1 ? undefined : 'inherit'}
            onClick={() => goToPropPath(pathKeys.slice(0, i))}
          >
            {x}
          </Link>
        ))}
      </Breadcrumbs>
      <Markdown className="description">{at.description}</Markdown>

      <h2>Properties</h2>
      {Object.entries(directProps).map(([k, v]) => (
        <Property
          key={k}
          schema={v}
          fromKey={k}
          fromSchema={at}
          pathKeys={pathKeys}
          goToPropPath={goToPropPath}
        />
      ))}
    </div>
  )
}

function Property ({ schema, fromKey, fromSchema, pathKeys, goToPropPath }) {
  const canClickInto = !getTypeInfo(schema, fromKey).isPrimitiveType
  const onClick = useCallback(() => {
    if (canClickInto) {
      goToPropPath(pathKeys.concat([fromKey]))
    }
  }, [canClickInto, fromKey, goToPropPath, pathKeys])
  const { typeName, value } = getTypeInfo(schema, fromKey)
  return (
    <div className='property'>
      <div
        className={`property-definition${canClickInto ? ' clickable' : ''}`}
        onClick={onClick}
      >
        <span className="property-type">{typeName}</span>
        <span className="property-name">{fromKey}</span>
        {value !== undefined && (
          <>
            <pre className="property-const-value"> = {JSON.stringify(value)}</pre>
            <Chip label="const" />
          </>
        )}
        {fromSchema.required.indexOf(fromKey) === -1
          ? <Chip label="optional" />
          : null}
      </div>
      <Markdown className="description">{schema.description}</Markdown>
    </div>
  )
}

function getTypeInfo (schema, fromKey) {
  if (schema.type === 'object') {
    const typeName = getSchemaDisplayName(schema) ?? fromKey ?? 'object'
    return { schema, typeName, name: typeName }
  } else if (schema.type === 'array') {
    return getArrayType(schema, fromKey)
  } else {
    const name = getSchemaDisplayName(schema) ?? schema.type
    const ret = {
      isPrimitiveType: true,
      schema,
      typeName: schema.type,
      name
    }
    const c = schema.const
    if (c !== undefined) {
      ret.value = c
      ret.typeName = Array.isArray(c) ? 'array' : typeof c
    }
    return ret
  }
}

function getArrayType (schema, fromKey) {
  let numArrayWraps = 0
  while (schema.type === 'array') {
    schema = schema.items
    numArrayWraps += 1
  }
  let { typeName } = getTypeInfo(schema, fromKey)
  let name = typeName
  for (let i = 0; i < numArrayWraps; i++) {
    typeName = `Array<${typeName}>`
    name += '[]'
  }
  return { schema, typeName, name }
}
