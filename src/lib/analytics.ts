import { GTM_ID, META_PIXEL_ID } from "@/config/site";

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

export type EventName =
  | "PageView"
  | "ViewContent"
  | "Contact"
  | "BookingDialogOpen"
  | "ServiceAreaNotice"
  | "AgencyClick";

const ALLOWED = new Set([
  "page_name",
  "cta_location",
  "city_status",
  "segment",
  "service_name",
  "value",
  "currency",
  "utm_source",
  "utm_campaign",
  "utm_content",
]);

const EVENT_KEYS: Record<EventName, string> = {
  PageView: "page_view",
  ViewContent: "view_content",
  Contact: "whatsapp_click",
  BookingDialogOpen: "booking_dialog_open",
  ServiceAreaNotice: "service_area_notice",
  AgencyClick: "agency_click",
};

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

export function track(event: EventName, params: Params = {}, dedupeKey?: string) {
  if (typeof window === "undefined") return;
  const key = dedupeKey ?? (event === "PageView" || event === "ViewContent" ? event : undefined);
  if (key && fired.has(key)) return;
  if (key) fired.add(key);

  const eventKey = EVENT_KEYS[event];
  const clean = sanitize(params);
  const w = window as W;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({
    event: `vitalita_${eventKey}`,
    event_name: event,
    event_id: `vitalita_${Date.now()}_${++eventSequence}`,
    event_source: "website",
    event_version: 1,
    event_time: Math.floor(Date.now() / 1000),
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
