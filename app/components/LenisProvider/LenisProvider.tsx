'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

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
      requestAnimationFrame(raf)
    }

    const id = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(id)
      lenis.destroy()
    }
  }, [pathname])

  return <>{children}</>
}