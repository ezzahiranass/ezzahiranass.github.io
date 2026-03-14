import {defineArrayMember, defineField, defineType} from 'sanity'

type ProjectMediaParent = {
  mediaType?: string
}

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

const projectMediaType = defineType({
  name: 'projectMedia',
  title: 'Project Media',
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
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      group: 'content',
      options: {
        list: [
          {title: 'Image', value: 'image'},
          {title: 'Uploaded Video', value: 'video'},
          {title: 'External Video', value: 'externalVideo'},
          {title: 'Embed / iframe', value: 'embed'},
          {title: 'QR Code', value: 'qr'},
        ],
        layout: 'radio',
      },
      initialValue: 'image',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      group: 'content',
      options: {hotspot: true, metadata: ['palette', 'lqip', 'blurhash']},
      hidden: ({parent}) => parent?.mediaType !== 'image',
    }),
    defineField({
      name: 'videoFile',
      title: 'Video File',
      type: 'file',
      group: 'content',
      options: {accept: 'video/*'},
      hidden: ({parent}) => parent?.mediaType !== 'video',
      validation: (rule) =>
        rule.custom((value, context) => {
          if ((context.parent as ProjectMediaParent | undefined)?.mediaType === 'video' && !value) {
            return 'A video file is required when media type is Uploaded Video.'
          }

          return true
        }),
    }),
    defineField({
      name: 'externalVideoUrl',
      title: 'External Video URL',
      type: 'url',
      group: 'content',
      hidden: ({parent}) => parent?.mediaType !== 'externalVideo',
      validation: (rule) =>
        rule.custom((value, context) => {
          if (
            (context.parent as ProjectMediaParent | undefined)?.mediaType === 'externalVideo' &&
            !value
          ) {
            return 'A URL is required when media type is External Video.'
          }

          return true
        }),
    }),
    defineField({
      name: 'embedUrl',
      title: 'Embed URL',
      description: 'Use trusted embeddable sources only.',
      type: 'url',
      group: 'content',
      hidden: ({parent}) => parent?.mediaType !== 'embed',
      validation: (rule) =>
        rule.custom((value, context) => {
          if ((context.parent as ProjectMediaParent | undefined)?.mediaType === 'embed' && !value) {
            return 'An embed URL is required when media type is Embed / iframe.'
          }

          return true
        }),
    }),
    defineField({
      name: 'embedAspectRatio',
      title: 'Embed Aspect Ratio',
      type: 'string',
      group: 'content',
      options: {
        list: [
          {title: '16:9', value: '16 / 9'},
          {title: '4:3', value: '4 / 3'},
          {title: '1:1', value: '1 / 1'},
          {title: '9:16', value: '9 / 16'},
        ],
      },
      initialValue: '16 / 9',
      hidden: ({parent}) => parent?.mediaType !== 'embed',
    }),
    defineField({
      name: 'qrImage',
      title: 'QR Code Image',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      hidden: ({parent}) => parent?.mediaType !== 'qr',
      validation: (rule) =>
        rule.custom((value, context) => {
          if ((context.parent as ProjectMediaParent | undefined)?.mediaType === 'qr' && !value) {
            return 'A QR code image is required when media type is QR Code.'
          }

          return true
        }),
    }),
    defineField({
      name: 'qrTargetUrl',
      title: 'QR Target URL',
      type: 'url',
      group: 'content',
      hidden: ({parent}) => parent?.mediaType !== 'qr',
      validation: (rule) =>
        rule.custom((value, context) => {
          if ((context.parent as ProjectMediaParent | undefined)?.mediaType === 'qr' && !value) {
            return 'Add the URL that the QR code points to.'
          }

          return true
        }),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'text',
      rows: 3,
      group: 'content',
    }),
    defineField({
      name: 'alt',
      title: 'Alt Text',
      description: 'Used for accessibility when this media is rendered as an image or thumbnail.',
      type: 'string',
      group: 'metadata',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'credit',
      title: 'Credit',
      type: 'string',
      group: 'metadata',
    }),
    defineField({
      name: 'copyright',
      title: 'Copyright / License',
      type: 'string',
      group: 'metadata',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Media',
      type: 'boolean',
      group: 'metadata',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      mediaType: 'mediaType',
      image: 'image',
      qrImage: 'qrImage',
    },
    prepare({title, mediaType, image, qrImage}) {
      return {
        title,
        subtitle: mediaType,
        media: image || qrImage,
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
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'overview',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Published', value: 'published'},
          {title: 'Archived', value: 'archived'},
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
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
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              validation: (rule) => rule.max(160),
            }),
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
      description: 'Primary thumbnail or hero asset.',
      type: 'projectMedia',
      group: 'media',
    }),
    defineField({
      name: 'mediaGallery',
      title: 'Media Gallery',
      type: 'array',
      group: 'media',
      of: [defineArrayMember({type: 'projectMedia'})],
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
      qrMedia: 'coverMedia.qrImage',
    },
    prepare({title, projectSubtitle, summary, media, qrMedia}) {
      return {
        title,
        subtitle: projectSubtitle || summary,
        media: media || qrMedia,
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

export {projectLinkType, projectMediaType}
