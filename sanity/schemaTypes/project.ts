import { defineField, defineType } from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'media',
      title: 'Media',
      type: 'array',
      of: [
        {
          name: 'mediaImage',
          title: 'Image',
          type: 'object',
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
            }),
          ],
          preview: {
            select: { title: 'alt', media: 'image' },
            prepare({ title, media }) {
              return { title: title || 'Image', media }
            },
          },
        },
        {
          name: 'mediaVideo',
          title: 'Video',
          type: 'object',
          fields: [
            defineField({
              name: 'file',
              title: 'Video file',
              type: 'file',
              options: { accept: 'video/*' },
            }),
            defineField({
              name: 'url',
              title: 'External URL (YouTube, Vimeo…)',
              type: 'url',
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
            }),
          ],
          preview: {
            select: { caption: 'caption', url: 'url' },
            prepare({ caption, url }) {
              return { title: caption || url || 'Video' }
            },
          },
        },
        {
          name: 'mediaText',
          title: 'Text',
          type: 'object',
          fields: [
            defineField({
              name: 'body',
              title: 'Body',
              type: 'array',
              of: [
                { type: 'block' },
              ],
            }),
          ],
          preview: {
            select: { body: 'body' },
            prepare({ body }) {
              const text = body?.[0]?.children?.[0]?.text || 'Text block'
              return { title: text }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'media.0.image',
    },
    prepare({ title, media }) {
      return { title, media }
    },
  },
})
