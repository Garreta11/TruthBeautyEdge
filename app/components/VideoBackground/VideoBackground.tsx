'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useWorkAccess } from '@/app/context/WorkAccessContext'
import { usePanel } from '@/app/context/PanelContext'
import styles from './VideoBackground.module.scss'

interface Props {
  url: string
}

export default function VideoBackground({ url }: Props) {
  const [muted, setMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const pathname = usePathname()
  const unlocked = useWorkAccess()
  const { openPanel, setOpenPanel } = usePanel()
  const isWorkUnlocked = pathname === '/work' && unlocked
  const isHome = pathname === '/'

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
    if (isHome && openPanel) {
      setOpenPanel(null)
    }
  }

  return (
    <>
      <div className={styles.wrapper}>
        <video
          ref={videoRef}
          className={styles.video}
          data-video-bg
          src={url}
          autoPlay
          loop
          muted={muted}
          playsInline
        />
      </div>
      <div className={styles.clickCatcher} onClick={handleVideoClick} />
      <p
        className={`${styles.volume} ${!muted ? styles.active : ''} ${isWorkUnlocked ? styles.hidden : ''}`}
        onClick={() => setMuted((m) => !m)}
      >
        Volume
      </p>
    </>
  )
}
