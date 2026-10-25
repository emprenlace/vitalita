export type Attribution = {
  utm_source?: string;
  utm_campaign?: string;
  utm_content?: string;
  seg?: string;
};

const KEY = "vitalita_attr";
const FIELDS = ["utm_source", "utm_campaign", "utm_content", "seg"] as const;

/** Merge new URL params over stored ones without overwriting with empty strings. */
export function mergeAttribution(stored: Attribution, search: string): Attribution {
  const params = new URLSearchParams(search);
  const out: Attribution = { ...stored };
  for (const f of FIELDS) {
    const v = params.get(f)?.trim();
    if (v) out[f] = v.slice(0, 120);
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
