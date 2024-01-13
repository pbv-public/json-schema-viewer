'use client'
import './schema.sass'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { schemas } from '../../../generated-schemas.js'
import { getSchemaDisplayName } from '../../../utils/getSchemaDisplayName.js'

export default function SchemaViewer ({ params }) {
  const router = useRouter()
  const schemaId = params.id.replace(/~/g, '/')
  const schema = schemas.schemas[schemaId]

  const searchParams = useSearchParams()
  const pathStr = searchParams.get('p') ?? '' // empty=root, x.y.z = child
  const pathPieces = pathStr
    ? pathStr.split('.')
    : []

  // find the properties at this path, and the names of the path segments to it
  const pathNames = []
  let at = schema
  for (const curPiece of pathPieces) {
    at = at.properties[curPiece]
    const { name } = getTypeInfo(at, curPiece)
    pathNames.push(name)
  }
  const directProps = at.properties ?? {} // omitted if `at` is a primitive type

  return (
    <div className="json-schema-viewer">
      <h1>
        <button onClick={() => router.push('/')}>&lt; Back</button>
        {pathNames.map((x, i) => (<span className="path-part" key={i}>{x}</span>))}
      </h1>
      <div className="description">{at.description}</div>

      <h2>Properties</h2>
      {Object.entries(directProps).map(([k, v]) => (
        <ClickableProperty key={k} schema={v} fromKey={k} fromSchema={at} pathNames={pathNames} />
      ))}
    </div>
  )
}

function ClickableProperty ({ schema, fromKey, fromSchema, pathNames }) {
  const urlPathName = usePathname()
  const router = useRouter()
  const prop = <Property schema={schema} fromKey={fromKey} fromSchema={fromSchema} />
  if (!getTypeInfo(schema, fromKey).isPrimitiveType) {
    return prop
  }
  return (
    <div
      className="clickable-property"
      onClick={() => {
        router.push(urlPathName + '?p=' + pathNames.concat([fromKey]).join('.'))
      }}>
      {prop}
    </div>
  )
}

function Property ({ schema, fromSchema, fromKey }) {
  const { typeName, value } = getTypeInfo(schema, fromKey)
  return (
    <div className="property">
      <div className="property-definition">
        <span className="property-type">{typeName}</span>
        <span className="property-name">{fromKey}</span>
        {value !== undefined && (
          <pre className="property-const-value"> = {JSON.stringify(value)}</pre>
        )}
        {fromSchema.required.indexOf(fromKey) === -1
          ? <span className="optional">optional</span>
          : null}
      </div>
      <div className="property-description">{schema.description}</div>
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
      ret.typeName = 'const ' + (Array.isArray(c)
        ? 'array'
        : typeof c)
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
  let name = typeName + ' '
  for (let i = 0; i < numArrayWraps; i++) {
    typeName = `Array<${typeName}>`
    if (i === numArrayWraps - 1) {
      name += 'items'
    } else {
      name += 'sub-'
    }
  }
  return { schema, typeName, name }
}
