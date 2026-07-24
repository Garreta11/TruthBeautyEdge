'use client'

import { useRef, useEffect } from 'react'
import type { OldProject } from '@/sanity/lib/types'
import WorkRow, { type StripGroups } from '@/app/components/WorkRow/WorkRow'
import { pauseVideoOutside } from '@/app/components/VideoPlayer/VideoPlayer'
import styles from './WorkScroll.module.scss'

interface Props {
  projects: OldProject[]
}

export default function WorkScroll({ projects }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const stripGroups = useRef<StripGroups>(new Map()).current

  useEffect(() => {
    let rafId: number | null = null
    let currentCentered: HTMLElement | null = null

    function updateCentered() {
      rafId = null

      const rows =
        scrollRef.current?.querySelectorAll<HTMLElement>('[data-work-row]')

      if (!rows?.length) return

      const viewportCenter = window.innerHeight / 2

      let closest: HTMLElement | null = null
      let closestDistance = Infinity

      rows.forEach((row) => {
        const rect = row.getBoundingClientRect()
        const rowCenter = rect.top + rect.height / 2
        const distance = Math.abs(rowCenter - viewportCenter)

        if (distance < closestDistance) {
          closestDistance = distance
          closest = row
        }
      })

      rows.forEach((row) => {
        row.setAttribute('data-centered', String(row === closest))
      })

      if (closest !== currentCentered) {
        currentCentered = closest
        pauseVideoOutside(closest)
      }
    }

    updateCentered()

    const scheduleUpdate = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(updateCentered)
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)

      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  return (
    <div className={styles.scroll} ref={scrollRef}>
      {projects.map((project) => (
        <WorkRow key={`${project._id}`} project={project} stripGroups={stripGroups} />
      ))}
      {projects.length > 0 && (
        <WorkRow key={`${projects[0]._id}-duplicate`} project={projects[0]} stripGroups={stripGroups} />
      )}
      {projects.length > 1 && (
        <WorkRow key={`${projects[1]._id}-duplicate`} project={projects[1]} stripGroups={stripGroups} />
      )}
    </div>
  )
}