/**
 * Recibe el lead del formulario "Arma tu sesión" y lo reparte:
 * 1. Google Sheets (base de la clínica): contacto completo + atribución.
 * 2. API de Conversiones de Meta: solo leads A y B, como `Contact`, con el contacto cifrado
 *    en SHA-256 y el mismo `event_id` del píxel para que Meta no lo cuente doble.
 *
 * Variables de entorno (Vercel → Settings → Environment Variables):
 * - LEADS_SHEET_URL       URL de la aplicación web de Apps Script (docs/leads-apps-script.gs)
 * - META_DATASET_ID       ID del conjunto de datos (píxel) de Meta
 * - META_CAPI_TOKEN       Token de acceso de la API de Conversiones
 * - META_TEST_EVENT_CODE  Opcional: código de "Probar eventos" para pruebas
 * - META_GRAPH_VERSION    Opcional: versión de la API Graph (por defecto v24.0)
 * Sin estas variables no se envía nada: en local el lead solo se valida.
 */
import { SESIONES, SITE_URL } from "@/config/site";
import {
  QUALITY_BY_TIMING,
  TIMINGS,
  contactErrors,
  hashUserData,
  isConversion,
  normalizePhone,
  type CityStatus,
  type Contact,
  type Timing,
} from "@/lib/lead";

export type LeadInput = {
  ref: string;
  sesion: string;
  timing: string;
  cityStatus: string;
  contact: Contact;
  cta: string;
  page: string;
  pageUrl: string;
  attribution: Record<string, string | undefined>;
  fbp?: string;
  fbc?: string;
  /** Campo trampa: los robots lo llenan, las personas no lo ven. */
  empresa?: string;
};

type Env = {
  LEADS_SHEET_URL?: string | undefined;
  META_DATASET_ID?: string | undefined;
  META_CAPI_TOKEN?: string | undefined;
  META_TEST_EVENT_CODE?: string | undefined;
  META_GRAPH_VERSION?: string | undefined;
};
type RequestInfo = { ip?: string | undefined; userAgent?: string | undefined };
type Fetch = typeof fetch;

const REF_RE = /^VT-[A-Z0-9]{5}-[1-3]$/;
const ATTR_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
  "landing_page",
] as const;

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export type ValidLead = {
  ref: string;
  sesion: (typeof SESIONES)[number];
  timing: Timing;
  cityStatus: CityStatus;
  quality: "A" | "B" | "C";
  contact: Contact;
  phoneE164: string;
  cta: string;
  page: string;
  pageUrl: string;
  attribution: Record<string, string>;
  fbp?: string | undefined;
  fbc?: string | undefined;
};

export function validateLead(body: unknown): ValidLead | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Partial<LeadInput>;
  const sesion = SESIONES.find((s) => s.id === b.sesion);
  const timing = TIMINGS.find((t) => t.id === b.timing)?.id;
  const cityStatus: CityStatus | null =
    b.cityStatus === "barranquilla" || b.cityStatus === "outside_barranquilla"
      ? b.cityStatus
      : null;
  const contact: Contact = {
    name: str(b.contact?.name, 120),
    phone: str(b.contact?.phone, 40),
    email: str(b.contact?.email, 160),
    dial: str(b.contact?.dial, 4) || "57",
  };
  const ref = str(b.ref, 20);
  if (!sesion || !timing || !cityStatus || !REF_RE.test(ref)) return null;
  const errors = contactErrors(contact);
  if (errors.name || errors.phone || errors.email) return null;

  const quality = QUALITY_BY_TIMING[timing];
  // La calidad va en la referencia: si no coincide con las respuestas, el lead no es fiable.
  if (!ref.endsWith(`-${{ A: 1, B: 2, C: 3 }[quality]}`)) return null;

  const attribution: Record<string, string> = {};
  for (const k of ATTR_KEYS) {
    const v = str(b.attribution?.[k]);
    if (v) attribution[k] = v;
  }
  const pageUrl = str(b.pageUrl, 500);
  return {
    ref,
    sesion,
    timing,
    cityStatus,
    quality,
    contact,
    phoneE164: normalizePhone(contact.phone, contact.dial)!,
    cta: str(b.cta, 40),
    page: str(b.page, 200),
    pageUrl:
      pageUrl.startsWith(SITE_URL) || pageUrl.startsWith("http://localhost") ? pageUrl : SITE_URL,
    attribution,
    fbp: str(b.fbp) || undefined,
    fbc: str(b.fbc) || undefined,
  };
}

