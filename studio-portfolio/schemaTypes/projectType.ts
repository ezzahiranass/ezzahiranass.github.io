import {defineArrayMember, defineField, defineType} from 'sanity'

type ExternalLinkParent = {
  linkType?: string
}

const deliverableTypeField = defineField({
  name: 'deliverableType',
  title: 'Deliverable Type',
  type: 'array',
  group: 'metadata',
  of: [
    defineArrayMember({
      type: 'reference',
      to: [{type: 'taxonomyOption'}],
      options: {
        filter: 'category == $category',
        filterParams: {category: 'deliverable-type'},
      },
    }),
  ],
})

const projectLinkType = defineType({
  name: 'projectLink',
  title: 'Project Link',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'kind',
      title: 'Link Type',
      type: 'string',
      options: {
        list: [
          {title: 'Live Site', value: 'live'},
          {title: 'Case Study', value: 'case-study'},
          {title: 'GitHub', value: 'github'},
          {title: 'App Store', value: 'app-store'},
          {title: 'Google Play', value: 'google-play'},
          {title: 'Video', value: 'video'},
          {title: 'Other', value: 'other'},
        ],
        layout: 'radio',
      },
      initialValue: 'live',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (rule) =>
        rule.required().uri({
          scheme: ['http', 'https', 'mailto', 'tel'],
        }),
    }),
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'url',
    },
  },
})

const coverMediaType = defineType({
  name: 'coverMedia',
  title: 'Cover Media',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true, metadata: ['palette', 'lqip', 'blurhash']},
    }),
  ],
  preview: {
    select: {
      title: 'image.asset.originalFilename',
      media: 'image',
    },
  },
})

