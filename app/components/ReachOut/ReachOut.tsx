'use client'

import Panel from '@/app/components/Panel/Panel'
import styles from './ReachOut.module.scss'

interface City {
  city: string
  phone?: string
}

interface Props {
  label?: string
  cities?: City[]
  mail?: string
  open?: boolean
  onOpen?: () => void
  onClose?: () => void
}

export default function ReachOut({ label, cities, mail, open, onOpen, onClose }: Props) {
  return (
    <Panel label={label} open={open} onOpen={onOpen} onClose={onClose}>
      <table className={styles.table}>
        <tbody>
          {cities?.map((c, i) => (
            <tr key={i}>
              <td className={styles.tdLabel}><h4>{c.city}</h4></td>
              <td className={styles.tdValue}>{c.phone}</td>
            </tr>
          ))}
          {mail && (
            <tr className={styles.mailRow}>
              <td className={styles.tdLabel}><h4>Mail</h4></td>
              <td className={styles.tdValue}>
                <a href={`mailto:${mail}`} className={styles.mailLink}>{mail}</a>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Panel>
  )
}
