import { type SchemaTypeDefinition } from 'sanity'
import { project } from './project'
import { oldProject } from './oldProject'
import { siteSettings } from './siteSettings'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [project, oldProject, siteSettings],
}
