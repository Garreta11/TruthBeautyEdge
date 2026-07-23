'use client'

import { useRef, useEffect } from 'react'
import type { OldProject } from '@/sanity/lib/types'
import WorkRow from '@/app/components/WorkRow/WorkRow'
import { pauseVideoOutside } from '@/app/components/VideoPlayer/VideoPlayer'
import { workpageTransition } from '../../animations'
import styles from './WorkScroll.module.scss'

interface Props {
  projects: OldProject[]
}

export default function WorkScroll({ projects }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isTouchingRef = useRef(false)

  // Resetting scrollTop while a touch gesture is still active makes Safari
  // abandon it and the container stops responding to touch entirely, so the
  // boundary correction below is skipped mid-touch and re-run on touchend.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    function onTouchStart() {
      isTouchingRef.current = true
    }
    function onTouchEnd() {
      isTouchingRef.current = false
      handleScroll()
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    el.addEventListener('touchcancel', onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // el.scrollTop = el.scrollHeight / 3

    workpageTransition()

  }, [projects.length])

  // On mobile there's no hover, so the row nearest the vertical center of
  // the viewport is marked via [data-centered] instead — see the
  // `@media (max-width: 768px)` rule in WorkRow.module.scss.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let rafId: number | null = null
    let currentCentered: HTMLElement | null = null

    function updateCentered() {
      rafId = null
      const rows = el!.querySelectorAll<HTMLElement>('[data-work-row]')
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

    function onScroll() {
      if (rafId !== null) return
      rafId = requestAnimationFrame(updateCentered)
    }

    updateCentered()
    el.addEventListener('scroll', onScroll)
    window.addEventListener('resize', onScroll)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [projects.length])

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    if (isTouchingRef.current) return
    const setHeight = el.scrollHeight / 3
    if (el.scrollTop < 2) {
      el.scrollTop = setHeight
    } else if (el.scrollTop > setHeight * 2 - 2) {
      el.scrollTop = setHeight
    }
  }

  return (
    <div className={styles.scroll} ref={scrollRef} onScroll={handleScroll} data-lenis-prevent>
      {[0, 1, 2].map((copy) =>
        projects.map((project) => (
          <WorkRow key={`${project._id}-${copy}`} project={project} />
        ))
      )}
    </div>
  )
}
