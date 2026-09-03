'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import styles from './CustomCursor.module.scss'

gsap.registerPlugin(MorphSVGPlugin)

interface VideoHoverDetail {
  hovering: boolean
  overControls: boolean
  playing: boolean
}

const SHAPES = {
  idle: 'M7,3.5 a3.5,3.5 0 1,0 0.01,0 Z',
  play: 'M0,0 L14,8 L0,16 Z',
  pause: 'M0,0 H4 V16 H0 Z M10,0 H14 V16 H10 Z',
} as const

type Shape = keyof typeof SHAPES

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    // Coarse pointers (touch) have no hover position to follow.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const cursor = cursorRef.current
    const path = pathRef.current
    if (!cursor || !path) return

    let revealed = false
    let overControls = false
    let shape: Shape = 'idle'

    function updateOpacity() {
      cursor!.style.opacity = revealed && !overControls ? '1' : '0'
    }

    function morphTo(next: Shape) {
      if (next === shape) return
      shape = next
      gsap.to(path, { duration: 0.4, morphSVG: SHAPES[next], ease: 'power3.inOut' })
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
      cursor!.classList.toggle(styles.video, overVideo)
      morphTo(overVideo ? (detail.playing ? 'pause' : 'play') : 'idle')
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
    <div ref={cursorRef} className={styles.cursor}>
      <svg viewBox="0 0 14 16" width="14" height="16">
        <path ref={pathRef} d={SHAPES.idle} fill="white" />
      </svg>
    </div>
  )
}
