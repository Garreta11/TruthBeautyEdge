/* 'use client'

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
 */

'use client'

import { useRef } from 'react'
import type { OldProject } from '@/sanity/lib/types'
import WorkRow, { type StripGroups } from '@/app/components/WorkRow/WorkRow'
import styles from './WorkScroll.module.scss'

interface Props {
  projects: OldProject[]
}

export default function WorkScroll({ projects }: Props) {
  const stripGroups = useRef<StripGroups>(new Map()).current

  return (
    <div className={styles.scroll}>
      {projects.map((project) => (
        <WorkRow key={`${project._id}`} project={project} stripGroups={stripGroups} />
      ))}
      {projects.length > 0 && (
        <WorkRow key={`${projects[0]._id}-duplicate`} project={projects[0]} stripGroups={stripGroups} />
      )}
      {projects.length > 1 && (
        <WorkRow key={`${projects[1]._id}-duplicate`} project={projects[1]} stripGroups={stripGroups} />
      )}
    </div>
  )
}