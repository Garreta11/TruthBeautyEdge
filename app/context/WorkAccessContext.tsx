'use client'

import { createContext, useContext } from 'react'

const WorkAccessContext = createContext<boolean>(false)

export function WorkAccessProvider({
  unlocked,
  children,
}: {
  unlocked: boolean
  children: React.ReactNode
}) {
  return (
    <WorkAccessContext.Provider value={unlocked}>
      {children}
    </WorkAccessContext.Provider>
  )
}

export const useWorkAccess = () => useContext(WorkAccessContext)
