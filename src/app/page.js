"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import "./page.sass"

import { useStorageContext } from "@/utils/storage"

export default function Home() {
  const router = useRouter()
  const { updateStorage, ...originalStorage } = useStorageContext()
  const [schemaId, _setSchemaId] = useState(originalStorage.schemaId ?? "/derived/game")
  function setSchemaId(newSchemaId) {
    _setSchemaId(newSchemaId)
    updateStorage({ schemaId: newSchemaId })
  }
  const schemaIdWithoutSlashes = schemaId.replace(/[/]/g, '~')
  return (
    <main className="home-page">
      <div className="schema-id">
        <input
          type="text"
          value={schemaId}
          onChange={(e) => setSchemaId(e.target.value)}
        />
        <button type="button" onClick={() => router.push(`/schema/${schemaIdWithoutSlashes}`)}>
          Go to {schemaIdWithoutSlashes}
        </button>
      </div>
    </main>
  )
}
