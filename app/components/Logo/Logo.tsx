'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useInteraction } from '@/app/context/InteractionContext'
import { homepageTransition, workpageTransitionOut } from '@/app/animations'
import styles from './Logo.module.scss'

interface Props {
  url: string
  alt?: string
  onTopComplete?: () => void
}

export default function Logo({ url, alt, onTopComplete }: Props) {
  const pathname = usePathname()
  
  const router = useRouter()
  const { hasInteracted } = useInteraction()
  const [loaded, setLoaded] = useState(false)
  const [ratio, setRatio] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (document.readyState === 'complete') {
      setLoaded(true)
      return
    }
    const handleLoad = () => setLoaded(true)
    window.addEventListener('load', handleLoad)
    return () => window.removeEventListener('load', handleLoad)
  }, [])

  function handleClick() {
    switch (pathname) {
      case '/':
        return
      case '/work':
        workpageTransitionOut(() => {
          homepageTransition(containerRef.current)
          router.push('/')
        })
        return
      default:
        router.push('/')
    }
  }

  const isTop = hasInteracted || loaded
  const isHome = pathname === '/'

  useEffect(() => {
    if (!isTop || !isHome) return
    homepageTransition(containerRef.current, () => onTopComplete?.())

  }, [isTop, isHome])

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${isTop && !isHome ? styles.top : ''}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
      onClick={handleClick}
      data-logo
    >
      <div
        className={styles.backdrop}
        style={{
          maskImage: `url(${url})`,
          WebkitMaskImage: `url(${url})`,
        }}
      />
      <img
        className={styles.img}
        src={url}
        alt={alt ?? 'Logo'}
        onLoad={(e) => {
          const { naturalWidth, naturalHeight } = e.currentTarget
          if (naturalWidth && naturalHeight) setRatio(naturalWidth / naturalHeight)
        }}
      />
    </div>
  )
}
