'use client'

import { useEffect } from 'react'
import WorkOverlay from '@/app/components/WorkOverlay/WorkOverlay'
import WorkScroll from '@/app/components/WorkScroll/WorkScroll'
import { useWorkAccess } from '@/app/context/WorkAccessContext'
import { revealChrome } from '@/app/(site)/animations'
import type { OldProject } from '@/sanity/lib/types'
import InfiniteScrollVertical from '../../components/InfiniteScrollVertical/InfiniteScrollVertical'

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
      {/* <InfiniteScrollVertical projects={projects} /> */}
    </>
  )
}
