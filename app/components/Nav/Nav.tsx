'use client'

import { usePathname } from 'next/navigation'
import styles from './Nav.module.scss'
import ReachOut from '@/app/components/ReachOut/ReachOut'
import WorkRequest from '@/app/components/WorkRequest/WorkRequest'
import Info from '@/app/components/Info/Info'
import { usePanel } from '@/app/context/PanelContext'

interface Props {
  reachOut?: {
    label?: string
    cities?: { city: string; phone?: string }[]
    mail?: string
  }
  checkWork?: {
    sentence1?: string
    sentence2?: string
  }
  description?: {
    desc1?: string
    desc2?: string
  }
  info?: {
    label?: string
    body?: unknown[]
  }
}

export default function Nav({ reachOut, checkWork, description, info }: Props) {
  const pathname = usePathname()
  const { openPanel, setOpenPanel } = usePanel()

  if (pathname.startsWith('/studio')) return null

  return (
    <nav className={`${styles.nav} grid`}>
      {description?.desc1 && (
        <p className={styles.desc1}>{description.desc1}</p>
      )}
      {description?.desc2 && (
        <p className={styles.desc2}>{description.desc2}</p>
      )}
      {reachOut?.cities && reachOut.cities.length > 0 && (
        <p className={styles.cities}>
          {reachOut.cities.map((c) => c.city).join('\t\t')}
        </p>
      )}
      <WorkRequest checkWork={checkWork} />
      <Info
        label={info?.label}
        body={info?.body}
        open={openPanel === 'info'}
        onOpen={() => setOpenPanel('info')}
        onClose={() => setOpenPanel(null)}
      />
      <ReachOut
        label={reachOut?.label}
        cities={reachOut?.cities}
        mail={reachOut?.mail}
        open={openPanel === 'reachOut'}
        onOpen={() => setOpenPanel('reachOut')}
        onClose={() => setOpenPanel(null)}
      />
    </nav>
  )
}
