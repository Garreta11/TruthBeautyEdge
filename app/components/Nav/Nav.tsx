'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { PortableText, PortableTextComponents } from '@portabletext/react'
import styles from './Nav.module.scss'
import ReachOut from '@/app/components/ReachOut/ReachOut'
import WorkRequest from '@/app/components/WorkRequest/WorkRequest'
import WorkGate from '@/app/components/WorkGate/WorkGate'
import Info from '@/app/components/Info/Info'
import { usePanel } from '@/app/context/PanelContext'
import { useWorkAccess } from '@/app/context/WorkAccessContext'
import { useActiveRow } from '@/app/context/ActiveRowContext'
import { activeRowTextReveal, workAccessTransition } from '@/app/(site)/animations'
import Logo from '../Logo/Logo'
import Link from 'next/link'

const descriptionComponents: PortableTextComponents = {
  block: {
    h1: ({ children }) => <h1 data-animate-group="description">{children}</h1>,
    h2: ({ children }) => <h2 data-animate-group="description">{children}</h2>,
    h3: ({ children }) => <h3 data-animate-group="description">{children}</h3>,
    h4: ({ children }) => <h4 data-animate-group="description">{children}</h4>,
    normal: ({ children }) => <p data-animate-group="description">{children}</p>,
    blockquote: ({ children }) => <blockquote data-animate-group="description">{children}</blockquote>,
  },
  marks: {
    link: ({ children, value }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
}

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
  const { activeRow } = useActiveRow()
  const workAccessGranted = pathname === '/work' && workUnlocked
  // The logo only animates up on the homepage; elsewhere it's already in place
  const [logoReady, setLogoReady] = useState(pathname !== '/')

  // Runs before paint so the blurred starting state is applied in the same
  // frame the new activeRow's text lands — otherwise the sharp text would
  // flash for a frame before the tween's "from" state kicks in.
  useLayoutEffect(() => {
    if (!activeRow) return
    return activeRowTextReveal()
  }, [activeRow])

  // Skips the animation on mount — the base CSS already matches the initial
  // (locked) state, so only crossfade on later changes to workAccessGranted.
  const isFirstAccessRender = useRef(true)
  useEffect(() => {
    if (isFirstAccessRender.current) {
      isFirstAccessRender.current = false
      return
    }
    workAccessTransition(workAccessGranted)
  }, [workAccessGranted])

  if (pathname.startsWith('/studio')) return null

  // Defined once, rendered into both the desktop and mobile <nav> trees below —
  // each render creates its own independent instance (own state/effects), but
  // the markup itself only needs to be written once.
  const descriptionEl = (
    <div className={`${styles.nav__description} ${workAccessGranted ? styles.fadeOut : ''}`}>
      {description && <p>{description}</p>}
    </div>
  )

  const viewWorkEl = (
    <div className={styles.nav__view_work}>
      <div data-active-row-info className={styles.activeRowInfo}>
        {activeRow && (
          <div key={activeRow._id} data-active-row-content className={styles.activeRowInfo__content}>
            <div className={styles.activeRowInfo__content__header}>
              {activeRow.client && <p className={styles.activeRowInfo__content__header__client} data-animate-group="header">{activeRow.client}</p>}
              {activeRow.project && <p className={styles.activeRowInfo__content__header__project} data-animate-group="header">{activeRow.project}</p>}
            </div>
            {activeRow.description && (
              <div className={styles.activeRowInfo__content__body}>
                <PortableText
                  value={activeRow.description as Parameters<typeof PortableText>[0]['value']}
                  components={descriptionComponents}
                />
              </div>
            )}
            {activeRow.createdWith && (
              <div className={styles.activeRowInfo__content__footer}>
                <p className={styles.activeRowInfo__content__footer__title} data-animate-group="createdWith">
                  Created with
                </p>
                <p className={styles.activeRowInfo__content__footer__text} data-animate-group="createdWith">
                  {activeRow.createdWith}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      {!activeRow && (
        <div data-work-request-group className={styles.workRequestGroup}>
          <WorkRequest checkWork={checkWork?.label} />
          {pathname === '/work' && (
            <WorkGate mail={reachOut?.mail} subject={mail?.subject} body={mail?.body} />
          )}
        </div>
      )}
    </div>
  )

  const infoEl = (
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
  )

  const citiesEl = (
    <div className={`${styles.nav__cities} ${workAccessGranted ? styles.hiddenMobile : ''}`}>
      <p>{reachOut?.cities?.[1]?.city}</p>
      <p>{reachOut?.cities?.[0]?.city}</p>
    </div>
  )

  const allRightsEl = (
    <div className={styles.nav__allrights}>
      <p>&copy;{new Date().getFullYear()} All rights reserved</p>
    </div>
  )

  const linksEl = (
    <div className={styles.nav__links}>
      <Link href="https://www.instagram.com/truthbeautyedge/" target='_blank'>Instagram</Link>
    </div>
  )

  const reachOutEl = (
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
  )

  return (
    <>
      <Logo url={logo || "/logo.svg"} alt="Truth Beauty Edge" onTopComplete={() => setLogoReady(true)} />

      {/* Single [data-nav-els] wrapper — animations.ts / WorkContent.tsx target
          exactly one element to fade both nav variants in together. */}
      <div className={styles.navRoot} data-nav-els>
        <nav className={styles.nav}>
          <div className={`${styles.row} ${styles.row1}`}>
            {descriptionEl}
          </div>

          <div className={`${styles.row} ${styles.row2}`}>
            {viewWorkEl}
            {infoEl}
          </div>

          <div className={`${styles.row} ${styles.row3}`}>
            {citiesEl}
            {allRightsEl}
            {linksEl}
            {reachOutEl}
          </div>
        </nav>

        <nav className={styles.navMobile}>
          <div className={styles.mrow} />

          <div className={`${styles.mrow} ${styles.mrow2}`}>
            {descriptionEl}
          </div>

          <div className={styles.mrow} />

          <div className={`${styles.mrow} ${styles.mrow4}`}>
            {viewWorkEl}
            {infoEl}
          </div>

          <div className={`${styles.mrow} ${styles.mrow5}`}>
            {citiesEl}
            {reachOutEl}
          </div>

          <div className={`${styles.mrow} ${styles.mrow6}`}>
            {allRightsEl}
            {linksEl}
          </div>
        </nav>
      </div>
    </>
  )
}
