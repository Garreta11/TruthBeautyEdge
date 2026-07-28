'use client'

import { useEffect, useRef, useState } from 'react'
import { PortableText, PortableTextComponents } from '@portabletext/react'
import type { MediaItem } from '@/sanity/lib/types'
import { urlFor } from '@/sanity/lib/image'
import VideoPlayer, { pauseVideoOutside } from '@/app/components/VideoPlayer/VideoPlayer'
import styles from './InfiniteScrollHorizontal.module.scss'

interface Props {
  projectId: string // _id único del proyecto para sincronizar copias
  media: MediaItem[]
  friction?: number
}

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => <h1>{children}</h1>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    h4: ({ children }) => <h4>{children}</h4>,
    normal: ({ children }) => <p>{children}</p>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  marks: {
    link: ({ children, value }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
}

// Same media dispatch as WorkRow's MediaCell (image/video/text), sized to
// fill the strip's height instead of a fixed row height.
function MediaCell({ item, active }: { item: MediaItem; active: boolean }) {
  if (item._type === 'mediaImage') {
    const src = urlFor(item.image).height(1200).auto('format').quality(75).url()
    return (
      <div className={styles.imageBlock}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={item.alt ?? ''} loading="lazy" />
      </div>
    )
  }

  if (item._type === 'mediaVideo') {
    const fileSrc = item.file?.asset?.url
    const externalSrc = item.url

    if (fileSrc) {
      return (
        <div className={styles.imageBlock}>
          {active ? <VideoPlayer src={fileSrc} /> : <div className={styles.mediaPlaceholder} />}
        </div>
      )
    }

    if (externalSrc) {
      return (
        <div className={`${styles.imageBlock} ${styles.imageBlockEmbed}`}>
          {active && <iframe src={externalSrc} allowFullScreen title={item.caption ?? 'video'} />}
        </div>
      )
    }

    return null
  }

  if (item._type === 'mediaText') {
    return (
      <div className={`${styles.imageBlock} ${styles.imageBlockText}`}>
        <div className={styles.textContainer}>
          <PortableText value={item.body as Parameters<typeof PortableText>[0]['value']} components={components} />
        </div>
      </div>
    )
  }

  return null
}

// Registro en memoria compartido para sincronizar la X de proyectos duplicados
const sharedPositions = new Map<string, number>()

const InfiniteScrollHorizontal = ({
  projectId,
  media,
  friction = 0.93,
}: Props) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isNearViewport, setIsNearViewport] = useState(false)

  const duplicatedItems = [...media, ...media]

  // Only mount real video/iframe media once the strip is near the viewport —
  // same idea as WorkRow's IntersectionObserver.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      { rootMargin: '50% 0px' }
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

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
      ref={containerRef}
      className={`${styles.horizontalContainer} ${isGrabbing ? styles.isGrabbing : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={(e) => pauseVideoOutside(e.currentTarget)}
    >
      <div ref={trackRef} className={styles.horizontalTrack}>
        {duplicatedItems.map((item, index) => (
          <MediaCell key={`${item._key}-${index}`} item={item} active={isNearViewport} />
        ))}
      </div>
    </div>
  )
}

export default InfiniteScrollHorizontal