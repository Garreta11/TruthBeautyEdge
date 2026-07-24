'use client'

import { useRef, useEffect } from 'react'
import type { OldProject } from '@/sanity/lib/types'
import WorkRow, { type HorizontalScrollStates } from '@/app/components/WorkRow/WorkRow'
import { pauseVideoOutside } from '@/app/components/VideoPlayer/VideoPlayer'
import { workpageTransition } from '@/app/(site)/animations'
import { useLenisRaf } from '@/app/components/LenisProvider/LenisProvider'
import styles from './WorkScroll.module.scss'

interface Props {
  projects: OldProject[]
}

const HORIZONTAL_LERP = 0.1

function modulo(n: number, d: number) {
  return ((n % d) + d) % d
}

export default function WorkScroll({ projects }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const horizontalStates = useRef<HorizontalScrollStates>(new Map()).current

  useEffect(() => {
    workpageTransition()
  }, [])

  // Single shared render loop for every row's virtual horizontal scroll:
  // physics run once per project here, then get applied to every track
  // registered for it — the original row and its duplicate share the same
  // state object, so they stay in sync for free.
  useLenisRaf(() => {
    horizontalStates.forEach((state) => {
      state.current += (state.target - state.current) * HORIZONTAL_LERP
      if (state.tracks.size === 0) return

      const [firstTrack] = state.tracks
      const oneCopyWidth = firstTrack.scrollWidth / 3
      if (oneCopyWidth <= 0) return

      const offset = modulo(state.current, oneCopyWidth)
      state.tracks.forEach((track) => {
        track.style.transform = `translate3d(${-offset}px, 0, 0)`
      })
    })
  })

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
        <WorkRow key={`${project._id}`} project={project} horizontalStates={horizontalStates} />
      ))}
      {projects.length > 0 && (
        <WorkRow key={`${projects[0]._id}-duplicate`} project={projects[0]} horizontalStates={horizontalStates} />
      )}
      {projects.length > 1 && (
        <WorkRow key={`${projects[1]._id}-duplicate`} project={projects[1]} horizontalStates={horizontalStates} />
      )}
    </div>
  )
}
