'use client'

import type { OldProject } from '@/sanity/lib/types'
import WorkRow from '@/app/components/WorkRow/WorkRow'
import styles from './WorkScroll.module.scss'

interface Props {
  projects: OldProject[]
}

export default function WorkScroll({ projects }: Props) {
  return (
    <div className={styles.scroll}>
      {[0, 1].map((copy) =>
        projects.map((project) => (
          <WorkRow key={`${project._id}-${copy}`} project={project} />
        ))
      )}
    </div>
  )
}
