"use client"
import "./schema.sass"

import { useRouter } from "next/navigation"

import { schemas } from "@/generated-schemas"

export default function RallyEditor({ params }) {
  const router = useRouter()
  const schemaId = params.id.replace(/~/g, '/')
  const schema = schemas[schemaId]
  return (
    <div className="json-schema-viewer">
      <h1>{schemaId}</h1>
      <button onClick={() => router.push('/')}>Back</button>
      {JSON.stringify(schema, undefined, 2)}
    </div>
  )
}
