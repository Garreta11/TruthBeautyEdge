'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useWorkAccess } from '@/app/context/WorkAccessContext'
import { usePanel } from '@/app/context/PanelContext'
import styles from './VideoBackground.module.scss'

const MOBILE_QUERY = '(max-width: 768px)'

interface Props {
  url: string
  mobileUrl?: string
  infoImageUrl?: string
  mobileInfoImageUrl?: string
}

export default function VideoBackground({ url, mobileUrl, infoImageUrl, mobileInfoImageUrl }: Props) {
  const [muted, setMuted] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const pathname = usePathname()
  const { unlocked } = useWorkAccess()
  const { openPanel, setOpenPanel } = usePanel()
  const isWork = pathname === '/work'
  const isWorkUnlocked = isWork && unlocked
  const isHome = pathname === '/'
  const isWorkLocked = isWork && !unlocked
  // The catcher only ever needs to do something when it can actually close a
  // panel — everywhere else it must stay click-through, or it silently
  // swallows every touch/click/scroll gesture on the page (it's a
  // position: fixed, full-viewport sibling of <main>, so it paints above
  // WorkScroll/WorkRow's plain in-flow content regardless of DOM order).
  const catchesClicks = (isHome || isWorkLocked) && Boolean(openPanel)

  const videoUrl = isMobile && mobileUrl ? mobileUrl : url
  const imageUrl = isMobile && mobileInfoImageUrl ? mobileInfoImageUrl : infoImageUrl

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY)
    setIsMobile(mediaQuery.matches)
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (isWorkUnlocked) {
      video.pause()
    } else {
      video.play().catch(() => {})
    }
  }, [isWorkUnlocked, videoUrl])

  function handleVideoClick() {
    if ((isHome || isWorkLocked) && openPanel) {
      setOpenPanel(null)
    }
  }

  if (isWorkUnlocked) return null

  return (
    <>
      <div className={`${styles.wrapper} ${isWork ? styles.aboveWork : ''}`}>
        <video
          ref={videoRef}
          className={styles.video}
          data-video-bg
          src={videoUrl}
          autoPlay
          loop
          muted={muted}
          playsInline
          preload="metadata"
        />
        {imageUrl && (
          <img
            className={`${styles.infoImage} ${openPanel === 'info' ? styles.visible : ''}`}
            src={imageUrl}
            alt=""
          />
        )}
      </div>
      <div
        className={`${styles.clickCatcher} ${catchesClicks ? styles.active : ''}`}
        onClick={handleVideoClick}
      />
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
