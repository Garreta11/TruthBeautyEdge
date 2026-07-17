'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import styles from './VideoPlayer.module.scss'

gsap.registerPlugin(Flip)

// Shared across every VideoPlayer instance so only one can ever be playing at once.
let currentlyPlaying: HTMLVideoElement | null = null

// Pauses the currently-playing video if it isn't inside the given container —
// used to stop playback when the user's attention moves to another project row.
// Skipped while that video is expanded, since it should keep playing regardless
// of which row the pointer is over.
export function pauseVideoOutside(container: Element | null) {
  if (!currentlyPlaying) return
  if (container && container.contains(currentlyPlaying)) return

  const player = currentlyPlaying.closest('[data-expanded]')
  if (player?.getAttribute('data-expanded') === 'true') return

  currentlyPlaying.pause()
}

interface Props {
  src: string
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function VideoPlayer({ src }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [overControls, setOverControls] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const flipStateRef = useRef<Flip.FlipState | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    function handleTimeUpdate() {
      setCurrentTime(video!.currentTime)
    }
    function handleLoadedMetadata() {
      setDuration(video!.duration)
    }
    function handlePlay() {
      setIsPlaying(true)
      if (currentlyPlaying && currentlyPlaying !== video) {
        currentlyPlaying.pause()
      }
      currentlyPlaying = video
    }
    function handlePause() {
      setIsPlaying(false)
      if (currentlyPlaying === video) {
        currentlyPlaying = null
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    // Metadata may have already loaded before this effect attached its listener
    if (video.readyState >= 1) {
      handleLoadedMetadata()
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [])

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current
    if (!video) return
    const time = Number(e.target.value)
    video.currentTime = time
    setCurrentTime(time)
  }

  function toggleExpand() {
    const el = containerRef.current
    if (!el) return
    flipStateRef.current = Flip.getState(el)
    setExpanded((v) => !v)
  }

  // Runs after React has committed the class change (and thus the new
  // layout) but before the browser paints, so Flip can animate from the
  // captured pre-change state to the now-current one.
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el || !flipStateRef.current) return
    Flip.from(flipStateRef.current, { duration: 1, ease: 'power2.inOut', absolute: true })
    flipStateRef.current = null
  }, [expanded])

  useEffect(() => {
    if (!expanded) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        toggleExpand()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [expanded])

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const cursor = cursorRef.current
    if (!cursor) return
    const rect = e.currentTarget.getBoundingClientRect()
    cursor.style.left = `${e.clientX - rect.left}px`
    cursor.style.top = `${e.clientY - rect.top}px`
  }

  return (
    <>
      {expanded && <div className={styles.overlay} onClick={toggleExpand} />}
      <div
        className={`${styles.player} ${expanded ? styles.expanded : ''}`}
        data-expanded={expanded}
        ref={containerRef}
        onClick={togglePlay}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={handleMouseMove}
      >
        <video ref={videoRef} src={src} autoPlay={false} loop muted={muted} playsInline preload="metadata" />

      <div ref={cursorRef} className={`${styles.playCursor} ${hovering && !overControls ? styles.visible : ''}`}>
        {isPlaying ? (
          <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="4" height="16" fill="white" opacity="0.24" />
            <rect x="10" width="4" height="16" fill="white" opacity="0.24" />
          </svg>
        ) : (
          <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L14 8L0 16V0Z" fill="white" opacity="0.24" />
          </svg>
        )}
      </div>

      <p
        className={`${styles.volume} ${!muted ? styles.active : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          setMuted((m) => !m)
        }}
      >
        Volume
      </p>

      <div
        className={styles.controls}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setOverControls(true)}
        onMouseLeave={() => setOverControls(false)}
      >
        <div>
        <p className={styles.time}>{formatTime(currentTime)} / {formatTime(duration)}</p>
        </div>
        <div className={styles.trackWrapper}>
          <div className={styles.trackBase} />
          <div
            className={styles.trackProgress}
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
          <input
            type="range"
            className={styles.track}
            min={0}
            max={duration || 0}
            step={0.01}
            value={currentTime}
            onChange={handleSeek}
          />
        </div>

        <button className={styles.fullscreen} onClick={toggleExpand} aria-label="Expand">

        </button>
      </div>
      </div>
    </>
  )
}
