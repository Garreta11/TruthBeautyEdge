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

import { PortableText, PortableTextComponents } from '@portabletext/react'
import type { MediaItem } from '@/sanity/lib/types'
import { urlFor } from '@/sanity/lib/image'
import VideoPlayer, { pauseVideoOutside } from '@/app/components/VideoPlayer/VideoPlayer'

interface Props {
  projects: OldProject[]
}

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => <h1>{children}</h1>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    h4: ({ children }) => <h4>{children}</h4>,
    normal: ({ children }) => <p>{children}</p>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  marks: {
    link: ({ children, value }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
}

function MediaCell({ item, active }: { item: MediaItem; active: boolean }) {
  if (item._type === 'mediaImage') {
    const src = urlFor(item.image).height(1200).auto('format').quality(75).url()
    return (
      <div className={styles.imageBlock}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
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

  if (item._type === 'mediaText') {
    /* return (
      <div className={`${styles.imageBlock} ${styles.imageBlockText}`}>
        <div className={styles.textContainer}>
          <PortableText value={item.body as Parameters<typeof PortableText>[0]['value']} components={components} />
        </div>
      </div>
    ) */
   return null
  }

  return null
}

const NestedSwiper = ({projects}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null) 
  const [isNearViewport, setIsNearViewport] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      { rootMargin: '50% 0px' }
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [])
  
  return (
    <div ref={containerRef}>
      <Swiper
        className={styles['swiper-v']}
        direction="vertical"
        spaceBetween={8}
        slidesPerView="auto"
        mousewheel={{ forceToAxis: true }}
        loop
        freeMode={true}
        modules={[Mousewheel, FreeMode]}
      >
        {projects.map((project, index) => (
          <SwiperSlide className={styles['swiper-slide-v']} key={index}>
            <Swiper
              className={styles.swiper}
              spaceBetween={8}
              slidesPerView="auto"
              mousewheel={{ forceToAxis: true }}
              freeMode={true}
              loop
              nested
              modules={[Mousewheel, FreeMode]}
            >
              {project.media.map((item, idx) => (
                <SwiperSlide className={styles['swiper-slide']} key={idx}>
                  <MediaCell key={`${item._key}-${idx}`} item={item} active={isNearViewport}/>
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