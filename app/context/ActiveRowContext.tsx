'use client'

import { createContext, useContext, useState } from 'react'
import type { OldProject } from '@/sanity/lib/types'

interface ActiveRowContextValue {
  activeRow: OldProject | null
  setActiveRow: (project: OldProject | null) => void
}

const ActiveRowContext = createContext<ActiveRowContextValue>({
  activeRow: null,
  setActiveRow: () => {},
})

export function ActiveRowProvider({ children }: { children: React.ReactNode }) {
  const [activeRow, setActiveRow] = useState<OldProject | null>(null)
  return (
    <ActiveRowContext.Provider value={{ activeRow, setActiveRow }}>
      {children}
    </ActiveRowContext.Provider>
  )
}

export const useActiveRow = () => useContext(ActiveRowContext)
