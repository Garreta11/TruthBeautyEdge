'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useWorkAccess } from '@/app/context/WorkAccessContext'
import { usePanel } from '@/app/context/PanelContext'
import styles from './VideoBackground.module.scss'

const MOBILE_QUERY = '(max-width: 768px)'
const VOLUME_FADE_MS = 1500

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
  const fadeFrameRef = useRef<number | null>(null)
  const muteFadeFrameRef = useRef<number | null>(null)
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

    if (fadeFrameRef.current !== null) {
      cancelAnimationFrame(fadeFrameRef.current)
      fadeFrameRef.current = null
    }

    if (isWorkUnlocked) {
      if (video.muted || video.paused) {
        video.volume = 1
        video.pause()
        return
      }
      let startTime: number | null = null
      const step = (now: number) => {
        if (startTime === null) startTime = now
        const t = Math.min((now - startTime) / VOLUME_FADE_MS, 1)
        video.volume = 1 - t
        if (t < 1) {
          fadeFrameRef.current = requestAnimationFrame(step)
        } else {
          video.pause()
          video.volume = 1
          fadeFrameRef.current = null
        }
      }
      fadeFrameRef.current = requestAnimationFrame(step)
    } else {
      video.volume = 1
      video.play().catch(() => {})
    }

    return () => {
      if (fadeFrameRef.current !== null) {
        cancelAnimationFrame(fadeFrameRef.current)
        fadeFrameRef.current = null
      }
    }
  }, [isWorkUnlocked, videoUrl])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (muteFadeFrameRef.current !== null) {
      cancelAnimationFrame(muteFadeFrameRef.current)
      muteFadeFrameRef.current = null
    }

    let startTime: number | null = null

    if (muted) {
      if (video.muted) return
      const from = video.volume
      const step = (now: number) => {
        if (startTime === null) startTime = now
        const t = Math.min((now - startTime) / VOLUME_FADE_MS, 1)
        video.volume = from * (1 - t)
        if (t < 1) {
          muteFadeFrameRef.current = requestAnimationFrame(step)
        } else {
          video.muted = true
          video.volume = 1
          muteFadeFrameRef.current = null
        }
      }
      muteFadeFrameRef.current = requestAnimationFrame(step)
    } else {
      video.muted = false
      video.volume = 0
      const step = (now: number) => {
        if (startTime === null) startTime = now
        const t = Math.min((now - startTime) / VOLUME_FADE_MS, 1)
        video.volume = t
        if (t < 1) {
          muteFadeFrameRef.current = requestAnimationFrame(step)
        } else {
          muteFadeFrameRef.current = null
        }
      }
      muteFadeFrameRef.current = requestAnimationFrame(step)
    }

    return () => {
      if (muteFadeFrameRef.current !== null) {
        cancelAnimationFrame(muteFadeFrameRef.current)
        muteFadeFrameRef.current = null
      }
    }
  }, [muted])

  function handleVideoClick() {
    if ((isHome || isWorkLocked) && openPanel) {
      setOpenPanel(null)
    }
  }

  /* if (isWorkUnlocked) return null */

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
          muted
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
      {!isWorkUnlocked && (
        <p
          className={`${styles.volume} ${!muted ? styles.active : ""}`}
          onClick={() => setMuted((m) => !m)}
          data-video-volume
        >
          Sound
        </p>
      )}
    </>
  )
}
