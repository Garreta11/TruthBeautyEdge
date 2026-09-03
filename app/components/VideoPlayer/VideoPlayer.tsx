'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import styles from './VideoPlayer.module.scss'

gsap.registerPlugin(Flip)

const MOBILE_QUERY = '(max-width: 768px)'

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
  // Where the player renders when collapsed, in its normal spot in the
  // scrolling strip — display: contents (see the .anchor rule) so it's
  // invisible to layout and doesn't affect the strip's sizing.
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // A callback-ref-backed state (like anchorEl above) instead of a plain
  // ref: the listener effect below needs to re-run whenever the actual
  // <video> node changes, and a plain ref wouldn't notify it of that.
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [overControls, setOverControls] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const flipStateRef = useRef<Flip.FlipState | null>(null)
  // Tracks whether this specific video is the one currently in device
  // fullscreen, so the fullscreenchange listener knows to pause it on exit
  // without reacting to some other VideoPlayer's fullscreen change.
  const enteredFullscreenRef = useRef(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY)
    setIsMobile(mediaQuery.matches)
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Reports raw hover/controls/playback state to the global CustomCursor,
  // which owns all the logic for how that translates into what's shown —
  // this component just describes what's happening, not how to render it.
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('video-hover', { detail: { hovering, overControls, playing: isPlaying } })
    )
  }, [hovering, overControls, isPlaying])

  // Safety net: if this player unmounts while still hovered (e.g. the row
  // it's in gets removed), make sure the CustomCursor isn't left hidden.
  useEffect(() => {
    return () => {
      window.dispatchEvent(
        new CustomEvent('video-hover', { detail: { hovering: false, overControls: false, playing: false } })
      )
    }
  }, [])

  useEffect(() => {
    const video = videoEl
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

    // Device fullscreen exit should pause playback rather than leaving the
    // video running behind the now-collapsed inline player. iOS's native
    // video fullscreen fires webkitendfullscreen directly on the video;
    // everywhere else the standard Fullscreen API fires fullscreenchange on
    // the document, so guard that one with enteredFullscreenRef to avoid
    // pausing this video in response to some other video's fullscreen change.
    function handleWebkitEndFullscreen() {
      enteredFullscreenRef.current = false
      video!.pause()
    }
    function handleFullscreenChange() {
      if (!enteredFullscreenRef.current) return
      if (document.fullscreenElement === video) return
      enteredFullscreenRef.current = false
      video!.pause()
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('webkitendfullscreen', handleWebkitEndFullscreen)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    // Metadata may have already loaded before this effect attached its listener
    if (video.readyState >= 1) {
      handleLoadedMetadata()
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('webkitendfullscreen', handleWebkitEndFullscreen)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
    // Depends on the actual <video> node (via the videoEl callback ref)
    // rather than running once on mount — the node is portaled between
    // containers on expand/collapse, and this must reattach to whichever
    // node is actually live instead of assuming it never changes.
  }, [videoEl])

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const video = videoEl
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
    const video = videoEl
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  // On mobile, tapping the video hands playback to the device's native
  // fullscreen video player instead of toggling play inline — just the
  // <video> itself, not the surrounding player/controls. iOS Safari has no
  // generic element Fullscreen API for this; only the video's own
  // webkitEnterFullscreen opens its native fullscreen UI.
  function handlePlayerClick() {
    const video = videoEl
    if (!video) return

    if (!isMobile) {
      togglePlay()
      return
    }

    const iosVideo = video as HTMLVideoElement & { webkitEnterFullscreen?: () => void }
    if (typeof iosVideo.webkitEnterFullscreen === 'function') {
      enteredFullscreenRef.current = true
      iosVideo.webkitEnterFullscreen()
    } else if (video.requestFullscreen) {
      enteredFullscreenRef.current = true
      video.requestFullscreen().catch(() => {
        enteredFullscreenRef.current = false
      })
    }

    if (video.paused) {
      video.play().catch(() => {})
    }
  }

  const player = (
    <>
      {expanded && <div className={styles.overlay} onClick={toggleExpand} />}
      <div
        className={`${styles.player} ${expanded ? styles.expanded : ''}`}
        data-expanded={expanded}
        ref={containerRef}
        onClick={handlePlayerClick}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <video ref={setVideoEl} src={src} autoPlay={false} loop muted={muted} playsInline preload="metadata" />

      {isMobile && !isPlaying && !expanded && (
        <div className={styles.playButton} aria-hidden="true">
          <span className={styles.playLabel}>Play</span>
        </div>
      )}

      <p
        className={`${styles.volume} ${!muted ? styles.active : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          setMuted((m) => !m)
        }}
      >
        Sound
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

  // Always portal — toggling between an inline render and a portal (rather
  // than always portaling and only changing the container) would make React
  // remount the subtree on expand/collapse, tearing down the <video> and
  // losing playback position. Moving the *same* portal to a new container
  // relocates the DOM node instead, so the video keeps playing untouched
  // while its containing block becomes document.body — escaping any
  // transformed/will-change ancestor in the scrolling strips above it,
  // which is what made `position: fixed` stay pinned to the strip instead
  // of the viewport.
  const portalTarget = expanded && typeof document !== 'undefined' ? document.body : anchorEl

  return (
    <>
      <div ref={setAnchorEl} className={styles.anchor} />
      {portalTarget && createPortal(player, portalTarget)}
    </>
  )
}
