import { GTM_ID, META_PIXEL_ID } from "@/config/site";
import { isSha256, type HashedUserData } from "./lead";

type Params = Record<string, string | number | boolean | undefined>;
type W = Window & {
  dataLayer?: Record<string, unknown>[];
  fbq?: (...a: unknown[]) => void;
  _fbq?: unknown;
};
type PixelStub = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: (...args: unknown[]) => void;
  loaded: boolean;
  version: string;
};

/**
 * Catálogo de eventos. El detalle (cuándo, parámetros, si es conversión y cómo se
 * conecta en GTM) está en docs/capa-de-datos.md. Un evento nuevo se agrega aquí y allá.
 */
export type EventName =
  | "PageView"
  | "ViewContent"
  | "BookingDialogOpen"
  | "LeadStep"
  | "ServiceAreaNotice"
  | "LeadSubmit"
  | "Contact"
  | "BookingDialogClose"
  | "AgencyClick";

/** Contexto de página: se conserva entre eventos. */
const PAGE_KEYS = ["page_name", "page_path", "segment"] as const;

/** Parámetros de evento: se vacían en cada push para que GTM no arrastre los del anterior. */
const EVENT_PARAM_KEYS = [
  "cta_location",
  "city_status",
  "service_name",
  "service_id",
  "session_preset",
  "step",
  "answer",
  "lead_quality",
  "lead_ref",
  "lead_timing",
  "value",
  "currency",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

/**
 * Lista de permitidos: nada fuera de aquí llega a la capa de datos. Datos de salud
 * (zonas del cuerpo, molestias) y contacto sin cifrar nunca están en esta lista.
 */
const ALLOWED = new Set<string>([...PAGE_KEYS, ...EVENT_PARAM_KEYS]);

const EVENT_KEYS: Record<EventName, string> = {
  PageView: "page_view",
  ViewContent: "view_content",
  BookingDialogOpen: "form_abierto",
  LeadStep: "form_paso",
  ServiceAreaNotice: "form_fuera_de_zona",
  LeadSubmit: "lead",
  Contact: "lead_calificado",
  BookingDialogClose: "form_cerrado",
  AgencyClick: "agency_click",
};

type TrackOptions = {
  /** Evita repetir el evento con la misma llave en la visita. */
  dedupeKey?: string;
  /** Identificador compartido con la API de Conversiones para que Meta no cuente doble. */
  eventId?: string;
  /** Contacto cifrado en SHA-256. Cualquier valor que no sea un hash se descarta. */
  userData?: HashedUserData;
};

export function cleanUserData(u: HashedUserData = {}): HashedUserData | undefined {
  const out: HashedUserData = {};
  for (const [k, v] of Object.entries(u) as [keyof HashedUserData, unknown][]) {
    if (isSha256(v)) out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

export function sanitize(p: Params = {}): Params {
  const out: Params = {};
  for (const [k, v] of Object.entries(p)) {
    if (ALLOWED.has(k) && v !== undefined && v !== "") out[k] = v;
  }
  return out;
}

let loaded = false;
let eventSequence = 0;
const fired = new Set<string>();

export function initAnalytics() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const w = window as W;
  w.dataLayer = w.dataLayer || [];

  if (GTM_ID) {
    w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
    document.head.appendChild(s);
  } else if (META_PIXEL_ID) {
    bootstrapPixel(w);
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
    w.fbq!("init", META_PIXEL_ID);
  }
}

function bootstrapPixel(w: W) {
  const n: PixelStub = (...args) => {
    if (n.callMethod) n.callMethod(...args);
    else n.queue.push(args);
  };
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  w.fbq = n;
  if (!w._fbq) w._fbq = n;
}

export function track(event: EventName, params: Params = {}, options: string | TrackOptions = {}) {
  if (typeof window === "undefined") return;
  const opts: TrackOptions = typeof options === "string" ? { dedupeKey: options } : options;
  const key =
    opts.dedupeKey ?? (event === "PageView" || event === "ViewContent" ? event : undefined);
  if (key && fired.has(key)) return;
  if (key) fired.add(key);

  const eventKey = EVENT_KEYS[event];
  const clean = sanitize(params);
  const cleared = Object.fromEntries(EVENT_PARAM_KEYS.map((k) => [k, undefined]));
  const w = window as W;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({
    event: `vitalita_${eventKey}`,
    event_name: event,
    event_id: opts.eventId ?? `vitalita_${Date.now()}_${++eventSequence}`,
    event_source: "website",
    event_version: 2,
    event_time: Math.floor(Date.now() / 1000),
    ...cleared,
    user_data: cleanUserData(opts.userData),
    ...clean,
  });

  if (!GTM_ID && META_PIXEL_ID && w.fbq) {
    if (event === "PageView" || event === "ViewContent" || event === "Contact") {
      w.fbq("track", event, clean);
    } else {
      w.fbq("trackCustom", `Vitalita${event}`, clean);
    }
  }
}
