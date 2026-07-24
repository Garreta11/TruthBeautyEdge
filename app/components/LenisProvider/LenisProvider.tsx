'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

const LenisContext = createContext<Lenis | null>(null)

export function useLenis() {
  return useContext(LenisContext)
}

interface Props {
  children: ReactNode
}

export default function LenisProvider({ children }: Props) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {

    const instance = new Lenis({
      autoRaf: true,
    })

    setLenis(instance)

    return () => {
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return (
    <LenisContext.Provider value={lenis}>
      {children}
    </LenisContext.Provider>
  )
}