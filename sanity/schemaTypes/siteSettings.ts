import { defineType, defineField } from "sanity";

/**
 * `siteSettings` — singleton-style document holding brand-wide settings:
 * brand identity, contact details, social links and default SEO. Intended to
 * exist as a single document (enforced in the Studio structure / desk tool).
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Brand title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Brand description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "contact",
      title: "Contact",
      type: "object",
      fields: [
        defineField({ name: "email", title: "Email", type: "string" }),
        defineField({ name: "phone", title: "Phone", type: "string" }),
        defineField({ name: "address", title: "Address", type: "text", rows: 2 }),
      ],
    }),
    defineField({
      name: "social",
      title: "Social links",
      type: "array",
      of: [
        defineField({
          name: "socialLink",
          title: "Social link",
          type: "object",
          fields: [
            defineField({
              name: "platform",
              title: "Platform",
              type: "string",
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
            }),
          ],
          preview: {
            select: { title: "platform", subtitle: "url" },
          },
        }),
      ],
    }),
    defineField({
      name: "seo",
      title: "Default SEO",
      type: "object",
      fields: [
        defineField({
          name: "metaTitle",
          title: "Meta title",
          type: "string",
        }),
        defineField({
          name: "metaDescription",
          title: "Meta description",
          type: "text",
          rows: 3,
        }),
        defineField({
          name: "ogImage",
          title: "Open Graph image",
          type: "image",
          options: { hotspot: true },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site settings" }),
  },
});