const externalLinkGalleryItemType = defineType({
  name: 'externalLinkGalleryItem',
  title: 'External Link Gallery Item',
  type: 'object',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'metadata', title: 'Metadata'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'linkType',
      title: 'Link Type',
      type: 'string',
      group: 'content',
      options: {
        list: [
          {title: 'QR Code', value: 'qr'},
          {title: 'URL', value: 'url'},
          {title: 'Hyperlink', value: 'hyperlink'},
        ],
        layout: 'radio',
      },
      initialValue: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      group: 'content',
      validation: (rule) =>
        rule.custom((value, context) => {
          if ((context.parent as ExternalLinkParent | undefined)?.linkType !== 'qr' && !value) {
            return 'A URL is required for URL and Hyperlink items.'
          }

          return true
        }),
    }),
    defineField({
      name: 'qrImage',
      title: 'QR Code Image',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      hidden: ({parent}) => parent?.linkType !== 'qr',
      validation: (rule) =>
        rule.custom((value, context) => {
          if ((context.parent as ExternalLinkParent | undefined)?.linkType === 'qr' && !value) {
            return 'A QR code image is required when link type is QR Code.'
          }

          return true
        }),
    }),
    defineField({
      name: 'showThumbnail',
      title: 'Show Thumbnail',
      type: 'boolean',
      group: 'metadata',
      initialValue: false,
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      group: 'metadata',
      options: {hotspot: true},
      hidden: ({parent}) => !parent?.showThumbnail,
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'text',
      rows: 3,
      group: 'metadata',
    }),
    defineField({
      ...deliverableTypeField,
      group: 'metadata',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'linkType',
      thumbnail: 'thumbnail',
      qrImage: 'qrImage',
    },
    prepare({title, subtitle, thumbnail, qrImage}) {
      return {
        title,
        subtitle,
        media: thumbnail || qrImage,
      }
    },
  },
})

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  groups: [
    {name: 'overview', title: 'Overview', default: true},
    {name: 'content', title: 'Content'},
    {name: 'media', title: 'Media'},
    {name: 'links', title: 'Links'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'overview',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      group: 'overview',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'projectType',
      title: 'Type',
      type: 'reference',
      to: [{type: 'taxonomyOption'}],
      group: 'overview',
      options: {
        filter: 'category == $category',
        filterParams: {category: 'project-type'},
      },
    }),
    defineField({
      name: 'projectSubtypes',
      title: 'Project Subtypes',
      type: 'array',
      group: 'overview',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'taxonomyOption'}],
          options: {
            filter: 'category == $category',
            filterParams: {category: 'project-subtype'},
          },
        }),
      ],
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'overview',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured Project',
      type: 'boolean',
      group: 'overview',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      group: 'overview',
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'reference',
      to: [{type: 'taxonomyOption'}],
      group: 'overview',
      options: {
        filter: 'category == $category',
        filterParams: {category: 'client'},
      },
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'reference',
      to: [{type: 'taxonomyOption'}],
      group: 'overview',
      options: {
        filter: 'category == $category',
        filterParams: {category: 'role'},
      },
    }),
    defineField({
      name: 'techStack',
      title: 'Tech Stack',
      type: 'array',
      group: 'overview',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'taxonomyOption'}],
          options: {
            filter: 'category == $category',
            filterParams: {category: 'tech-stack'},
          },
        }),
      ],
    }),
    defineField({
      name: 'skills',
      title: 'Skills',
      type: 'array',
      group: 'overview',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'taxonomyOption'}],
          options: {
            filter: 'category == $category',
            filterParams: {category: 'skill'},
          },
        }),
      ],
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      description: 'Short card/excerpt copy.',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'Longer plain-text overview for quick rendering.',
      type: 'text',
      rows: 6,
      group: 'content',
    }),
    defineField({
      name: 'content',
      title: 'Rich Content',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({type: 'block'}),
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'coverMedia',
      title: 'Cover Media',
      description: 'Primary thumbnail or hero image.',
      type: 'coverMedia',
      group: 'media',
    }),
    defineField({
      name: 'imageGallery',
      title: 'Image Gallery',
      description: 'Supports batch drag-and-drop upload with per-image metadata.',
      type: 'array',
      group: 'media',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true, metadata: ['palette', 'lqip', 'blurhash']},
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'text',
              rows: 3,
            }),
            defineField({
              ...deliverableTypeField,
              group: undefined,
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'videoGallery',
      title: 'Video Gallery',
      description: 'Supports batch drag-and-drop upload with per-video metadata.',
      type: 'array',
      group: 'media',
      of: [
        defineArrayMember({
          type: 'file',
          options: {accept: 'video/*'},
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'text',
              rows: 3,
            }),
            defineField({
              ...deliverableTypeField,
              group: undefined,
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'pdfGallery',
      title: 'PDF Gallery',
      description: 'Supports batch drag-and-drop upload with per-file metadata.',
      type: 'array',
      group: 'media',
      of: [
        defineArrayMember({
          type: 'file',
          options: {accept: 'application/pdf'},
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'text',
              rows: 3,
            }),
            defineField({
              ...deliverableTypeField,
              group: undefined,
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'externalLinkGallery',
      title: 'External Link Gallery',
      description: 'Gallery items for QR codes, URLs, and hyperlinks.',
      type: 'array',
      group: 'media',
      of: [defineArrayMember({type: 'externalLinkGalleryItem'})],
    }),
    defineField({
      name: 'links',
      title: 'Project Links',
      type: 'array',
      group: 'links',
      of: [defineArrayMember({type: 'projectLink'})],
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      group: 'seo',
      validation: (rule) => rule.max(70),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 4,
      group: 'seo',
      validation: (rule) => rule.max(160),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      projectSubtitle: 'subtitle',
      summary: 'summary',
      media: 'coverMedia.image',
    },
    prepare({title, projectSubtitle, summary, media}) {
      return {
        title,
        subtitle: projectSubtitle || summary,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Published At, New',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
    {
      title: 'Title, A-Z',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
  ],
})

export {
  coverMediaType,
  externalLinkGalleryItemType,
  projectLinkType,
}
