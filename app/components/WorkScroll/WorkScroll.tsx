/* 'use client'

import { useEffect, useRef } from 'react'
import type { OldProject } from '@/sanity/lib/types'
import WorkRow from '@/app/components/WorkRow/WorkRow'
import { pauseVideoOutside } from '@/app/components/VideoPlayer/VideoPlayer'
import { workpageTransition } from '@/app/(site)/animations'
import { useLenis } from '../LenisProvider/LenisProvider'
import styles from './WorkScroll.module.scss'

interface Props {
  projects: OldProject[]
}

export default function WorkScroll({ projects }: Props) {
  const lenis = useLenis()

  const scrollRef = useRef<HTMLDivElement>(null)
  const middleCopyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    workpageTransition()
  }, [])

  // Coloca el scroll al principio de la copia central
  useEffect(() => {
    if (!lenis) return
    if (!middleCopyRef.current) return

    lenis.scrollTo(middleCopyRef.current.offsetTop, {
      immediate: true,
    })
  }, [lenis])

  useEffect(() => {
    if (!lenis || !middleCopyRef.current) return
    const instance = lenis

    function handleScroll() {
      const middleTop = middleCopyRef.current!.offsetTop
      const sectionHeight = middleCopyRef.current!.offsetHeight

      const scroll = instance.scroll

      // Shift by exactly one copy's height so the content that lands on
      // screen after the jump is identical to what was showing before it —
      // snapping to a fixed offset instead would jump to unrelated content.
      if (scroll < middleTop) {
        instance.scrollTo(scroll + sectionHeight, { immediate: true })
      } else if (scroll > middleTop + sectionHeight) {
        instance.scrollTo(scroll - sectionHeight, { immediate: true })
      }
    }

    const unsubscribe = instance.on('scroll', handleScroll)

    return unsubscribe
  }, [lenis])

  // Seguiremos utilizando esta lógica más adelante
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

    const onResize = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(updateCentered)
    }

    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)

      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  return (
    <div ref={scrollRef} className={styles.scroll}>
      <div data-copy>
        {projects.map((project) => (
          <WorkRow key={`${project._id}-0`} project={project} />
        ))}
      </div>

      <div ref={middleCopyRef} data-copy>
        {projects.map((project) => (
          <WorkRow key={`${project._id}-1`} project={project} />
        ))}
      </div>

      <div data-copy>
        {projects.map((project) => (
          <WorkRow key={`${project._id}-2`} project={project} />
        ))}
      </div>
    </div>
  )
} */

  'use client'

import { useRef, useEffect } from 'react'
import type { OldProject } from '@/sanity/lib/types'
import WorkRow from '@/app/components/WorkRow/WorkRow'
import { pauseVideoOutside } from '@/app/components/VideoPlayer/VideoPlayer'
import { workpageTransition } from '@/app/(site)/animations'
import styles from './WorkScroll.module.scss'

interface Props {
  projects: OldProject[]
}

export default function WorkScroll({ projects }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

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