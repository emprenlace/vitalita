import { esESLocale } from "@sanity/locale-es-es";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool, type StructureResolver } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";

/** Sidebar grouped by review state, so Néstor sees what's waiting for him first. */
const structure: StructureResolver = (S) =>
  S.list()
    .title("Blog de Vitalita")
    .items([
      S.listItem()
        .title("Pendientes de revisión")
        .child(
          S.documentList()
            .title("En revisión")
            .filter('_type == "post" && reviewStatus == "revision"'),
        ),
      S.listItem()
        .title("Requieren cambios")
        .child(
          S.documentList()
            .title("Requieren cambios")
            .filter('_type == "post" && reviewStatus == "cambios"'),
        ),
      S.listItem()
        .title("Publicados en la web")
        .child(
          S.documentList()
            .title("Aprobados")
            .filter('_type == "post" && reviewStatus == "aprobado"'),
        ),
      S.divider(),
      S.documentTypeListItem("post").title("Todos los artículos"),
      S.documentTypeListItem("author").title("Autores"),
      S.documentTypeListItem("category").title("Categorías"),
    ]);

export default defineConfig({
  name: "vitalita",
  title: "Vitalita · Blog",
  projectId: "815xxsit",
  dataset: "production",
  plugins: [structureTool({ structure }), visionTool(), esESLocale()],
  schema: { types: schemaTypes },
});
