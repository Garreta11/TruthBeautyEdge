'use client'

import { useEffect, useRef } from 'react'
import styles from './CustomCursor.module.scss'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Coarse pointers (touch) have no hover position to follow.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const cursor = cursorRef.current
    if (!cursor) return

    let revealed = false
    // While true (mouse is over a VideoPlayer), the custom cursor stays
    // hidden so it doesn't overlap that player's own play/pause indicator.
    let overVideo = false

    function updateOpacity() {
      cursor!.style.opacity = revealed && !overVideo ? '1' : '0'
    }

    function onMouseMove(e: MouseEvent) {
      cursor!.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`
      if (!revealed) {
        revealed = true
        cursor!.style.backdropFilter = 'blur(100px)'
      }
      updateOpacity()
    }

    function onVideoHover(e: Event) {
      overVideo = (e as CustomEvent<boolean>).detail
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

  return <div ref={cursorRef} className={styles.cursor} />
}
