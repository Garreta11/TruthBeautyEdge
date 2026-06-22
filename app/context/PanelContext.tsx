'use client'

import { createContext, useContext, useState } from 'react'

type OpenPanel = 'info' | 'reachOut' | null

interface PanelContextValue {
  openPanel: OpenPanel
  setOpenPanel: (panel: OpenPanel) => void
}

const PanelContext = createContext<PanelContextValue>({
  openPanel: null,
  setOpenPanel: () => {},
})

export function PanelProvider({ children }: { children: React.ReactNode }) {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null)
  return (
    <PanelContext.Provider value={{ openPanel, setOpenPanel }}>
      {children}
    </PanelContext.Provider>
  )
}

export const usePanel = () => useContext(PanelContext)
