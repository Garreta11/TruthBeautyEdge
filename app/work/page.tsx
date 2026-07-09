import { getAllOldProjects } from '@/sanity/lib/queries'
import WorkOverlay from '@/app/components/WorkOverlay/WorkOverlay'
import WorkScroll from '../components/WorkScroll/WorkScroll'
import { hasWorkAccess } from './actions'

export default async function WorkPage() {
  const unlocked = await hasWorkAccess()
  if (!unlocked) return null

  const projects = await getAllOldProjects()

  return (
    <>
      <WorkOverlay />
      <WorkScroll projects={projects} />
    </>
  )
}
