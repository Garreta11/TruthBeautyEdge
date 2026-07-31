'use client'

import { useEffect, useRef } from 'react'
import styles from './CustomCursor.module.scss'

// How quickly the cursor closes the gap to the pointer each frame —
// lower = more trailing lag, 1 = no lag (snaps directly to the pointer).
const EASE = 0.

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Coarse pointers (touch) have no hover position to follow.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const cursor = cursorRef.current
    if (!cursor) return

    const target = { x: 0, y: 0 }
    const pos = { ...target }
    let rafId: number
    let revealed = false

    function onMouseMove(e: MouseEvent) {
      target.x = e.clientX
      target.y = e.clientY
      if (!revealed) {
        // Jump straight to the first known position instead of easing in
        // from the top-left corner where pos was initialized.
        pos.x = target.x
        pos.y = target.y
        revealed = true
        cursor!.style.opacity = '1'
        cursor!.style.backdropFilter = 'blur(100px)'
      }
    }

    function tick() {
      pos.x += (target.x - pos.x) * EASE
      pos.y += (target.y - pos.y) * EASE
      cursor!.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`
      rafId = requestAnimationFrame(tick)
    }

    document.body.style.cursor = 'none'
    window.addEventListener('mousemove', onMouseMove)
    rafId = requestAnimationFrame(tick)

    return () => {
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return <div ref={cursorRef} className={styles.cursor} />
}
