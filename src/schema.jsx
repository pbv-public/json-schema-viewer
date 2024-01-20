import './schema.sass'

import { ArrowRight } from '@mui/icons-material'
import { Breadcrumbs, Chip, Link } from '@mui/material'
import { useCallback, useEffect } from 'react'
import Markdown from 'react-markdown'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { schemas } from './generated-schemas.js'
import { getSchemaDisplayName } from './utils.js'

export function JSONSchemaViewer () {
  const loc = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    if (loc.pathname !== '/') {
      navigate('/')
    }
  }, [loc, navigate])

  const [searchParams, setSearchParams] = useSearchParams()
  const schemaId = (searchParams.get('s') ?? '').replace(/~/g, '/')
  const schema = schemas.schemas[schemaId]
  const pathStr = searchParams.get('p') ?? '' // empty=root, x.y.z = child
  const pathKeys = pathStr ? pathStr.split('.') : []
  const goToPropPath = useCallback(pathKeys => {
    setSearchParams({ s: schemaId, p: pathKeys.join('.') })
  }, [schemaId, setSearchParams])

  // clear the search params if they aren't for a valid schema
  useEffect(() => {
    if (!schema && schemaId) {
      setSearchParams({})
    }
  }, [schema, schemaId, setSearchParams])

  // if no schema is selected, ask the user to pick one
  if (!schema) {
    return <div style={{ margin: '0.5rem 1rem' }}>Pick a schema to explore!</div>
  }

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
  const directProps = at?.properties ?? {} // omitted if `at` is a primitive type

  return (
    <div className='json-schema-viewer'>
      <Breadcrumbs separator={<ArrowRight />}>
        {pathNames.map((x, i) => (
          <Link
            key={i}
            className={`path-part clickable${i === pathNames.length - 1 ? ' last-item' : ''}`}
            underline='hover'
            color={i === pathNames.length - 1 ? undefined : 'inherit'}
            onClick={() => goToPropPath(pathKeys.slice(0, i))}
          >
            {x}
          </Link>
        ))}
      </Breadcrumbs>
      <div className='schema-portion'>
        <Markdown className='description'>{at.description}</Markdown>
        <Properties
          props={directProps}
          at={at} pathKeys={pathKeys} goToPropPath={goToPropPath}
        />
      </div>
    </div>
  )
}

function Properties ({ props, at, pathKeys, goToPropPath }) {
  if (!Object.keys(props).length) {
    return
  }
  return (
    <>
      <h2>Properties</h2>
      {Object.entries(props).map(([k, v], i) => (
        <Property
          key={k}
          className={i === 0 ? 'first' : ''}
          schema={v}
          fromKey={k}
          fromSchema={at}
          pathKeys={pathKeys}
          goToPropPath={goToPropPath}
        />
      ))}
    </>
  )
}

function Property ({ className, schema, fromKey, fromSchema, pathKeys, goToPropPath }) {
  const typeInfo = getTypeInfo(schema, fromKey)
  const canClickInto = !typeInfo.isPrimitiveType && !typeInfo.hasPrimitiveType
  const onClick = useCallback(() => {
    if (canClickInto) {
      goToPropPath(pathKeys.concat([fromKey]))
    }
  }, [canClickInto, fromKey, goToPropPath, pathKeys])
  const { min, max, typeName, validValues, value } = getTypeInfo(schema, fromKey)
  return (
    <div className={`property ${className}`}>
      <div
        className={`property-definition${canClickInto ? ' clickable' : ''}`}
        onClick={onClick}
      >
        <span className='property-type'>{typeName}</span>
        <span className='property-name'>{fromKey}</span>
        {value !== undefined && (
          <>
            <pre className='property-const-value'> = {JSON.stringify(value)}</pre>
            <Chip label='const' />
          </>
        )}
        {(fromSchema.required?.indexOf(fromKey) ?? -1) === -1
          ? <Chip label='optional' />
          : null}
        <MinMaxChip min={min} max={max} />
      </div>
      <ValidValues validValues={validValues} />
      <Markdown className='description'>{schema.description}</Markdown>
    </div>
  )
}

function MinMaxChip ({ min, max }) {
  let text
  if (min !== undefined && max !== undefined) {
    text = `must be in the range [${min}, ${max}]`
  } else if (min !== undefined) {
    text = `must be >= ${min}`
  } else if (max !== undefined) {
    text = `must be <= ${min}`
  }
  if (text) {
    return <div className='min-max'><Chip color='warning' label={text} /></div>
  }
}

function ValidValues ({ validValues }) {
  if (!validValues) {
    return
  }
  return (
    <div className='valid-values'>
      <span className='label'>Valid values:</span>
      {validValues.map(validValue =>
        <Chip color='info' label={validValue} />
      )}
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
      validValues: schema.enum,
      min: schema.minimum,
      max: schema.maximum,
      isPrimitiveType: true,
      schema,
      typeName: schema.type === 'number' ? 'double' : schema.type,
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
  const arrayWraps = []
  while (schema.type === 'array') {
    const { maxItems: max, minItems: min } = schema
    schema = schema.items
    arrayWraps.push({ min, max })
  }
  let { isPrimitiveType, typeName } = getTypeInfo(schema, fromKey)
  let extra = ''
  let hasMinOrMax = false
  for (const { min, max } of arrayWraps) {
    typeName = `Array<${typeName}>`

    if (max === min && min !== undefined) {
      extra += `[${min}]`
      hasMinOrMax = true
    } else if (max !== undefined) {
      extra += `[0,${max}]`
      hasMinOrMax = true
    } else if (min !== undefined) {
      extra += `[${min}+]`
      hasMinOrMax = true
    } else {
      extra += '[]'
    }
  }
  const name = typeName + extra
  if (hasMinOrMax) {
    typeName += extra
  }
  return { hasPrimitiveType: isPrimitiveType, name, schema, typeName }
}
