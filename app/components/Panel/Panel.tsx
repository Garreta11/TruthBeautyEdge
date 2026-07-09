'use client'

import { useState, useRef, type ReactNode } from 'react'
import { useInteraction } from '@/app/context/InteractionContext'
import styles from './Panel.module.scss'

interface Props {
  label?: string
  open?: boolean
  onOpen?: () => void
  onClose?: () => void
  children?: ReactNode
}

// Let the content fade out before the panel itself shrinks away
const CLOSE_FADE_MS = 150

export default function Panel({ label, open: openProp, onOpen, onClose, children }: Props) {
  const { setInteracted } = useInteraction()
  const [openState, setOpenState] = useState(false)
  const [closing, setClosing] = useState(false)
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const open = openProp ?? openState

  if (!label) return null

  function handleOpen() {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current)
      closeTimeout.current = null
    }
    setClosing(false)
    onOpen ? onOpen() : setOpenState(true)
    setInteracted()
  }

  function handleClose() {
    setClosing(true)
    closeTimeout.current = setTimeout(() => {
      onClose ? onClose() : setOpenState(false)
      setClosing(false)
      closeTimeout.current = null
    }, CLOSE_FADE_MS)
  }

  return (
    <div className={styles.wrapper} data-panel-root>
      <button className={styles.trigger} onClick={handleOpen}>
        <p>{label}</p>
      </button>

      <div className={`${styles.panel} ${open ? styles.open : ''}`} data-open={open}>
        <div className={`${styles.content} ${closing ? styles.closing : ''}`}>
          {children}
          <button className={styles.close} onClick={handleClose} aria-label="Close">
            <svg width="30" height="29" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="0.309781" y1="28.3094" x2="28.3098" y2="0.309354" stroke="white" strokeWidth="0.875"/>
              <line x1="0.9285" y1="0.309354" x2="28.9285" y2="28.3094" stroke="white" strokeWidth="0.875"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
