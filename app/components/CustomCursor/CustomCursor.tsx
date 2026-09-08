'use client'

import { useEffect, useRef } from 'react'
import styles from './CustomCursor.module.scss'

interface VideoHoverDetail {
  hovering: boolean
  overControls: boolean
  playing: boolean
}

type Shape = 'idle' | 'play' | 'pause'

const LABELS: Record<Shape, string> = {
  idle: '',
  play: 'Play',
  pause: 'Pause',
}

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    // Coarse pointers (touch) have no hover position to follow.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const cursor = cursorRef.current
    const label = labelRef.current
    if (!cursor || !label) return

    let revealed = false
    let overControls = false
    let shape: Shape = 'idle'

    function updateOpacity() {
      // overControls no longer hides the cursor — hovering controls (e.g. the
      // trackWrapper) still shows it, just reverted to the idle shape below.
      cursor!.style.opacity = revealed ? '1' : '0'
    }

    function setShape(next: Shape) {
      if (next === shape) return
      cursor!.classList.remove(styles[shape])
      shape = next
      cursor!.classList.add(styles[shape])
      label!.textContent = LABELS[next]
    }

    function onMouseMove(e: MouseEvent) {
      cursor!.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`
      if (!revealed) {
        revealed = true
      }
      updateOpacity()
    }

    function onVideoHover(e: Event) {
      const detail = (e as CustomEvent<VideoHoverDetail>).detail
      const overVideo = detail.hovering && !detail.overControls
      overControls = detail.hovering && detail.overControls
      setShape(overVideo ? (detail.playing ? 'pause' : 'play') : 'idle')
      updateOpacity()
    }

    document.body.style.cursor = 'none'
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('video-hover', onVideoHover)

    return () => {
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('video-hover', onVideoHover)
    }
  }, [])

  return (
    <div ref={cursorRef} className={`${styles.cursor} ${styles.idle}`}>
      <div className={styles.dot} />
      <span ref={labelRef} className={styles.label} />
    </div>
  )
}
