'use client'

import { useEffect, useRef, useState } from 'react'
import type { OldProject } from '@/sanity/lib/types'
import styles from './InfiniteScrollVertical.module.scss'

interface Props {
  projects: OldProject[]
  friction?: number // Resistencia de frenado (0.95 = suave/largo, 0.85 = rápido)
}

const InfiniteScrollVertical = ({ projects, friction = 0.93 }: Props) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const duplicatedProjects = [...projects, ...projects]

  // Estado de la posición física e inercia
  const yPos = useRef(0)
  const velocity = useRef(0)

  // Control de interacción por arrastre/touch
  const isDragging = useRef(false)
  const lastY = useRef(0)
  
  // Estado para el cursor en CSS
  const [isGrabbing, setIsGrabbing] = useState(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let animationFrameId: number

    // Bucle continuo para procesar la física e inercia (60-120 FPS)
    const updatePhysics = () => {
      // 1. Aplicamos la velocidad acumulada
      if (!isDragging.current) {
        yPos.current += velocity.current

        // 2. Aplicamos fricción para reducir gradualmente la velocidad (Inercia)
        velocity.current *= friction

        // Si la velocidad es imperceptible, la detenemos
        if (Math.abs(velocity.current) < 0.01) {
          velocity.current = 0
        }
      }

      // 3. Control del loop infinito continuo
      const halfHeight = track.scrollHeight / 2

      if (yPos.current >= halfHeight) {
        yPos.current -= halfHeight
      } else if (yPos.current < 0) {
        yPos.current += halfHeight
      }

      // 4. Transformación de posición en la GPU
      track.style.transform = `translateY(-${yPos.current}px)`

      animationFrameId = requestAnimationFrame(updatePhysics)
    }

    // Manejo del evento Wheel (Rueda del ratón / Touchpad)
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      // Inyectamos impulso con la rueda
      velocity.current += e.deltaY * 0.3
    }

    track.addEventListener('wheel', handleWheel, { passive: false })
    animationFrameId = requestAnimationFrame(updatePhysics)

    return () => {
      track.removeEventListener('wheel', handleWheel)
      cancelAnimationFrame(animationFrameId)
    }
  }, [friction])

  // --- Gestos Táctiles y Arrastre de Ratón (Pointer Events) ---

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    setIsGrabbing(true)

    // Permite rastrear el puntero fuera de los límites del contenedor
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)

    lastY.current = e.clientY
    
    // Al tocar de nuevo, detenemos la inercia actual suavemente
    velocity.current = 0
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return

    const deltaY = lastY.current - e.clientY
    lastY.current = e.clientY

    // Desplazamos en tiempo real con la mano/cursor
    yPos.current += deltaY

    // Guardamos la velocidad instantánea para la inercia al soltar
    velocity.current = deltaY
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    isDragging.current = false
    setIsGrabbing(false)

    if ((e.target as HTMLElement).hasPointerCapture(e.pointerId)) {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    }

    // Al soltar, multiplicamos levemente la velocidad para un "flick" táctil más natural
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
          <div
            key={`${project._id}-${index}`}
            className={styles.projectRow}
          >
            {`project-${index % projects.length}`}
          </div>
        ))}
      </div>
    </div>
  )
}

export default InfiniteScrollVertical