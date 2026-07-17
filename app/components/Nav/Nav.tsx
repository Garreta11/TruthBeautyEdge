'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import styles from './Nav.module.scss'
import ReachOut from '@/app/components/ReachOut/ReachOut'
import WorkRequest from '@/app/components/WorkRequest/WorkRequest'
import WorkGate from '@/app/components/WorkGate/WorkGate'
import Info from '@/app/components/Info/Info'
import { usePanel } from '@/app/context/PanelContext'
import { useWorkAccess } from '@/app/context/WorkAccessContext'
import Logo from '../Logo/Logo'
import Link from 'next/link'

interface Props {
  logo?: string
  reachOut?: {
    label?: string
    cities?: { city: string; phone?: string }[]
    mail?: string
  }
  checkWork?: {
    label?: string
    createdWith?: string
  }
  description?: string
  info?: {
    label?: string
    body?: unknown[]
  }
  mail?: {
    subject?: string
    body?: unknown[]
  }
}

export default function Nav({ logo, reachOut, checkWork, description, info, mail }: Props) {
  const pathname = usePathname()
  const { openPanel, setOpenPanel } = usePanel()
  const { unlocked: workUnlocked } = useWorkAccess()
  const workAccessGranted = pathname === '/work' && workUnlocked
  // The logo only animates up on the homepage; elsewhere it's already in place
  const [logoReady, setLogoReady] = useState(pathname !== '/')

  if (pathname.startsWith('/studio')) return null

  return (
    <>
      <Logo url={logo || "/logo.svg"} alt="Truth Beauty Edge" onTopComplete={() => setLogoReady(true)} />
      <nav className={`${styles.nav} grid`} data-nav-els>
        
        <div className={styles.nav__description}>
          {description && <p>{description}</p>}
        </div>

        <div className={styles.nav__view_work}>
          <p className={`${styles.createdWith} ${workAccessGranted ? styles.visible : ''}`}>
            {checkWork?.createdWith}
          </p>
          <div className={`${styles.workRequestGroup} ${workAccessGranted ? '' : styles.visible}`}>
            <WorkRequest checkWork={checkWork?.label} />
            {pathname === '/work' && (
              <WorkGate mail={reachOut?.mail} subject={mail?.subject} body={mail?.body} />
            )}
          </div>
        </div>

        <div className={styles.nav__info}>
          {info && (
            <Info
              label={info.label}
              body={info.body}
              open={openPanel === 'info'}
              onOpen={() => setOpenPanel('info')}
              onClose={() => setOpenPanel(null)}
            />
          )}
        </div>

        <div className={styles.nav__cities}>
          <p>{reachOut?.cities?.[1]?.city}</p>
          <p>{reachOut?.cities?.[0]?.city}</p>
        </div>

        <div className={styles.nav__allrights}>
          <p>©2026 All rights reserved</p>
        </div>

        <div className={styles.nav__links}>
          <Link href="https://www.instagram.com/truthbeautyedge/" target='_blank'>Instagram</Link>
        </div>

        <div className={styles.nav__reach_out}>
          {reachOut && (
            <ReachOut
              label={reachOut.label}
              cities={reachOut.cities}
              mail={reachOut.mail}
              open={openPanel === 'reachOut'}
              onOpen={() => setOpenPanel('reachOut')}
              onClose={() => setOpenPanel(null)}
            />
          )}
        </div>
      </nav>
    </>
  )
}
