'use client'

import { useRef, useEffect } from 'react'
import type { OldProject } from '@/sanity/lib/types'
import WorkRow from '@/app/components/WorkRow/WorkRow'
import styles from './WorkScroll.module.scss'

interface Props {
  projects: OldProject[]
}

export default function WorkScroll({ projects }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight / 3
  }, [])

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const setHeight = el.scrollHeight / 3
    if (el.scrollTop < 2) {
      el.scrollTop = setHeight
    } else if (el.scrollTop > setHeight * 2 - 2) {
      el.scrollTop = setHeight
    }
  }

  return (
    <div className={styles.scroll} ref={scrollRef} onScroll={handleScroll} data-lenis-prevent>
      {[0, 1, 2].map((copy) =>
        projects.map((project) => (
          <WorkRow key={`${project._id}-${copy}`} project={project} />
        ))
      )}
    </div>
  )
}