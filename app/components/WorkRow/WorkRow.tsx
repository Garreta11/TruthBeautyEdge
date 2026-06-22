'use client'

import { useRef, useEffect } from 'react'
import { PortableText } from '@portabletext/react'
import type { OldProject, MediaItem } from '@/sanity/lib/types'
import { urlFor } from '@/sanity/lib/image'
import styles from './WorkRow.module.scss'

function MediaCell({ item }: { item: MediaItem }) {
  if (item._type === 'mediaImage') {
    const src = urlFor(item.image).url()
    return (
      <div className={styles.cell}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={item.alt ?? ''} />
      </div>
    )
  }

  if (item._type === 'mediaVideo') {
    const fileSrc = item.file?.asset?.url
    const externalSrc = item.url

    if (fileSrc) {
      return (
        <div className={styles.cell}>
          <video src={fileSrc} autoPlay muted loop playsInline />
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
          <PortableText value={item.body} />
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

  useEffect(() => {
    const el = stripRef.current
    if (!el) return
    // Start at the middle copy so both scroll directions work
    el.scrollLeft = el.scrollWidth / 3
  }, [])

  function handleScroll() {
    const el = stripRef.current
    if (!el) return
    const setWidth = el.scrollWidth / 3
    if (el.scrollLeft < 2) {
      el.scrollLeft = setWidth
    } else if (el.scrollLeft > setWidth * 2 - 2) {
      el.scrollLeft = setWidth
    }
  }

  return (
    <div className={styles.row}>
      <div className={styles.strip} ref={stripRef} onScroll={handleScroll} data-lenis-prevent>
        {[0, 1, 2].map((copy) =>
          project.media?.map((item) => (
            <MediaCell key={`${item._key}-${copy}`} item={item} />
          ))
        )}
      </div>
    </div>
  )
}
