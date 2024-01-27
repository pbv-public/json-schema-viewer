import './schema.sass'

import { ArrowRight, Download } from '@mui/icons-material'
import { Breadcrumbs, Chip, Link } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { schemas } from './generated-schemas.js'
import { getMainSchema, getSchemaDisplayName, routeToSchema, schemaIdWithoutSlashes } from './utils.js'

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

  // scroll to the top of the window whenever we go to a new view (otherwise
  // on a short window we might be looking at an empty space)
  const [oldQS, setOldQueryString] = useState({ schemaId, pathStr })
  useEffect(() => {
    if (oldQS.pathStr !== pathStr || oldQS.schemaId !== schemaId) {
      setOldQueryString({ schemaId, pathStr })
      window.scrollTo(0, 0)
    }
  }, [oldQS, pathStr, schemaId])

  // clear the search params if they aren't for a valid schema
  const mainSchema = getMainSchema()
  useEffect(() => {
    if (!schema) {
      if (!mainSchema) {
        setSearchParams({})
      } else {
        navigate(routeToSchema(mainSchema))
      }
    }
  }, [mainSchema, navigate, schema, schemaId, setSearchParams])

  // if no schema is selected, ask the user to pick one
  if (!schema) {
    return <div style={{ margin: '0.5rem 1rem' }}>Pick a schema to explore!</div>
  }

  // find the properties at this path, and the names of the path segments to it
  let at = schema
  const atTypeInfo = getTypeInfo(at)
  const pathNames = [atTypeInfo.name]
  const pathTypes = [atTypeInfo.typeName]
  function goPastArraysAndMaps () {
    while (at.type === 'array' || at.patternProperties) {
      if (at.patternProperties) {
        at = Object.values(at.patternProperties)[0]
      } else {
        at = at.items
      }
    }
  }
  for (const curPiece of pathKeys) {
    goPastArraysAndMaps()
    at = at.properties[curPiece]
    const curTypeInfo = getTypeInfo(at, curPiece)
    pathNames.push(curPiece ?? curTypeInfo.typeName)
    pathTypes.push(curTypeInfo.typeName)
    goPastArraysAndMaps()
  }
  const directProps = at?.properties ?? {} // omitted if `at` is a primitive type

  let desc = at.description
  if (at.$ref) {
    const refSchema = schemas.schemas[at.$ref]
    if (refSchema?.description) {
      desc = refSchema?.description
    }
  }

  const md5s = (schema === at) ? schema.__md5 : null
  return (
    <div className='json-schema-viewer'>
      <Breadcrumbs separator={<ArrowRight />}>
        {pathNames.map((x, i) => (
          <span key={i}>
            {i === 0 && (
              <Download className='clickable' onClick={() => downloadSchema(schema)} />
            )}
            <Link
              className={`path-part clickable${i === pathNames.length - 1 ? ' last-item' : ''}`}
              underline='hover'
              color={i === pathNames.length - 1 ? undefined : 'inherit'}
              onClick={() => goToPropPath(pathKeys.slice(0, i))}
            >
              {x}
            </Link>
          </span>
        ))}
      </Breadcrumbs>
      <div className='schema-portion'>
        <div className='main-type'>
          <span className='property-type'>{pathTypes[pathTypes.length - 1]}</span>
        </div>
        <Markdown className='description'>{desc}</Markdown>
        <Properties
          props={directProps}
          at={at} pathKeys={pathKeys} goToPropPath={goToPropPath}
        />
      </div>
      {md5s && (
        <div className='schema-versions'>
          <div className='schema-version functional'>
            <span className='label'>{atTypeInfo.name} Functional Schema Version Hash: </span>
            <span className='version'>{md5s.functional}</span>
          </div>
          <div className='schema-version full'>
            <span className='label'>{atTypeInfo.name} Full Schema Version Hash: </span>
            <span className='version'>{md5s.full}</span>
          </div>
        </div>
      )}
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
  const canClickInto = !typeInfo.isPrimitiveType || typeInfo.schema.$ref
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
        <Chip key={validValue} color='info' label={validValue} />
      )}
    </div>
  )
}

function getTypeInfo (schema, fromKey) {
  if (schema.type === 'object') {
    let isPrimitiveType = false
    let typeName
    if (schema.patternProperties) {
      const [keyPattern, valueSchema] = Object.entries(schema.patternProperties)[0]
      const valueTypeInfo = getTypeInfo(valueSchema)
      if (valueTypeInfo.isPrimitiveType) {
        isPrimitiveType = true
      }
      let niceKeyPattern = keyPattern
      if (niceKeyPattern.startsWith('^')) {
        niceKeyPattern = niceKeyPattern.substring(1)
      }
      if (niceKeyPattern.endsWith('$')) {
        niceKeyPattern = niceKeyPattern.substring(0, niceKeyPattern.length - 1)
      }
      const match = schema.description.match(/The key is ([^. ]*)/)
      if (match && match[1]) {
        const keySchemaId = match[1]
        const keySchema = schemas.schemas[keySchemaId]
        if (keySchema) {
          niceKeyPattern = getTypeInfo(keySchema).name
        } else {
          niceKeyPattern = keySchemaId
        }
      }
      typeName = `Map<${niceKeyPattern}, ${valueTypeInfo.name}>`
    } else {
      typeName = getSchemaDisplayName(schema) ?? fromKey ?? 'object'
    }
    return { schema, typeName, name: typeName, isPrimitiveType }
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
    } else if (schema.$ref) {
      const refSchema = schemas.schemas[schema.$ref]
      if (refSchema?.title) {
        ret.typeName = refSchema.title
      }
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
  return { isPrimitiveType, name, schema, typeName }
}

function downloadSchema (schema) {
  const link = document.createElement('a')
  link.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(
    JSON.stringify(schema))
  let name
  if (schema.title) {
    name = schema.title.toLocaleLowerCase().replace(/ /g, '_')
  } else {
    name = schemaIdWithoutSlashes(schema.$id, '_')
    if (name.startsWith('_')) {
      name = name.substring(1)
    }
  }
  const version = schema.properties?.version?.const
  if (version) {
    name += `-${version}`
  }
  link.setAttribute('download', `${name}.schema.json`)
  document.body.appendChild(link)
  link.click()
  link.parentNode.removeChild(link)
}
