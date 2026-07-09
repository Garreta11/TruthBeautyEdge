'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './VideoPlayer.module.scss'

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
  const [muted, setMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    function handleTimeUpdate() {
      setCurrentTime(video!.currentTime)
    }
    function handleLoadedMetadata() {
      setDuration(video!.duration)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)

    // Metadata may have already loaded before this effect attached its listener
    if (video.readyState >= 1) {
      handleLoadedMetadata()
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [])

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current
    if (!video) return
    const time = Number(e.target.value)
    video.currentTime = time
    setCurrentTime(time)
  }

  function handleFullscreen() {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      el.requestFullscreen()
    }
  }

  return (
    <div className={styles.player} ref={containerRef}>
      <video ref={videoRef} src={src} autoPlay loop muted={muted} playsInline />

      <p
        className={`${styles.volume} ${!muted ? styles.active : ''}`}
        onClick={() => setMuted((m) => !m)}
      >
        Volume
      </p>

      <div className={styles.controls}>
        <div>
        <span className={styles.time}>{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
        <input
          type="range"
          className={styles.track}
          min={0}
          max={duration || 0}
          step={0.01}
          value={currentTime}
          onChange={handleSeek}
        />
        
        <button className={styles.fullscreen} onClick={handleFullscreen} aria-label="Fullscreen">
          
        </button>
      </div>
    </div>
  )
}
