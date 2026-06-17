import { defineType, defineField } from "sanity";

/**
 * `project` — a portfolio project / case study ("Referenca").
 * NOTE: the document type is named `project`, NOT `reference` — "reference" is a
 * RESERVED type name in Sanity (the built-in reference field type) and cannot be
 * used as a document type name.
 */
export const project = defineType({
  name: "project",
  title: "Referenca (projekt)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "location", media: "images.0" },
  },
});
