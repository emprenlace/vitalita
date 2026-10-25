import { defineField, defineType } from "sanity";

export const author = defineType({
  name: "author",
  title: "Autor",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nombre completo",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "URL del perfil",
      type: "slug",
      options: { source: "name" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "role",
      title: "Profesión",
      description: "Tal como figura en su título. Ej.: Fisioterapeuta",
      type: "string",
      initialValue: "Fisioterapeuta",
      validation: (r) => r.required(),
    }),
    defineField({ name: "university", title: "Universidad", type: "string" }),
    defineField({
      name: "isReviewer",
      title: "Puede firmar como revisor clínico",
      description: "Actívalo solo para fisioterapeutas con registro ReTHUS verificado.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "rethus",
      title: "Registro ReTHUS / Tarjeta profesional",
      description: "Interno: se verifica antes de aprobar al autor. No se publica.",
      type: "string",
    }),
    defineField({
      name: "photo",
      title: "Foto",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "bio",
      title: "Biografía corta",
      type: "text",
      rows: 4,
      validation: (r) => r.max(400),
    }),
    defineField({
      name: "links",
      title: "Perfiles profesionales",
      description: "Instagram, LinkedIn o web profesional.",
      type: "array",
      of: [{ type: "url" }],
    }),
  ],
  preview: { select: { title: "name", subtitle: "role", media: "photo" } },
});
