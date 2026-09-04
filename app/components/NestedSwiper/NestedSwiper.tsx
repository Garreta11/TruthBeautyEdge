"use client"
import { useEffect, useRef, useState } from 'react'

import { OldProject } from "@/sanity/lib/types"
// import Swiper JS
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/free-mode';
// import Swiper styles
import 'swiper/css';

import { Mousewheel, FreeMode, Keyboard } from 'swiper/modules';
import styles from './NestedSwiper.module.scss'

import type { MediaItem } from '@/sanity/lib/types'
import { urlFor } from '@/sanity/lib/image'
import VideoPlayer, { pauseAllVideos } from '@/app/components/VideoPlayer/VideoPlayer'
import { useActiveRow } from '@/app/context/ActiveRowContext'

interface Props {
  projects: OldProject[]
}

// Video and iframe embeds are real network requests and browsing contexts —
// only mount them once the project slide is near the viewport (see
// ProjectSlide's IntersectionObserver below). iOS Safari caps how many
// concurrently-live <video> elements it will decode; mounting every video in
// every slide up front (as this used to) exhausts that cap after a few slide
// changes and crashes the tab.
function MediaCell({ item, active }: { item: MediaItem; active: boolean }) {
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
          {active ? <VideoPlayer src={fileSrc} /> : <div className={styles.mediaPlaceholder} />}
        </div>
      )
    }

    if (externalSrc) {
      return (
        <div className={`${styles.imageBlock} ${styles.imageBlockEmbed}`}>
          {active && <iframe src={externalSrc} allowFullScreen title={item.caption ?? 'video'} />}
        </div>
      )
    }

    return null
  }

  return null
}

// One outer (project) slide's inner horizontal Swiper. Wrapped in its own
// component so it can hold the IntersectionObserver that gates whether its
// videos are actually mounted (see MediaCell) — only the current project's
// slide, plus whichever neighbor the vertical loop keeps near the viewport,
// ever has real <video> elements alive at once.
function ProjectSlide({ project }: { project: OldProject }) {
  const slideRef = useRef<HTMLDivElement>(null)
  const [isNearViewport, setIsNearViewport] = useState(false)

  useEffect(() => {
    const el = slideRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      { rootMargin: '50% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={slideRef} className={styles.projectSlideObserver}>
      <Swiper
        className={styles.swiper}
        spaceBetween={3}
        slidesPerView="auto"
        mousewheel={{ forceToAxis: true }}
        keyboard={{ enabled: true, onlyInViewport: true }}
        freeMode={true}
        loop
        nested
        touchEventsTarget="container"
        modules={[Mousewheel, FreeMode, Keyboard]}
      >
        {project.media.map((item, idx) => (
          <SwiperSlide className={styles['swiper-slide']} key={idx}>
            <MediaCell key={`${item._key}-${idx}`} item={item} active={isNearViewport} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

const NestedSwiper = ({projects}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeIndexRef = useRef<number | null>(null)
  const { setActiveRow } = useActiveRow()

  // The outer Swiper loops, so `activeIndex` counts duplicated slides too.
  // `realIndex` is the one that maps back to the original `projects` array.
  const updateActiveRow = (slider: any) => {
    const activeIndex = slider.realIndex
    if (activeIndex !== activeIndexRef.current) {
      activeIndexRef.current = activeIndex
      setActiveRow(projects[activeIndex] ?? null)
    }
  }

  useEffect(() => {
    if (projects.length > 0) {
      activeIndexRef.current = 0
      setActiveRow(projects[0])
    }

    return () => {
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
        mousewheel={{
          forceToAxis: true,
          thresholdDelta: 30,
          thresholdTime: 100,
        }}
        loop
        keyboard={{ enabled: true, onlyInViewport: true }}
        onSlideChange={(e) => {
          updateActiveRow(e)
          pauseAllVideos()
        }}
        modules={[Mousewheel, Keyboard]}
      >
        {projects.map((project, index) => (
          <SwiperSlide
            className={styles['swiper-slide-v']}
            key={index}
            data-project-index={index}
          >
            <ProjectSlide project={project} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default NestedSwiper