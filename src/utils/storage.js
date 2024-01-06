'use client'
import { createContext, useContext, useState } from 'react'

const defaultInitState = {}
const localStorageKey = 'jsonSchemaViewer'
const localStorage = (typeof window !== 'undefined') ? window.localStorage : null
const initStateFromLocalStorage = JSON.parse(
  localStorage?.getItem?.(localStorageKey) ?? '{}')

const StorageContext = createContext()

export function StorageProvider ({ children }) {
  const [state, setState] = useState({
    ...defaultInitState,
    ...initStateFromLocalStorage
  })
  const v = {
    ...state,
    updateStorage: stateChanges => {
      setState(oldState => {
        const newState = { ...oldState, ...stateChanges }
        localStorage?.setItem?.(localStorageKey, JSON.stringify(newState))
        return newState
      })
    }
  }
  return <StorageContext.Provider value={v}>{children}</StorageContext.Provider>
}

export const useStorageContext = () => useContext(StorageContext)
