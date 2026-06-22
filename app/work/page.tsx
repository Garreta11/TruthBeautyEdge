import { getAllOldProjects } from '@/sanity/lib/queries'
import WorkOverlay from '@/app/components/WorkOverlay/WorkOverlay'
import WorkGate from './WorkGate'
import WorkScroll from './WorkScroll/WorkScroll'

export default async function WorkPage() {
  const projects = await getAllOldProjects()

  return (
    <>
      <WorkOverlay />
      <WorkGate>
        <WorkScroll projects={projects} />
      </WorkGate>
    </>
  )
}