/** Fila para la hoja de la clínica. La columna `estado_cita` la llena la clínica. */
export function sheetRow(lead: ValidLead) {
  return {
    ref: lead.ref,
    calidad: lead.quality,
    servicio: lead.sesion.mensaje,
    precio: lead.sesion.precio,
    cuando: TIMINGS.find((t) => t.id === lead.timing)?.label ?? "",
    ciudad: lead.cityStatus === "barranquilla" ? "Barranquilla" : "Otra ciudad (puede viajar)",
    nombre: lead.contact.name,
    whatsapp: lead.phoneE164,
    correo: lead.contact.email.toLowerCase(),
    boton: lead.cta,
    pagina: lead.page,
    ...lead.attribution,
    fbp: lead.fbp ?? "",
    fbc: lead.fbc ?? "",
  };
}

/**
 * Evento `Contact` para la API de Conversiones. Sin datos de salud: ni zona, ni servicio,
 * ni horario; solo el valor de la sesión y el contacto cifrado.
 */
export function capiEvent(lead: ValidLead, request: RequestInfo) {
  const hashed = hashUserData(lead.contact, lead.cityStatus);
  const user_data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(hashed)) if (v) user_data[k] = [v];
  if (request.ip) user_data["client_ip_address"] = request.ip;
  if (request.userAgent) user_data["client_user_agent"] = request.userAgent;
  if (lead.fbp) user_data["fbp"] = lead.fbp;
  if (lead.fbc) user_data["fbc"] = lead.fbc;
  return {
    event_name: "Contact",
    event_time: Math.floor(Date.now() / 1000),
    event_id: lead.ref,
    action_source: "website",
    event_source_url: lead.pageUrl,
    user_data,
    custom_data: { value: lead.sesion.precio, currency: "COP" },
  };
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let t: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    p,
    new Promise<T>((_, reject) => {
      t = setTimeout(() => reject(new Error(`timeout ${ms}ms`)), ms);
    }),
  ]).finally(() => clearTimeout(t));
}

export async function handleLead(
  body: unknown,
  request: RequestInfo,
  env: Env,
  doFetch: Fetch = fetch,
): Promise<{ status: number; json: Record<string, unknown> }> {
  if (body && typeof body === "object" && str((body as LeadInput).empresa)) {
    return { status: 200, json: { ok: true } };
  }
  const lead = validateLead(body);
  if (!lead) return { status: 400, json: { ok: false, error: "datos incompletos" } };

  const jobs: Promise<string>[] = [];

  if (env.LEADS_SHEET_URL) {
    jobs.push(
      withTimeout(
        doFetch(env.LEADS_SHEET_URL, {
          method: "POST",
          headers: { "content-type": "text/plain;charset=UTF-8" },
          body: JSON.stringify(sheetRow(lead)),
        }),
        6000,
      ).then((r) => `sheet:${r.status}`),
    );
  }

  if (isConversion(lead.quality) && env.META_DATASET_ID && env.META_CAPI_TOKEN) {
    const version = env.META_GRAPH_VERSION || "v24.0";
    const url = `https://graph.facebook.com/${version}/${encodeURIComponent(env.META_DATASET_ID)}/events?access_token=${encodeURIComponent(env.META_CAPI_TOKEN)}`;
    const payload: Record<string, unknown> = { data: [capiEvent(lead, request)] };
    if (env.META_TEST_EVENT_CODE) payload["test_event_code"] = env.META_TEST_EVENT_CODE;
    jobs.push(
      withTimeout(
        doFetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        }),
        5000,
      ).then(async (r) => {
        if (!r.ok) console.error("[lead] Meta respondió", r.status, await r.text().catch(() => ""));
        return `meta:${r.status}`;
      }),
    );
  }

  const results = await Promise.allSettled(jobs);
  const sent = results.map((r) => (r.status === "fulfilled" ? r.value : `error:${r.reason}`));
  for (const r of results) if (r.status === "rejected") console.error("[lead]", lead.ref, r.reason);
  return { status: 200, json: { ok: true, ref: lead.ref, sent } };
}
