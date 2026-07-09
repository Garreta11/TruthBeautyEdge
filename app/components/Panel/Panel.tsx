'use client'

import { useState, type ReactNode } from 'react'
import { useInteraction } from '@/app/context/InteractionContext'
import styles from './Panel.module.scss'

interface Props {
  label?: string
  open?: boolean
  onOpen?: () => void
  onClose?: () => void
  children?: ReactNode
}

export default function Panel({ label, open: openProp, onOpen, onClose, children }: Props) {
  const { setInteracted } = useInteraction()
  const [openState, setOpenState] = useState(false)
  const open = openProp ?? openState

  if (!label) return null

  function handleOpen() {
    onOpen ? onOpen() : setOpenState(true)
    setInteracted()
  }

  function handleClose() {
    onClose ? onClose() : setOpenState(false)
  }

  return (
    <div className={styles.wrapper} data-panel-root>
      <button className={styles.trigger} onClick={handleOpen}>
        <p>{label}</p>
      </button>

      <div className={`${styles.panel} ${open ? styles.open : ''}`} data-open={open}>
        <div className={styles.content}>
          {children}
          <button className={styles.close} onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
