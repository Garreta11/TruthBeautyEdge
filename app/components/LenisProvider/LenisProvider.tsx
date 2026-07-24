'use client'

import { createContext, useContext, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

type RafCallback = (time: number) => void

const LenisRafContext = createContext<{
  subscribeRaf: (callback: RafCallback) => () => void
} | null>(null)

// Lets other components (e.g. WorkRow's virtual horizontal scroll) piggyback
// on the single rAF loop Lenis already runs, instead of each spinning up
// its own requestAnimationFrame.
export function useLenisRaf(callback: RafCallback) {
  const context = useContext(LenisRafContext)
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!context) return
    return context.subscribeRaf((time) => callbackRef.current(time))
  }, [context])
}

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const subscribersRef = useRef(new Set<RafCallback>())

  useEffect(() => {
    if (pathname.startsWith('/studio')) return

    const isWorkpage = pathname === "/work";

    const lenis = new Lenis({
      /* lerp: 0.08, */
      wheelMultiplier: 1,
      smoothWheel: true,
      infinite: isWorkpage,
      // Required by Lenis for `infinite` to track touch gestures correctly.
      syncTouch: isWorkpage,
    });

    function raf(time: number) {
      lenis.raf(time)
      subscribersRef.current.forEach((callback) => callback(time))
      requestAnimationFrame(raf)
    }

    const id = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(id)
      lenis.destroy()
    }
  }, [pathname])

  const contextValue = useRef({
    subscribeRaf: (callback: RafCallback) => {
      subscribersRef.current.add(callback)
      return () => {
        subscribersRef.current.delete(callback)
      }
    },
  }).current

  return <LenisRafContext.Provider value={contextValue}>{children}</LenisRafContext.Provider>
}
