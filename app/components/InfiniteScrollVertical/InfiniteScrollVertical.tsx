'use client'

import { useEffect, useRef, useState } from 'react'
import type { OldProject } from '@/sanity/lib/types'
import InfiniteScrollHorizontal from '../InfiniteScrollHorizontal/InfiniteScrollHorizontal'
import styles from './InfiniteScrollVertical.module.scss'

interface Props {
  projects: OldProject[]
  friction?: number
}

const InfiniteScrollVertical = ({ projects, friction = 0.93 }: Props) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const duplicatedProjects = [...projects, ...projects]

  const yPos = useRef(0)
  const velocity = useRef(0)

  const isDragging = useRef(false)
  const lastY = useRef(0)
  const [isGrabbing, setIsGrabbing] = useState(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let animationFrameId: number

    const updatePhysics = () => {
      if (!isDragging.current) {
        yPos.current += velocity.current
        velocity.current *= friction

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
  }, [friction])

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
          <div key={`${project._id}-${index}`} className={styles.projectRow}>
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