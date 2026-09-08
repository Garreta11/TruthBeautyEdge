'use client'

import { createContext, useContext, useRef, useState } from 'react'
import type { OldProject } from '@/sanity/lib/types'

interface ActiveRowContextValue {
  activeRow: OldProject | null
  setActiveRow: (project: OldProject | null) => void
  isVideoMobileSlide: boolean
  setIsVideoMobileSlide: (isVideoMobileSlide: boolean) => void
  // Lets whichever VideoPlayer instance is the current mobile slide register
  // how to enter fullscreen playback, so the Nav's Play button (a different
  // part of the tree) can trigger it without holding a ref to the DOM node.
  registerActiveVideoTrigger: (trigger: (() => void) | null) => void
  playActiveVideo: () => void
}

const ActiveRowContext = createContext<ActiveRowContextValue>({
  activeRow: null,
  setActiveRow: () => {},
  isVideoMobileSlide: false,
  setIsVideoMobileSlide: () => {},
  registerActiveVideoTrigger: () => {},
  playActiveVideo: () => {}
})

export function ActiveRowProvider({ children }: { children: React.ReactNode }) {
  const [activeRow, setActiveRow] = useState<OldProject | null>(null)
  const [isVideoMobileSlide, setIsVideoMobileSlide] = useState<boolean>(false)
  const activeVideoTriggerRef = useRef<(() => void) | null>(null)

  const registerActiveVideoTrigger = (trigger: (() => void) | null) => {
    activeVideoTriggerRef.current = trigger
  }

  const playActiveVideo = () => {
    activeVideoTriggerRef.current?.()
  }

  return (
    <ActiveRowContext.Provider
      value={{
        activeRow,
        setActiveRow,
        isVideoMobileSlide,
        setIsVideoMobileSlide,
        registerActiveVideoTrigger,
        playActiveVideo
      }}
    >
      {children}
    </ActiveRowContext.Provider>
  )
}

export const useActiveRow = () => useContext(ActiveRowContext)
