'use client'

import { usePanel } from '@/app/context/PanelContext'
import styles from "./BlurredColumns.module.scss"

export default function BlurredColumns() {
  const { openPanel } = usePanel()
  const isInfoOpen = openPanel === 'info'

  return (
    <div className={`${styles.columns} ${isInfoOpen ? styles.behind : ''}`}>
      <div className={styles.columns__left}>
        <div className={`${styles.columns__layer} ${styles.columns__layer1}`} />
        <div className={`${styles.columns__layer} ${styles.columns__layer2}`} />
        <div className={`${styles.columns__layer} ${styles.columns__layer3}`} />
        <div className={`${styles.columns__layer} ${styles.columns__layer4}`} />
        <div className={`${styles.columns__layer} ${styles.columns__layer5}`} />
      </div>
    </div>
  )
}
