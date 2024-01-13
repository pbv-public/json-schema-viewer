"use client"
import "./schema.sass"

import { useRouter } from "next/navigation"

import { schemas } from "@/generated-schemas"
import { getSchemaDisplayName } from "@/utils/getSchemaDisplayName"

export default function SchemaViewer({ params }) {
  const router = useRouter()
  const schemaId = params.id.replace(/~/g, '/')
  const schema = schemas.schemas[schemaId]
  return (
    <div className="json-schema-viewer">
      <h1>
        <button onClick={() => router.push('/')}>&lt; Back</button>
        {getSchemaDisplayName(schema)}
      </h1>
      {JSON.stringify(schema, undefined, 2)}
    </div>
  )
}
