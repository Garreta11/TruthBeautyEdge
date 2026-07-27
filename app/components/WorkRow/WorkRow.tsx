'use client'

import { useRef, useEffect, useState } from 'react'
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

// Video and iframe embeds are real network requests and browsing contexts —
// only mount them once the row is near the viewport (see WorkRow's
// IntersectionObserver); everything else stays a lightweight placeholder.
function MediaCell({ item, active }: { item: MediaItem; active: boolean }) {
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
          {active ? <VideoPlayer src={fileSrc} /> : <div className={styles.mediaPlaceholder} />}
        </div>
      )
    }

    if (externalSrc) {
      return (
        <div className={`${styles.cell} ${styles.cellEmbed}`}>
          {active && <iframe src={externalSrc} allowFullScreen title={item.caption ?? 'video'} />}
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
  // Per-frame velocity, in px. While isDragging is true, target is driven
  // directly by the gesture; once it ends, WorkScroll's rAF loop keeps
  // advancing target by velocity (decaying it each frame) for a momentum
  // coast instead of stopping dead.
  velocity: number
  isDragging: boolean
  // Width of one (non-duplicated) copy of the media strip, in px. Measured
  // via ResizeObserver instead of read every animation frame, since reading
  // scrollWidth forces the browser to recompute layout.
  width: number
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
  const rowRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const { openPanel } = usePanel()
  const [isNearViewport, setIsNearViewport] = useState(false)

  // Only mount real video/iframe media once the row is within (or close to)
  // the viewport — see MediaCell. rootMargin preloads slightly ahead so
  // media isn't visibly popping in mid-scroll.
  useEffect(() => {
    const row = rowRef.current
    if (!row) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      { rootMargin: '50% 0px' }
    )
    observer.observe(row)
    return () => observer.disconnect()
  }, [])

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
      existingState = { target: 0, current: 0, velocity: 0, isDragging: false, width: 0, tracks: new Set() }
      horizontalStates.set(project._id, existingState)
    }
    const state = existingState

    state.tracks.add(track)

    const resizeObserver = new ResizeObserver(() => {
      state.width = track.scrollWidth / 3
    })
    resizeObserver.observe(track)

    let wheelIdleTimeout: ReturnType<typeof setTimeout> | null = null

    function onWheel(e: WheelEvent) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      // Lenis listens on window in the bubble phase too — without this, it
      // still sees deltaY from this same event and scrolls the page
      // vertically while the row is being dragged horizontally.
      e.stopPropagation()
      state.target += e.deltaX
      state.velocity = e.deltaX
      state.isDragging = true

      if (wheelIdleTimeout) clearTimeout(wheelIdleTimeout)
      wheelIdleTimeout = setTimeout(() => {
        state.isDragging = false
      }, 150)
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

    // Passive — never calls preventDefault, so it can't block native
    // scrolling. Only used to spot the moment a gesture commits to the
    // horizontal axis; vertical gestures just fall through untouched, which
    // is what keeps them running smoothly on the compositor thread instead
    // of stalling on this JS on every tick.
    function onTouchMoveDetect(e: TouchEvent) {
      if (axisLock !== null) return

      const touch = e.touches[0]
      const dx = touch.clientX - lastX
      const dy = touch.clientY - lastY
      if (Math.abs(dx) < TOUCH_AXIS_THRESHOLD && Math.abs(dy) < TOUCH_AXIS_THRESHOLD) return

      axisLock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      if (axisLock !== 'x') return

      state.isDragging = true
      lastX = touch.clientX
      lastY = touch.clientY
      // Only now — once we know this gesture actually is a horizontal
      // drag — add the non-passive listener that can preventDefault/
      // stopPropagation for the rest of it.
      strip!.addEventListener('touchmove', onTouchMoveActive, { passive: false })
    }

    function onTouchMoveActive(e: TouchEvent) {
      const touch = e.touches[0]
      const dx = touch.clientX - lastX

      e.preventDefault()
      // Same reason as onWheel: stop this touchmove from reaching Lenis's
      // own window-level listener so it can't scroll the page while this
      // row is being dragged.
      e.stopPropagation()
      state.target -= dx
      // Light smoothing so the final, possibly tiny, sample before release
      // doesn't dominate the coast velocity.
      state.velocity = state.velocity * 0.7 - dx * 0.3
      lastX = touch.clientX
      lastY = touch.clientY
    }

    function onTouchEnd(e: TouchEvent) {
      // If Lenis picked up any vertical delta during the ambiguous first few
      // pixels before the axis locked horizontal, stop it here too so it
      // can't turn that into a release-momentum flick of the page.
      if (axisLock === 'x') {
        e.stopPropagation()
        strip!.removeEventListener('touchmove', onTouchMoveActive)
      }
      axisLock = null
      state.isDragging = false
    }

    strip.addEventListener('wheel', onWheel, { passive: false })
    strip.addEventListener('touchstart', onTouchStart, { passive: true })
    strip.addEventListener('touchmove', onTouchMoveDetect, { passive: true })
    strip.addEventListener('touchend', onTouchEnd, { passive: true })
    strip.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      if (wheelIdleTimeout) clearTimeout(wheelIdleTimeout)
      resizeObserver.disconnect()
      state.tracks.delete(track)
      strip.removeEventListener('wheel', onWheel)
      strip.removeEventListener('touchstart', onTouchStart)
      strip.removeEventListener('touchmove', onTouchMoveDetect)
      strip.removeEventListener('touchmove', onTouchMoveActive)
      strip.removeEventListener('touchend', onTouchEnd)
      strip.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [project._id, horizontalStates])

  return (
    <div
      data-work-row
      ref={rowRef}
      className={`${styles.row} ${openPanel ? styles.locked : ''}`}
      onMouseEnter={(e) => pauseVideoOutside(e.currentTarget)}
    >
      <div className={styles.strip} ref={stripRef}>
        <div className={styles.track} ref={trackRef}>
          {[0, 1, 2].map((copy) =>
            project.media?.map((item) => (
              <MediaCell key={`${item._key}-${copy}`} item={item} active={isNearViewport} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
