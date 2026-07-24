'use client'

import { useRef, useEffect } from 'react'
import { PortableText, PortableTextComponents } from '@portabletext/react'
import type { OldProject, MediaItem } from '@/sanity/lib/types'
import { urlFor } from '@/sanity/lib/image'
import { usePanel } from '@/app/context/PanelContext'
import VideoPlayer, { pauseVideoOutside } from '@/app/components/VideoPlayer/VideoPlayer'
import styles from './WorkRow.module.scss'


const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => <h1>{children}</h1>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    h4: ({ children }) => <h4>{children}</h4>,
    normal: ({ children }) => <p>{children}</p>,
    blockquote: ({ children }) => (
      <blockquote>{children}</blockquote>
    ),
  },
  marks: {
    link: ({ children, value }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
}

function MediaCell({ item }: { item: MediaItem }) {
  if (item._type === 'mediaImage') {
    // Rows display at up to ~100dvh/2 tall — request roughly that size (at 2x
    // for retina) instead of the original upload, and let Sanity serve
    // WebP/AVIF where supported.
    const src = urlFor(item.image).height(1200).auto('format').quality(75).url()
    return (
      <div className={styles.cell}>
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
        <div className={styles.cell}>
          <VideoPlayer src={fileSrc} />
        </div>
      )
    }

    if (externalSrc) {
      return (
        <div className={`${styles.cell} ${styles.cellEmbed}`}>
          <iframe src={externalSrc} allowFullScreen title={item.caption ?? 'video'} />
        </div>
      )
    }

    return null
  }

  if (item._type === 'mediaText') {
    return (
      <div className={`${styles.cell} ${styles.cellText}`}>
        <div className={styles.cellContainer}>
          <PortableText value={item.body as Parameters<typeof PortableText>[0]['value']} components={components} />
        </div>
      </div>
    )
  }

  return null
}

// A row's horizontal position is virtual (no native scrollLeft at all), so
// the original and duplicated copy of the same project (see WorkScroll's
// duplicated rows for the vertical loop) share one state object and stay in
// sync automatically instead of needing to mirror a DOM scroll position.
export type HorizontalScrollState = {
  target: number
  current: number
  tracks: Set<HTMLDivElement>
}
export type HorizontalScrollStates = Map<string, HorizontalScrollState>

interface Props {
  project: OldProject
  horizontalStates?: HorizontalScrollStates
}

// Below this, a touch gesture hasn't shown clear intent yet — keep reading
// movement before locking it to the horizontal or vertical axis.
const TOUCH_AXIS_THRESHOLD = 4

export default function WorkRow({ project, horizontalStates }: Props) {
  const stripRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const { openPanel } = usePanel()

  // Register this row's track into the shared state (rendered by
  // WorkScroll's single rAF loop) and wire up axis-dominant gesture capture:
  // horizontal wheel/drag moves the row and blocks page scroll for that
  // gesture; vertical movement is left alone so the page scrolls normally.
  useEffect(() => {
    const strip = stripRef.current
    const track = trackRef.current
    if (!strip || !track || !horizontalStates) return

    let existingState = horizontalStates.get(project._id)
    if (!existingState) {
      existingState = { target: 0, current: 0, tracks: new Set() }
      horizontalStates.set(project._id, existingState)
    }
    const state = existingState

    state.tracks.add(track)

    function onWheel(e: WheelEvent) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      state.target += e.deltaX
    }

    let axisLock: 'x' | 'y' | null = null
    let lastX = 0
    let lastY = 0

    function onTouchStart(e: TouchEvent) {
      const touch = e.touches[0]
      lastX = touch.clientX
      lastY = touch.clientY
      axisLock = null
    }

    function onTouchMove(e: TouchEvent) {
      const touch = e.touches[0]
      const dx = touch.clientX - lastX
      const dy = touch.clientY - lastY

      if (axisLock === null) {
        if (Math.abs(dx) < TOUCH_AXIS_THRESHOLD && Math.abs(dy) < TOUCH_AXIS_THRESHOLD) return
        axisLock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      }

      if (axisLock !== 'x') return

      e.preventDefault()
      state.target -= dx
      lastX = touch.clientX
      lastY = touch.clientY
    }

    function onTouchEnd() {
      axisLock = null
    }

    strip.addEventListener('wheel', onWheel, { passive: false })
    strip.addEventListener('touchstart', onTouchStart, { passive: true })
    strip.addEventListener('touchmove', onTouchMove, { passive: false })
    strip.addEventListener('touchend', onTouchEnd, { passive: true })
    strip.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      state.tracks.delete(track)
      strip.removeEventListener('wheel', onWheel)
      strip.removeEventListener('touchstart', onTouchStart)
      strip.removeEventListener('touchmove', onTouchMove)
      strip.removeEventListener('touchend', onTouchEnd)
      strip.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [project._id, horizontalStates])

  return (
    <div
      data-work-row
      className={`${styles.row} ${openPanel ? styles.locked : ''}`}
      onMouseEnter={(e) => pauseVideoOutside(e.currentTarget)}
    >
      <div className={styles.strip} ref={stripRef}>
        <div className={styles.track} ref={trackRef}>
          {[0, 1, 2].map((copy) =>
            project.media?.map((item) => (
              <MediaCell key={`${item._key}-${copy}`} item={item} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
