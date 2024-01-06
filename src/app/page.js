"use client"
import { useState } from "react"
import "./page.sass"

import { useStorageContext } from "@/utils/storage"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const { updateStorage, ...originalStorage } = useStorageContext()
  const [schemaId, _setSchemaId] = useState(originalStorage.schemaId ?? "/derived/game")
  function setSchemaId(newSchemaId) {
    _setSchemaId(newSchemaId)
    updateStorage({ schemaId: newSchemaId })
  }
  return (
    <main className="home-page">
      <div className="schema-id">
        <input
          type="text"
          value={schemaId}
          onChange={(e) => setSchemaId(e.target.value)}
        />
        <button type="button" onClick={() => router.push(`/schema/${schemaId}`)}>
          Go
        </button>
      </div>
    </main>
  )
}
