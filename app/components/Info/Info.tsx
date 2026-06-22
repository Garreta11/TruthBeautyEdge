'use client'

import { PortableText } from '@portabletext/react'
import { useInteraction } from '@/app/context/InteractionContext'
import styles from './Info.module.scss'

interface Props {
  label?: string
  body?: unknown[]
  open: boolean
  onOpen: () => void
  onClose: () => void
}

export default function Info({ label, body, open, onOpen, onClose }: Props) {
  const { setInteracted } = useInteraction()

  if (!label) return null

  function handleOpen() {
    onOpen()
    setInteracted()
  }

  return (
    <div className={styles.wrapper}>
      <button className={styles.trigger} onClick={handleOpen}>
        <p>{label}</p>
      </button>

      <div className={`${styles.panel} ${open ? styles.open : ''}`}>
        {body && (
          <div className={styles.body}>
            <PortableText value={body as Parameters<typeof PortableText>[0]['value']} />
          </div>
        )}
        <button className={styles.close} onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
    </div>
  )
}
