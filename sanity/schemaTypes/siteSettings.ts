import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    // ─── Identity ──────────────────────────────────────────────────────────────
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    // ─── Assets ────────────────────────────────────────────────────────────────
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      description: 'Square image, ideally 512×512px',
      type: 'image',
    }),
    defineField({
      name: 'backgroundVideo',
      title: 'Background Video',
      description: 'Video that loops in the background across the whole site',
      type: 'file',
      options: { accept: 'video/*' },
    }),
    defineField({
      name: 'whoWeAreImage',
      title: 'Who We Are Image',
      type: 'image',
      options: { hotspot: true },
    }),

    // ─── Description ───────────────────────────────────────────────────────────
    defineField({
      name: 'description',
      title: 'Description',
      type: 'string',
    }),

    // ─── Info ──────────────────────────────────────────────────────────────────
    defineField({
      name: 'info',
      title: 'Info',
      type: 'object',
      fields: [
        defineField({
          name: 'label',
          title: 'Label',
          type: 'string',
        }),
        defineField({
          name: 'body',
          title: 'Body',
          type: 'array',
          of: [
            {
              type: 'block',
              styles: [
                { title: 'Normal', value: 'normal' },
                { title: 'H1', value: 'h1' },
                { title: 'H2', value: 'h2' },
                { title: 'H3', value: 'h3' },
                { title: 'H4', value: 'h4' },
                { title: 'Quote', value: 'blockquote' },
              ],
              marks: {
                decorators: [
                  { title: 'Bold', value: 'strong' },
                  { title: 'Italic', value: 'em' },
                ],
                annotations: [
                  {
                    name: 'link',
                    type: 'object',
                    title: 'Link',
                    fields: [
                      defineField({ name: 'href', type: 'url', title: 'URL' }),
                    ],
                  },
                ],
              },
            },
          ],
        }),
      ],
    }),

    // ─── Reach Out ─────────────────────────────────────────────────────────────
    defineField({
      name: 'reachOut',
      title: 'Reach Out',
      type: 'object',
      fields: [
        defineField({
          name: 'label',
          title: 'Label',
          type: 'string',
        }),
        // ─── Cities ────────────────────────────────────────────────────────────────
        defineField({
          name: 'cities',
          title: 'Cities',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'city', title: 'City', type: 'string', validation: (Rule) => Rule.required() }),
                defineField({ name: 'phone', title: 'Phone', type: 'string' }),
              ],
              preview: {
                select: { title: 'city', subtitle: 'phone' },
              },
            },
          ],
        }),
        // ─── Mail ──────────────────────────────────────────────────────────────────
        defineField({
          name: 'mail',
          title: 'Mail',
          type: 'string',
          validation: (Rule) => Rule.email(),
        }),
      ],
    }),
    
    // ─── Mail ──────────────────────────────────────────────────────────────────
    defineField({
      name: 'mail',
      title: 'Mail',
      type: 'object',
      fields: [
        defineField({
          name: 'subject',
          title: 'Subject',
          type: 'string',
        }),
        defineField({
          name: 'body',
          title: 'Body',
          type: 'array',
          of: [
            {
              type: 'block',
              styles: [
                { title: 'Normal', value: 'normal' },
                { title: 'H1', value: 'h1' },
                { title: 'H2', value: 'h2' },
                { title: 'H3', value: 'h3' },
                { title: 'H4', value: 'h4' },
                { title: 'Quote', value: 'blockquote' },
              ],
              marks: {
                decorators: [
                  { title: 'Bold', value: 'strong' },
                  { title: 'Italic', value: 'em' },
                ],
                annotations: [
                  {
                    name: 'link',
                    type: 'object',
                    title: 'Link',
                    fields: [
                      defineField({ name: 'href', type: 'url', title: 'URL' }),
                    ],
                  },
                ],
              },
            },
          ],
        }),
      ],
    }),

    // ─── Check Work ────────────────────────────────────────────────────────────
    defineField({
      name: 'checkWork',
      title: 'View work',
      type: 'object',
      fields: [
        defineField({
          name: 'label',
          title: 'Label',
          type: 'string',
        }),
        defineField({
          name: 'createdWith',
          title: 'Created with...',
          type: 'string',
        }),
      ]
    })
  ],
  preview: {
    select: { title: 'siteName', media: 'logo' },
  },
})
