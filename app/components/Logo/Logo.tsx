'use client'

import { useInteraction } from '@/app/context/InteractionContext'
import styles from './Logo.module.scss'

interface Props {
  url: string
  alt?: string
}

export default function Logo({ url, alt }: Props) {
  const { hasInteracted } = useInteraction()

  return (
    <div className={`${styles.container} ${hasInteracted ? styles.top : ''}`}>
      <div
        className={styles.backdrop}
        style={{
          maskImage: `url(${url})`,
          WebkitMaskImage: `url(${url})`,
        }}
      />
      <img className={styles.img} src={url} alt={alt ?? 'Logo'} />
    </div>
  )
}
