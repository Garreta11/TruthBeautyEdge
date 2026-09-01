'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import { useInteraction } from '@/app/context/InteractionContext'
import { panelOpen, panelClose } from '@/app/(site)/animations'
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
  const panelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const open = openProp ?? openState

  useEffect(() => {
    if (open) {
      panelOpen(panelRef.current, contentRef.current)
    } else {
      panelClose(panelRef.current, contentRef.current)
    }
  }, [open])

  if (!label) return null

  function handleOpen() {
    onOpen ? onOpen() : setOpenState(true)
    setInteracted()
  }

  function handleClose() {
    onClose ? onClose() : setOpenState(false)
  }

  function handleTriggerClick() {
    open ? handleClose() : handleOpen()
  }

  return (
    <div className={styles.wrapper} data-panel-root>
      <button className={styles.trigger} onClick={handleTriggerClick}>
        <p>{label}</p>
      </button>

      <div className={styles.panel} ref={panelRef} data-open={open}>
        <div className={styles.content} ref={contentRef}>
          {children}
          <button className={styles.close} onClick={handleClose} aria-label="Close">
            <p>Close</p>
          </button>
        </div>
      </div>
    </div>
  )
}
