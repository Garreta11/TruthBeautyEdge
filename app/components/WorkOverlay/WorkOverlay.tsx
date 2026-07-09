'use client'

import { useEffect } from 'react'
import { usePanel } from '@/app/context/PanelContext'
import styles from './WorkOverlay.module.scss'

export default function WorkOverlay() {
  const { openPanel, setOpenPanel } = usePanel()

  useEffect(() => {
    if (!openPanel) return

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (target.closest('[data-panel-root]')) return
      setOpenPanel(null)
    }

    // Bubble-phase listener: scroll/wheel/touch still pass straight through
    // the overlay (pointer-events: none), only clicks are intercepted here.
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [openPanel, setOpenPanel])

  return <div className={`${styles.overlay} ${openPanel ? styles.visible : ''}`} />
}
