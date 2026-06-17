import { defineType, defineField } from "sanity";

/**
 * `page` document — a routable page whose layout is authored in Puck.
 *
 * The drag-and-drop layout lives in `puckData` as a stringified Puck JSON
 * document (Puck's `Data` shape, JSON.stringify'd). The public render pipeline
 * (PuckRender) parses it; when absent it falls back to local content. Field
 * names here intentionally mirror the `src/content/*` ↔ Puck contract.
 */
export const page = defineType({
  name: "page",
  title: "Page",
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
      name: "puckData",
      title: "Puck layout (JSON)",
      type: "text",
      description:
        "Stringified Puck JSON describing the drag-and-drop layout. Edited via the /edit canvas — not by hand. Leave empty to fall back to local content.",
      rows: 8,
    }),
    defineField({
      name: "seo",
      title: "SEO",
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
    select: { title: "title", subtitle: "slug.current" },
  },
});
