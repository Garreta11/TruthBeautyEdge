'use client'

import { useEffect } from 'react'
import WorkOverlay from '@/app/components/WorkOverlay/WorkOverlay'
import WorkScroll from '@/app/components/WorkScroll/WorkScroll'
import { useWorkAccess } from '@/app/context/WorkAccessContext'
import { homepageTransition } from '@/app/animations'
import type { OldProject } from '@/sanity/lib/types'

interface Props {
  projects: OldProject[]
}

export default function WorkContent({ projects }: Props) {
  const { unlocked } = useWorkAccess()
  useEffect(() => {
    if (!unlocked) {
      const logoEl = document.querySelector<HTMLElement>('[data-logo]')
      const navEls = document.querySelector<HTMLElement>('[data-nav-els]')
      const videoEl = document.querySelector<HTMLElement>('[data-video-bg]')
      if (logoEl) logoEl.style.opacity = '1'
      if (navEls) navEls.style.opacity = '1'
      if (videoEl) videoEl.style.opacity = '1'
    }
  }, [unlocked])

  if (!unlocked) return null

  return (
    <>
      <WorkOverlay />
      <WorkScroll projects={projects} />
    </>
  )
}
