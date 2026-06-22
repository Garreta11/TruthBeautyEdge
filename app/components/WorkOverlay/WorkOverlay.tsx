'use client'

import { usePanel } from '@/app/context/PanelContext'
import styles from './WorkOverlay.module.scss'

export default function WorkOverlay() {
  const { openPanel } = usePanel()

  return <div className={`${styles.overlay} ${openPanel ? styles.visible : ''}`} />
}
