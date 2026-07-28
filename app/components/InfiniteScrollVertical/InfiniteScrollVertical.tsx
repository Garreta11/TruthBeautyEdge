"use client"

import type { OldProject } from '@/sanity/lib/types'
import { useEffect, useRef } from 'react'
import styles from './InfiniteScrollVertical.module.scss'

interface Props {
  projects: OldProject[]
}

const InfiniteScrollVertical = ({ projects }: Props) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const duplicatedProjects = [...projects, ...projects]

  // Mantendremos el estado del scroll en refs para evitar re-renders en React
  const yPos = useRef(0)
  const velocity = useRef(0)
  const isHovered = useRef(false)

  const speed = 1

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let animationFrameId: number

    // Bucle principal de renderizado
    const updatePosition = () => {
      // 1. Si no está en hover, sumamos la velocidad base automática
      if (!isHovered.current) {
        yPos.current += speed
      }

      // 2. Sumamos el impulso de la rueda del ratón (inercia)
      yPos.current += velocity.current

      // 3. Aplicamos fricción/desaceleración suave al scroll manual
      velocity.current *= 0.92

      // Si la velocidad manual es muy pequeña, la redondeamos a 0
      if (Math.abs(velocity.current) < 0.01) {
        velocity.current = 0
      }

      // 4. Calculamos el límite de reinicio del loop (-50% del contenedor)
      const halfHeight = track.scrollHeight / 2

      // Mantenemos yPos dentro del rango [0, halfHeight] para el bucle continuo
      if (yPos.current >= halfHeight) {
        yPos.current -= halfHeight
      } else if (yPos.current < 0) {
        yPos.current += halfHeight
      }

      // 5. Aplicamos la transformación CSS de manera eficiente
      track.style.transform = `translateY(-${yPos.current}px)`

      animationFrameId = requestAnimationFrame(updatePosition)
    }

    // Listener para la rueda del ratón
    const handleWheel = (e: WheelEvent) => {
      // Prevenimos el scroll estándar del navegador dentro de este componente
      e.preventDefault()
      // Sensibilidad del scroll manual
      velocity.current += e.deltaY * 0.4
    }

    // Asignamos eventos pasivos: false para poder usar e.preventDefault()
    track.addEventListener('wheel', handleWheel, { passive: false })
    animationFrameId = requestAnimationFrame(updatePosition)

    return () => {
      track.removeEventListener('wheel', handleWheel)
      cancelAnimationFrame(animationFrameId)
    }
  }, [speed])

  return (
    <div
      className={styles.scrollContainer}
      onMouseEnter={() => (isHovered.current = true)}
      onMouseLeave={() => (isHovered.current = false)}
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