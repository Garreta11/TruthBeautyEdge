'use client'

import { useEffect, useRef, useState } from 'react'
import type { OldProject } from '@/sanity/lib/types'
import InfiniteScrollHorizontal from '../InfiniteScrollHorizontal/InfiniteScrollHorizontal'
import styles from './InfiniteScrollVertical.module.scss'
import { workpageTransition } from '@/app/(site)/animations'

interface Props {
  projects: OldProject[]
  friction?: number
}

const InfiniteScrollVertical = ({ projects, friction }: Props) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const duplicatedProjects = [...projects, ...projects]

  // Detectamos fricción óptima si no viene una por props
  const [effectiveFriction, setEffectiveFriction] = useState(() => {
    if (friction !== undefined) return friction
    // Si estamos en browser y detectamos táctil/móvil
    if (typeof window !== 'undefined') {
      const isTouch = window.matchMedia('(pointer: coarse)').matches
      return isTouch ? 0.96 : 0.90
    }
    return 0.90 // Fallback
  })

  const yPos = useRef(0)
  const velocity = useRef(0)

  const isDragging = useRef(false)
  const lastY = useRef(0)
  const [isGrabbing, setIsGrabbing] = useState(false)

  useEffect(() => {
    workpageTransition()
  }, [])

  useEffect(() => {
    // Escucha cambios de pantalla o tipo de puntero
    const mediaQuery = window.matchMedia('(pointer: coarse)')
    const updateFriction = (e: MediaQueryListEvent | MediaQueryList) => {
      if (friction === undefined) {
        setEffectiveFriction(e.matches ? 0.96 : 0.9)
      }
    }

    updateFriction(mediaQuery)
    mediaQuery.addEventListener('change', updateFriction)

    return () => mediaQuery.removeEventListener('change', updateFriction)
  }, [friction])

  // Which row is "centered" (drives the brightness toggle in
  // InfiniteScrollVertical.module.scss) is detected via IntersectionObserver
  // instead of scanning every row's getBoundingClientRect on every rAF
  // frame — rootMargin shrinks the observed viewport to a thin band at the
  // vertical center, so a row only triggers the callback when it crosses
  // that line, same approach as WorkScroll.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const rows = track.querySelectorAll<HTMLElement>('[data-work-row]')
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
        }
      },
      { rootMargin: '-49% 0px -49% 0px', threshold: 0 }
    )

    rows.forEach((row) => observer.observe(row))

    return () => observer.disconnect()
  }, [projects])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let animationFrameId: number
    console.log("effectiveFriction", effectiveFriction)

    const updatePhysics = () => {
      if (!isDragging.current) {
        yPos.current += velocity.current
        velocity.current *= effectiveFriction

        if (Math.abs(velocity.current) < 0.01) {
          velocity.current = 0
        }
      }

      const halfHeight = track.scrollHeight / 2

      if (yPos.current >= halfHeight) {
        yPos.current -= halfHeight
      } else if (yPos.current < 0) {
        yPos.current += halfHeight
      }

      track.style.transform = `translateY(-${yPos.current}px)`

      animationFrameId = requestAnimationFrame(updatePhysics)
    }

    const handleWheel = (e: WheelEvent) => {
      // Si el movimiento principal es vertical, scroll vertical
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        velocity.current += e.deltaY * 0.3
      }
    }

    track.addEventListener('wheel', handleWheel, { passive: false })
    animationFrameId = requestAnimationFrame(updatePhysics)

    return () => {
      track.removeEventListener('wheel', handleWheel)
      cancelAnimationFrame(animationFrameId)
    }
  }, [effectiveFriction])

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    setIsGrabbing(true)

    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    lastY.current = e.clientY
    velocity.current = 0
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return

    const deltaY = lastY.current - e.clientY
    lastY.current = e.clientY

    yPos.current += deltaY
    velocity.current = deltaY
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    isDragging.current = false
    setIsGrabbing(false)

    if ((e.target as HTMLElement).hasPointerCapture(e.pointerId)) {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    }

    velocity.current *= 1.2
  }

  return (
    <div
      className={`${styles.scrollContainer} ${isGrabbing ? styles.isGrabbing : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div ref={trackRef} className={styles.scrollTrack}>
        {duplicatedProjects.map((project, index) => (
          <div key={`${project._id}-${index}`} className={styles.projectRow} data-work-row>
            <InfiniteScrollHorizontal
              projectId={project._id} // ID único que conecta las dos instancias del proyecto
              media={project.media}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default InfiniteScrollVertical