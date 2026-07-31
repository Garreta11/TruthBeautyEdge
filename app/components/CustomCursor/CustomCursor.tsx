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

    function onMouseMove(e: MouseEvent) {
      cursor!.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`
      if (!revealed) {
        revealed = true
        cursor!.style.opacity = '1'
        cursor!.style.backdropFilter = 'blur(100px)'
      }
    }

    document.body.style.cursor = 'none'
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return <div ref={cursorRef} className={styles.cursor} />
}
