import { defineArrayMember, defineField, defineType } from "sanity";

/** Article body: headings, lists, links, images and highlighted callouts. */
export const blockContent = defineType({
  name: "blockContent",
  title: "Contenido",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Párrafo", value: "normal" },
        { title: "Subtítulo (H2)", value: "h2" },
        { title: "Subtítulo menor (H3)", value: "h3" },
        { title: "Cita", value: "blockquote" },
      ],
      lists: [
        { title: "Viñetas", value: "bullet" },
        { title: "Numerada", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Negrita", value: "strong" },
          { title: "Cursiva", value: "em" },
        ],
        annotations: [
          defineArrayMember({
            name: "link",
            type: "object",
            title: "Enlace",
            fields: [
              defineField({
                name: "href",
                title: "URL",
                type: "url",
                validation: (r) =>
                  r.uri({ allowRelative: true, scheme: ["http", "https", "mailto", "tel"] }),
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      title: "Imagen",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Descripción (alt)",
          type: "string",
          validation: (r) => r.required(),
        }),
        defineField({ name: "caption", title: "Pie de foto", type: "string" }),
      ],
    }),
    defineArrayMember({
      type: "object",
      name: "callout",
      title: "Recuadro destacado",
      fields: [
        defineField({
          name: "tone",
          title: "Tipo",
          type: "string",
          options: {
            list: [
              { title: "Consejo", value: "tip" },
              { title: "Cuándo consultar", value: "warning" },
            ],
            layout: "radio",
          },
          initialValue: "tip",
        }),
        defineField({ name: "title", title: "Título", type: "string" }),
        defineField({
          name: "text",
          title: "Texto",
          type: "text",
          rows: 3,
          validation: (r) => r.required(),
        }),
      ],
      preview: { select: { title: "title", subtitle: "text" } },
    }),
  ],
});
