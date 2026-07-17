'use client'

import { useEffect } from 'react'
import WorkOverlay from '@/app/components/WorkOverlay/WorkOverlay'
import WorkScroll from '@/app/components/WorkScroll/WorkScroll'
import { useWorkAccess } from '@/app/context/WorkAccessContext'
import { revealChrome } from '@/app/animations'
import type { OldProject } from '@/sanity/lib/types'

interface Props {
  projects: OldProject[]
}

export default function WorkContent({ projects }: Props) {
  const { unlocked } = useWorkAccess()
  useEffect(() => {
    if (!unlocked) revealChrome()
  }, [unlocked])

  if (!unlocked) return null

  return (
    <>
      <WorkOverlay />
      <WorkScroll projects={projects} />
    </>
  )
}
