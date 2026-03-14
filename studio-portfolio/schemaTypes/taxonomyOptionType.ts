import {defineField, defineType} from 'sanity'

export const taxonomyOptionType = defineType({
  name: 'taxonomyOption',
  title: 'Taxonomy Option',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Client', value: 'client'},
          {title: 'Deliverable Type', value: 'deliverable-type'},
          {title: 'Project Type', value: 'project-type'},
          {title: 'Project Subtype', value: 'project-subtype'},
          {title: 'Role', value: 'role'},
          {title: 'Skill', value: 'skill'},
          {title: 'Tech Stack', value: 'tech-stack'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
    },
  },
})
