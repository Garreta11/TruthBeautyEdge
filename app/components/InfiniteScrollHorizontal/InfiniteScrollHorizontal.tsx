'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './InfiniteScrollHorizontal.module.scss'

interface Props {
  projectId: string // _id único del proyecto para sincronizar copias
  projectIndex: number
  itemCount?: number
  friction?: number
}

const getColor = (index: number) => {
  const hue = (index * 137.5) % 360
  return `hsl(${hue}, 65%, 55%)`
}

const widths = ['250px', '450px', '300px', '500px', '200px', '380px']

// Registro en memoria compartido para sincronizar la X de proyectos duplicados
const sharedPositions = new Map<string, number>()

const InfiniteScrollHorizontal = ({
  projectId,
  projectIndex,
  itemCount = 8,
  friction = 0.93,
}: Props) => {
  const trackRef = useRef<HTMLDivElement>(null)

  const items = Array.from({ length: itemCount }, (_, i) => ({
    id: i,
    color: getColor(projectIndex * 10 + i),
    width: widths[i % widths.length],
  }))

  const duplicatedItems = [...items, ...items]

  // Inicializamos la posición recuperando el valor compartido (si existe)
  const xPos = useRef(sharedPositions.get(projectId) || 0)
  const velocity = useRef(0)

  const isDragging = useRef(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const lastX = useRef(0)
  const dragDirection = useRef<'horizontal' | 'vertical' | null>(null)

  const [isGrabbing, setIsGrabbing] = useState(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let animationFrameId: number

    const updatePhysics = () => {
      // 1. Si no estamos arrastrando este elemento directamente, leemos la posición global
      // Esto actualiza instantáneamente los duplicados mientras mueves el original (y viceversa)
      if (!isDragging.current) {
        xPos.current += velocity.current
        velocity.current *= friction

        if (Math.abs(velocity.current) < 0.01) {
          velocity.current = 0
        }

        // Si hay una posición sincronizada por otro duplicado activo, la leemos
        const sharedX = sharedPositions.get(projectId)
        if (sharedX !== undefined && velocity.current === 0) {
          xPos.current = sharedX
        }
      }

      // 2. Loop infinito continuo
      const halfWidth = track.scrollWidth / 2

      if (xPos.current >= halfWidth) {
        xPos.current -= halfWidth
      } else if (xPos.current < 0) {
        xPos.current += halfWidth
      }

      // 3. Guardamos siempre la posición actual en la referencia global
      sharedPositions.set(projectId, xPos.current)

      // 4. Renderizamos en GPU
      track.style.transform = `translateX(-${xPos.current}px)`

      animationFrameId = requestAnimationFrame(updatePhysics)
    }

    const handleWheel = (e: WheelEvent) => {
      const isHorizontalScroll = Math.abs(e.deltaX) > Math.abs(e.deltaY)

      if (isHorizontalScroll) {
        e.preventDefault()
        e.stopPropagation()
        velocity.current += e.deltaX * 0.3
      }
    }

    track.addEventListener('wheel', handleWheel, { passive: false })
    animationFrameId = requestAnimationFrame(updatePhysics)

    return () => {
      track.removeEventListener('wheel', handleWheel)
      cancelAnimationFrame(animationFrameId)
    }
  }, [friction, projectId])

  // --- ARRASTRE Y TOUCH ---

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    dragDirection.current = null
    
    startX.current = e.clientX
    startY.current = e.clientY
    lastX.current = e.clientX

    velocity.current = 0
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return

    const deltaXFromStart = Math.abs(e.clientX - startX.current)
    const deltaYFromStart = Math.abs(e.clientY - startY.current)

    if (!dragDirection.current) {
      if (deltaXFromStart > 5 || deltaYFromStart > 5) {
        if (deltaXFromStart > deltaYFromStart) {
          dragDirection.current = 'horizontal'
          setIsGrabbing(true)
          ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        } else {
          dragDirection.current = 'vertical'
          isDragging.current = false
          return
        }
      } else {
        return
      }
    }

    if (dragDirection.current === 'vertical') return

    e.stopPropagation()

    const deltaX = lastX.current - e.clientX
    lastX.current = e.clientX

    xPos.current += deltaX
    velocity.current = deltaX

    // Actualizamos la posición compartida en tiempo real durante el drag
    sharedPositions.set(projectId, xPos.current)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current && dragDirection.current !== 'horizontal') return

    isDragging.current = false
    setIsGrabbing(false)

    if ((e.target as HTMLElement).hasPointerCapture(e.pointerId)) {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    }

    if (dragDirection.current === 'horizontal') {
      velocity.current *= 1.2
    }

    dragDirection.current = null
  }

  return (
    <div
      className={`${styles.horizontalContainer} ${isGrabbing ? styles.isGrabbing : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div ref={trackRef} className={styles.horizontalTrack}>
        {duplicatedItems.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className={styles.imageBlock}
            style={{
              backgroundColor: item.color,
              width: item.width,
            }}
          >
            <span>{`Img ${item.id + 1}`}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InfiniteScrollHorizontal