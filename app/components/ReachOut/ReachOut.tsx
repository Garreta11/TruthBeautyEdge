'use client'

import { useInteraction } from '@/app/context/InteractionContext'
import styles from './ReachOut.module.scss'

interface City {
  city: string
  phone?: string
}

interface Props {
  label?: string
  cities?: City[]
  mail?: string
  open: boolean
  onOpen: () => void
  onClose: () => void
}

export default function ReachOut({ label, cities, mail, open, onOpen, onClose }: Props) {
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
        <table className={styles.table}>
          <tbody>
            {cities?.map((c, i) => (
              <tr key={i}>
                <td className={styles.tdLabel}>{c.city}</td>
                <td className={styles.tdValue}>{c.phone}</td>
              </tr>
            ))}
            {mail && (
              <tr className={styles.mailRow}>
                <td className={styles.tdLabel}>Mail</td>
                <td className={styles.tdValue}>
                  <a href={`mailto:${mail}`} className={styles.mailLink}>{mail}</a>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <button className={styles.close} onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
    </div>
  )
}
