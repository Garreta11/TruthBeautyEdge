'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'

interface InteractionContextValue {
  hasInteracted: boolean
  setInteracted: () => void
}

const InteractionContext = createContext<InteractionContextValue>({
  hasInteracted: false,
  setInteracted: () => {},
})

export function InteractionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [hasInteracted, setHasInteracted] = useState(pathname !== '/')
  const setInteracted = useCallback(() => setHasInteracted(true), [])

  return (
    <InteractionContext.Provider value={{ hasInteracted, setInteracted }}>
      {children}
    </InteractionContext.Provider>
  )
}

export const useInteraction = () => useContext(InteractionContext)
