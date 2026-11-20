export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  gclid?: string;
  seg?: string;
  /** Primera página que vio en esta visita. */
  landing_page?: string;
};

const KEY = "vitalita_attr";
const FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
  "seg",
] as const;

/** Merge new URL params over stored ones without overwriting with empty strings. */
export function mergeAttribution(stored: Attribution, search: string): Attribution {
  const params = new URLSearchParams(search);
  const out: Attribution = { ...stored };
  for (const f of FIELDS) {
    const v = params.get(f)?.trim();
    if (v) out[f] = v.slice(0, 200);
  }
  return out;
}

export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  let stored: Attribution = {};
  try {
    stored = JSON.parse(sessionStorage.getItem(KEY) || "{}");
  } catch {
    stored = {};
  }
  const merged = mergeAttribution(stored, window.location.search);
  if (!merged.landing_page) merged.landing_page = window.location.pathname;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(merged));
  } catch {
    /* storage unavailable */
  }
  return merged;
}

export function getSegment(a: Attribution): "deporte" | "general" {
  return a.seg === "deporte" ? "deporte" : "general";
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const hit = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : undefined;
}

/**
 * Identificadores del navegador y del clic de Meta (`_fbp`, `_fbc`). Si el píxel aún no
 * creó `_fbc` pero la visita llegó con `fbclid`, se arma con el formato de Meta.
 */
export function metaBrowserIds(a: Attribution): { fbp?: string; fbc?: string } {
  const fbp = readCookie("_fbp");
  const fbc = readCookie("_fbc") ?? (a.fbclid ? `fb.1.${Date.now()}.${a.fbclid}` : undefined);
  return { ...(fbp ? { fbp } : {}), ...(fbc ? { fbc } : {}) };
}
