import { PRECIO_SESION, SERVICIO_NOMBRE, WHATSAPP_NUMBER } from "@/config/site";
import type { Attribution } from "./attribution";

export type ButtonOrigin =
  | "header"
  | "hero"
  | "techniques"
  | "pattern"
  | "assessment"
  | "timeline"
  | "testimonials"
  | "doctor"
  | "faq"
  | "pricing"
  | "location"
  | "closing"
  | "footer"
  | "sticky";

const INTRO = `Hola, quiero agendar mi ${SERVICIO_NOMBRE} en Barranquilla.`;

function line(label: string, value?: string) {
  return value && value.trim() ? `${label}: ${value.trim()}.` : null;
}

/** Joins labels as natural Spanish: "cuello, hombros y zona lumbar". */
export function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

export function buildMessage(attr: Attribution, zones: string[] = []): string {
  const blocks: string[] = [INTRO];
  if (zones.length) blocks.push(`Siento más carga en: ${joinList(zones)}.`);

  const meta = [
    `Precio informado: desde ${PRECIO_SESION.label}.`,
    attr.seg === "deporte" ? "Interés: atención para deportistas." : null,
    line("Campaña", attr.utm_campaign),
    line("Contenido del anuncio", attr.utm_content),
    line("Fuente", attr.utm_source),
  ].filter(Boolean);
  blocks.push(meta.join("\n"));

  blocks.push("¿Me ayudan a coordinar un horario?");
  return blocks.join("\n\n");
}

export function buildWhatsAppUrl(message: string, number = WHATSAPP_NUMBER): string {
  const n = number.replace(/\D/g, "");
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}
