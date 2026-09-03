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