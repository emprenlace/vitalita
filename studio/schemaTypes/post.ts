import { defineArrayMember, defineField, defineType } from "sanity";
import { APPROVER_EMAILS } from "../approvers";

/** Review states. Only "aprobado" posts ever appear on vitalita.com.co; only APPROVER_EMAILS can set it. */
export const REVIEW_STATES = [
  { title: "Borrador", value: "borrador" },
  { title: "En revisión", value: "revision" },
  { title: "Aprobado para publicar", value: "aprobado" },
  { title: "Requiere cambios", value: "cambios" },
];

export const post = defineType({
  name: "post",
  title: "Artículo",
  type: "document",
  groups: [
    { name: "contenido", title: "Contenido", default: true },
    { name: "seo", title: "SEO" },
    { name: "revision", title: "Revisión clínica" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Título del artículo (H1)",
      type: "string",
      group: "contenido",
      validation: (r) => r.required().max(90),
    }),
    defineField({
      name: "slug",
      title: "URL",
      description: "Se genera desde el título. Ej.: dolor-cervical-por-el-celular",
      type: "slug",
      group: "contenido",
      options: { source: "title", maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Resumen",
      description: "2–3 frases. Se muestra en el listado del blog.",
      type: "text",
      rows: 3,
      group: "contenido",
      validation: (r) => r.required().max(240),
    }),
    defineField({
      name: "mainImage",
      title: "Imagen principal",
      type: "image",
      group: "contenido",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Descripción de la imagen (alt)",
          type: "string",
          validation: (r) => r.required(),
        }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Categoría",
      type: "reference",
      to: [{ type: "category" }],
      group: "contenido",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "author",
      title: "Autor",
      type: "reference",
      to: [{ type: "author" }],
      group: "contenido",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "body",
      title: "Contenido",
      type: "blockContent",
      group: "contenido",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "faqs",
      title: "Preguntas frecuentes",
      description: "Opcional. Aparecen al final y ayudan a salir en Google.",
      type: "array",
      group: "contenido",
      of: [
        defineArrayMember({
          type: "object",
          name: "faq",
          fields: [
            defineField({
              name: "q",
              title: "Pregunta",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "a",
              title: "Respuesta",
              type: "text",
              rows: 3,
              validation: (r) => r.required(),
            }),
          ],
          preview: { select: { title: "q" } },
        }),
      ],
    }),
    defineField({
      name: "references",
      title: "Fuentes",
      description: "Estudios, guías o fuentes que respaldan el artículo.",
      type: "array",
      group: "contenido",
      of: [
        defineArrayMember({
          type: "object",
          name: "source",
          fields: [
            defineField({
              name: "label",
              title: "Fuente",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({ name: "url", title: "Enlace", type: "url" }),
          ],
          preview: { select: { title: "label", subtitle: "url" } },
        }),
      ],
    }),

    // SEO
    defineField({
      name: "seoTitle",
      title: "Título para Google",
      description: "Máximo 60 caracteres. Si se deja vacío se usa el título del artículo.",
      type: "string",
      group: "seo",
      validation: (r) => r.max(60).warning("Google corta los títulos de más de 60 caracteres"),
    }),
    defineField({
      name: "seoDescription",
      title: "Descripción para Google",
      description:
        "Entre 120 y 155 caracteres. Incluye la palabra clave y una invitación a agendar.",
      type: "text",
      rows: 3,
      group: "seo",
      validation: (r) => [
        r.required(),
        r.max(155).warning("Google corta las descripciones de más de 155 caracteres"),
        r.min(110).warning("Muy corta: aprovecha hasta 155 caracteres"),
      ],
    }),
    defineField({
      name: "keyword",
      title: "Palabra clave principal",
      description: "Una por artículo, para no competir entre artículos. Ej.: cervicalgia",
      type: "string",
      group: "seo",
      validation: (r) => r.required(),
    }),

    // Clinical review
    defineField({
      name: "reviewer",
      title: "Revisado por (fisioterapeuta)",
      description:
        "El fisioterapeuta que verificó el contenido clínico. Aparece en la web como “Revisado por…”.",
      type: "reference",
      to: [{ type: "author" }],
      options: { filter: "isReviewer == true" },
      group: "revision",
      validation: (r) =>
        r.custom((value, ctx) =>
          ctx.document?.reviewStatus === "aprobado" && !value
            ? "Indica qué fisioterapeuta revisó el artículo"
            : true,
        ),
    }),
    defineField({
      name: "reviewStatus",
      title: "Estado de revisión",
      description:
        "Solo los artículos aprobados se publican en la web. Solo los aprobadores autorizados pueden marcar “Aprobado”.",
      type: "string",
      group: "revision",
      options: { list: REVIEW_STATES, layout: "radio" },
      initialValue: "borrador",
      // Once approved, only approvers can change the state again.
      readOnly: ({ document, currentUser }) =>
        document?.reviewStatus === "aprobado" &&
        !APPROVER_EMAILS.includes(currentUser?.email?.toLowerCase() ?? ""),
      validation: (r) => [
        r.required(),
        r.custom(async (value, ctx) => {
          if (value !== "aprobado") return true;
          const me = await ctx
            .getClient({ apiVersion: "2025-01-01" })
            .request<{ email?: string }>({ uri: "/users/me" })
            .catch(() => ({ email: "" }));
          return APPROVER_EMAILS.includes(me.email?.toLowerCase() ?? "")
            ? true
            : "Solo los aprobadores autorizados (Néstor o la administración) pueden aprobar. Usa “En revisión”.";
        }),
      ],
    }),
    defineField({
      name: "reviewNotes",
      title: "Comentarios del revisor",
      type: "text",
      rows: 4,
      group: "revision",
    }),
    defineField({
      name: "reviewedAt",
      title: "Fecha de revisión clínica",
      type: "date",
      group: "revision",
      hidden: ({ document }) => document?.reviewStatus !== "aprobado",
      validation: (r) =>
        r.custom((value, ctx) =>
          ctx.document?.reviewStatus === "aprobado" && !value
            ? "Indica la fecha de la revisión clínica"
            : true,
        ),
    }),
    defineField({
      name: "publishedAt",
      title: "Fecha de publicación",
      type: "datetime",
      group: "revision",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  orderings: [
    {
      title: "Más recientes",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", status: "reviewStatus", author: "author.name", media: "mainImage" },
    prepare({ title, status, author, media }) {
      const label = REVIEW_STATES.find((s) => s.value === status)?.title ?? "Borrador";
      return { title, subtitle: `${label}${author ? ` · ${author}` : ""}`, media };
    },
  },
});
