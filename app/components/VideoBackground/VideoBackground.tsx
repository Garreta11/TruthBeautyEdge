'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useWorkAccess } from '@/app/context/WorkAccessContext'
import { usePanel } from '@/app/context/PanelContext'
import styles from './VideoBackground.module.scss'

interface Props {
  url: string
  infoImageUrl?: string
}

export default function VideoBackground({ url, infoImageUrl }: Props) {
  const [muted, setMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const pathname = usePathname()
  const { unlocked } = useWorkAccess()
  const { openPanel, setOpenPanel } = usePanel()
  const isWork = pathname === '/work'
  const isWorkUnlocked = isWork && unlocked
  const isHome = pathname === '/'
  const isWorkLocked = isWork && !unlocked

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (isWorkUnlocked) {
      video.pause()
    } else {
      video.play().catch(() => {})
    }
  }, [isWorkUnlocked])

  function handleVideoClick() {
    if ((isHome || isWorkLocked) && openPanel) {
      setOpenPanel(null)
    }
  }

  return (
    <>
      <div className={`${styles.wrapper} ${isWork ? styles.aboveWork : ''}`}>
        <video
          ref={videoRef}
          className={styles.video}
          data-video-bg
          src={url}
          autoPlay
          loop
          muted={muted}
          playsInline
          preload="metadata"
        />
        {infoImageUrl && (
          <img
            className={`${styles.infoImage} ${openPanel === 'info' ? styles.visible : ''}`}
            src={infoImageUrl}
            alt=""
          />
        )}
      </div>
      <div className={styles.clickCatcher} onClick={handleVideoClick} />
      <p
        className={`${styles.volume} ${!muted ? styles.active : ""} ${isWorkUnlocked ? styles.hidden : ''}`}
        onClick={() => setMuted((m) => !m)}
        data-video-volume
      >
        Volume
      </p>
    </>
  )
}
