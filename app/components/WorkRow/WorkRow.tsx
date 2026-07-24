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

interface Props {
  project: OldProject
}

export default function WorkRow({ project }: Props) {
  const stripRef = useRef<HTMLDivElement>(null)
  const isTouchingRef = useRef(false)
  const { openPanel } = usePanel()

  useEffect(() => {
    const el = stripRef.current
    if (!el) return
    // Start at the middle copy so both scroll directions work
    el.scrollLeft = el.scrollWidth / 3
  }, [])

  // Resetting scrollLeft while a touch gesture is still active makes Safari
  // abandon it and the container stops responding to touch entirely, so the
  // boundary correction below is skipped mid-touch and re-run on touchend.
  useEffect(() => {
    const el = stripRef.current
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

  function handleScroll() {
    const el = stripRef.current
    if (!el) return
    if (isTouchingRef.current) return
    const setWidth = el.scrollWidth / 3
    if (el.scrollLeft < 2) {
      el.scrollLeft = setWidth
    } else if (el.scrollLeft > setWidth * 2 - 2) {
      el.scrollLeft = setWidth
    }
  }

  return (
    <div
      data-work-row
      className={`${styles.row} ${openPanel ? styles.locked : ''}`}
      onMouseEnter={(e) => pauseVideoOutside(e.currentTarget)}
    >
      <div className={styles.strip} ref={stripRef} onScroll={handleScroll}>
        {[0, 1, 2].map((copy) =>
          project.media?.map((item) => (
            <MediaCell key={`${item._key}-${copy}`} item={item} />
          ))
        )}
      </div>
    </div>
  )
}
