'use client'

import { createContext, useContext, useState } from 'react'

interface WorkAccessContextValue {
  unlocked: boolean
  setUnlocked: (value: boolean) => void
}

const WorkAccessContext = createContext<WorkAccessContextValue>({
  unlocked: false,
  setUnlocked: () => {},
})

export function WorkAccessProvider({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)
  return (
    <WorkAccessContext.Provider value={{ unlocked, setUnlocked }}>
      {children}
    </WorkAccessContext.Provider>
  )
}

export const useWorkAccess = () => useContext(WorkAccessContext)
