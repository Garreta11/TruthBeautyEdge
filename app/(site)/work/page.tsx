import { getAllOldProjects } from '@/sanity/lib/queries'
import WorkContent from './WorkContent'

export default async function WorkPage() {
  const projects = await getAllOldProjects()

  return <WorkContent projects={projects} />
}
