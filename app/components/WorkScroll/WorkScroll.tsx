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

const HORIZONTAL_LERP = 1
const FRICTION = 0.94 // velocity multiplier applied per frame while coasting
const VELOCITY_EPSILON = 0.02 // px/frame below which the coast is considered stopped

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
      // Once the gesture ends, keep advancing target with decaying velocity
      // instead of stopping dead — a momentum coast, same idea as native
      // touch scrolling.
      if (!state.isDragging) {
        if (Math.abs(state.velocity) > VELOCITY_EPSILON) {
          state.target += state.velocity
          state.velocity *= FRICTION
        } else {
          state.velocity = 0
        }
      }

      const delta = state.target - state.current
      const atRest = Math.abs(delta) < 0.01 && state.velocity === 0 && !state.isDragging
      if (atRest) return

      state.current += delta * HORIZONTAL_LERP
      if (state.tracks.size === 0 || state.width <= 0) return

      const offset = modulo(state.current, state.width)
      state.tracks.forEach((track) => {
        track.style.transform = `translate3d(${-offset}px, 0, 0)`
      })
    })
  })

  // Which row is "centered" (drives the brightness/hover-simulation and
  // video-pause-outside behavior) is now detected via IntersectionObserver
  // instead of scanning every row's getBoundingClientRect on every scroll
  // frame — rootMargin shrinks the observed viewport to a thin band at the
  // vertical center, so a row only triggers the callback when it crosses
  // that line, and its rect comes for free from the entry instead of a
  // forced layout read.
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const rows = container.querySelectorAll<HTMLElement>('[data-work-row]')
    if (!rows.length) return

    let currentCentered: HTMLElement | null = null
    const intersecting = new Map<HTMLElement, DOMRectReadOnly>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const row = entry.target as HTMLElement
          if (entry.isIntersecting) {
            intersecting.set(row, entry.boundingClientRect)
          } else {
            intersecting.delete(row)
          }
        }

        if (intersecting.size === 0) return

        const viewportCenter = window.innerHeight / 2
        let closest: HTMLElement | null = null
        let closestDistance = Infinity

        for (const [row, rect] of intersecting) {
          const rowCenter = rect.top + rect.height / 2
          const distance = Math.abs(rowCenter - viewportCenter)
          if (distance < closestDistance) {
            closestDistance = distance
            closest = row
          }
        }

        if (closest !== currentCentered) {
          currentCentered?.setAttribute('data-centered', 'false')
          closest?.setAttribute('data-centered', 'true')
          currentCentered = closest
          pauseVideoOutside(closest)
        }
      },
      { rootMargin: '-49% 0px -49% 0px', threshold: 0 }
    )

    rows.forEach((row) => observer.observe(row))

    return () => observer.disconnect()
  }, [projects])

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
