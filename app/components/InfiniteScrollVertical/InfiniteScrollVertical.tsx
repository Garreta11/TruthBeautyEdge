import type { OldProject } from '@/sanity/lib/types'
import styles from './InfiniteScrollVertical.module.scss'

interface Props {
  projects: OldProject[]
}

const InfiniteScrollVertical = ({ projects }: Props) => {
  return(
    <div className={styles.scroll}>
      {projects.map((project) => (
        <div key={`${project._id}`} style={{height: '50dvh', backgroundColor: 'red'}}>project</div>
      ))}
    </div>
  )
}

export default InfiniteScrollVertical