"use client"
import { useEffect, useRef, useState } from 'react'

import { OldProject } from "@/sanity/lib/types"
// import Swiper JS
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/free-mode';
// import Swiper styles
import 'swiper/css';

import { Mousewheel, FreeMode } from 'swiper/modules';
import styles from './NestedSwiper.module.scss'

import type { MediaItem } from '@/sanity/lib/types'
import { urlFor } from '@/sanity/lib/image'
import VideoPlayer, { pauseVideoOutside } from '@/app/components/VideoPlayer/VideoPlayer'
import { useActiveRow } from '@/app/context/ActiveRowContext'

interface Props {
  projects: OldProject[]
}

function MediaCell({ item }: { item: MediaItem; }) {
  if (item._type === 'mediaImage') {
    const src = urlFor(item.image).height(1200).auto('format').quality(75).url()
    return (
      <div className={styles.imageBlock}>
        <img src={src} alt={item.alt ?? ''} loading="lazy" />
      </div>
    )
  }

  if (item._type === 'mediaVideo') {
    const fileSrc = item.file?.asset?.url
    const externalSrc = item.url

    if (fileSrc) {
      return (
        <div className={styles.imageBlock}>
          <VideoPlayer src={fileSrc} />
        </div>
      )
    }

    if (externalSrc) {
      return (
        <div className={`${styles.imageBlock} ${styles.imageBlockEmbed}`}>
          <iframe src={externalSrc} allowFullScreen title={item.caption ?? 'video'} />
        </div>
      )
    }

    return null
  }

  return null
}

const NestedSwiper = ({projects}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const activeIndexRef = useRef<number | null>(null)
  const isTouchRef = useRef(false)
  const { setActiveRow } = useActiveRow()

  // On desktop, the active row is whichever `.swiper-slide-v` the mouse is
  // over, by position — not Swiper's own active-slide tracking. On mobile
  // (no hover) it's whichever row Swiper itself marks `swiper-slide-active`.
  // Re-run on every mousemove, and on every Swiper translate change (its
  // "scroll") so the active row updates even if it moves under a still mouse.
  const updateActiveRow = () => {
    const container = containerRef.current
    if (!container) return

    const rows = container.querySelectorAll<HTMLElement>(`.${styles['swiper-slide-v']}`)
    let activeRow: HTMLElement | null = null

    if (isTouchRef.current) {
      activeRow = container.querySelector<HTMLElement>(
        `.${styles['swiper-slide-v']}.swiper-slide-active`
      )
    } else {
      const { x: mouseX, y: mouseY } = mousePos.current
      rows.forEach((row) => {
        const rect = row.getBoundingClientRect()
        const isUnderMouse =
          mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom
        if (isUnderMouse) activeRow = row
      })
    }

    rows.forEach((row) => {
      row.classList.toggle(styles.active, row === activeRow)
    })

    const activeIndex = activeRow ? Number((activeRow as HTMLElement).dataset.projectIndex) : null
    if (activeIndex !== activeIndexRef.current) {
      activeIndexRef.current = activeIndex
      setActiveRow(activeIndex !== null ? projects[activeIndex] : null)
    }
  }

  useEffect(() => {
    if (projects.length > 0) {
      activeIndexRef.current = 0
      setActiveRow(projects[0])
    }

    isTouchRef.current = !window.matchMedia('(pointer: fine)').matches

    if (isTouchRef.current) {
      updateActiveRow()
      return () => {
        setActiveRow(null)
      }
    }

    mousePos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

    const handleMouseMove = (event: MouseEvent) => {
      mousePos.current = { x: event.clientX, y: event.clientY }
      updateActiveRow()
    }

    window.addEventListener('mousemove', handleMouseMove)
    updateActiveRow()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      setActiveRow(null)
    }
  }, [])

  return (
    <div ref={containerRef}>
      <Swiper
        className={styles['swiper-v']}
        direction="vertical"
        spaceBetween={3}
        slidesPerView="auto"
        mousewheel={{ forceToAxis: true }}
        loop
        freeMode={true}
        onSetTranslate={() => updateActiveRow()}
        modules={[Mousewheel, FreeMode]}
      >
        {projects.map((project, index) => (
          <SwiperSlide
            className={styles['swiper-slide-v']}
            key={index}
            data-project-index={index}
            onMouseEnter={(event) => {
              // mousemove doesn't bubble out of an <iframe> (embedded video
              // rows), so a row entered that way would never re-trigger
              // updateActiveRow via the window listener — catch it here too.
              mousePos.current = { x: event.clientX, y: event.clientY }
              updateActiveRow()
              pauseVideoOutside(event.currentTarget)
            }}
          >
            <Swiper
              className={styles.swiper}
              spaceBetween={3}
              slidesPerView="auto"
              mousewheel={{ forceToAxis: true }}
              freeMode={true}
              loop
              nested
              modules={[Mousewheel, FreeMode]}
            >
              {project.media.map((item, idx) => (
                <SwiperSlide className={styles['swiper-slide']} key={idx}>
                  <MediaCell key={`${item._key}-${idx}`} item={item} />
                </SwiperSlide>
              ))}
            </Swiper>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default NestedSwiper