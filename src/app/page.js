'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { getAllSchemasToShow, routeToSchema } from './table-of-contents'

export default function Home () {
  const router = useRouter()

  useEffect(() => {
    const allSchemas = getAllSchemasToShow()
    let defaultSchema = allSchemas[0]
    for (const schema of allSchemas) {
      if (schema.$id.indexOf('/game') !== -1) {
        defaultSchema = schema
        break
      }
    }
    router.push(routeToSchema(defaultSchema), undefined, { shallow: true })
  }, [router])
}
