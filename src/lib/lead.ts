/**
 * Lógica del formulario "Arma tu sesión": calidad del lead, referencia, validación del
 * contacto, mensaje de WhatsApp y datos cifrados para Meta. Sin APIs del navegador:
 * la usan el cliente y la función del servidor.
 */
import { SESIONES, type SesionId } from "@/config/site";
import { sha256 } from "./sha256";
import { joinList } from "./whatsapp";

export type Timing = "esta_semana" | "proxima_semana" | "averiguando";
export type CityStatus = "barranquilla" | "outside_barranquilla";
/** A: viene esta semana · B: la próxima · C: solo está averiguando. */
export type LeadQuality = "A" | "B" | "C";

export const TIMINGS: { id: Timing; label: string; message: string }[] = [
  { id: "esta_semana", label: "Esta semana", message: "esta semana" },
  { id: "proxima_semana", label: "La próxima semana", message: "la próxima semana" },
  { id: "averiguando", label: "Solo estoy averiguando", message: "" },
];

/** Hora de cierre de la clínica: lunes a viernes 6:00 p. m., sábado 3:00 p. m., domingo cerrado. */
const CLOSING_HOUR = [0, 18, 18, 18, 18, 18, 15];

/**
 * Días reales de cada opción, calculados con la fecha de quien abre el formulario: cambian
 * solos cada día. "Esta semana" empieza hoy si la clínica sigue abierta; si ya cerró (o es
 * domingo), empieza el siguiente día hábil.
 */
export function timingDays(timing: Timing, now = new Date()) {
  if (timing === "averiguando") return null;
  const day = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  let start = day(now, 0);
  if (now.getHours() >= (CLOSING_HOUR[now.getDay()] ?? 0)) start = day(start, 1);
  if (start.getDay() === 0) start = day(start, 1);
  let end = day(start, 6 - start.getDay());
  if (timing === "proxima_semana") {
    start = day(end, 2);
    end = day(start, 5);
  }
  const weekday = (d: Date) => d.toLocaleDateString("es-CO", { weekday: "long" });
  const range =
    start.getTime() === end.getTime()
      ? `El ${weekday(start)} ${start.getDate()}`
      : `Del ${weekday(start)} ${start.getDate()} al ${weekday(end)} ${end.getDate()}`;
  return {
    range,
    month: start.toLocaleDateString("es-CO", { month: "short" }).replace(".", ""),
    day: start.getDate(),
  };
}

export const QUALITY_BY_TIMING: Record<Timing, LeadQuality> = {
  esta_semana: "A",
  proxima_semana: "B",
  averiguando: "C",
};

const QUALITY_DIGIT: Record<LeadQuality, number> = { A: 1, B: 2, C: 3 };

/** Solo A y B son conversión para la pauta (evento `Contact`); C se mide aparte. */
export const isConversion = (q: LeadQuality) => q === "A" || q === "B";

export function getSesion(id: SesionId | undefined) {
  return SESIONES.find((s) => s.id === id);
}

/**
 * Sesión que corresponde a las zonas elegidas en el sitio (selector del cuerpo, pases,
 * página deportiva): solo piernas → piernas; solo tren superior → superior; ambas → completo.
 */
export function inferSesion(zones: string[]): SesionId | undefined {
  const text = zones.join(" ").toLowerCase();
  if (!text) return undefined;
  const legs = /pierna|pies/.test(text);
  const upper = /cuello|hombro|espalda|lumbar/.test(text);
  if (legs && upper) return "completo";
  if (legs) return "piernas";
  if (upper) return "superior";
  return undefined;
}

// ---------- Referencia ----------
const REF_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Código aleatorio de la conversación (se genera al abrir el formulario). */
export function makeRefCode(random: () => number = Math.random): string {
  let code = "";
  for (let i = 0; i < 5; i++) code += REF_CHARS[Math.floor(random() * REF_CHARS.length)];
  return code;
}

/** VT-7KQ2M-1: código de la conversación + la calidad (1 A, 2 B, 3 C). */
export function refFromCode(code: string, quality: LeadQuality): string {
  return `VT-${code}-${QUALITY_DIGIT[quality]}`;
}

export function makeRef(quality: LeadQuality, random: () => number = Math.random): string {
  return refFromCode(makeRefCode(random), quality);
}

// ---------- Contacto ----------
export type Contact = { name: string; phone: string; email: string; dial: string };

export const COUNTRIES = [
  { iso: "CO", dial: "57", name: "Colombia" },
  { iso: "VE", dial: "58", name: "Venezuela" },
  { iso: "US", dial: "1", name: "Estados Unidos" },
  { iso: "ES", dial: "34", name: "España" },
  { iso: "MX", dial: "52", name: "México" },
  { iso: "PA", dial: "507", name: "Panamá" },
  { iso: "EC", dial: "593", name: "Ecuador" },
  { iso: "PE", dial: "51", name: "Perú" },
  { iso: "CL", dial: "56", name: "Chile" },
  { iso: "AR", dial: "54", name: "Argentina" },
] as const;

const NATIONAL_LEN: Record<string, number[]> = {
  "1": [10],
  "34": [9],
  "51": [9],
  "52": [10],
  "54": [11],
  "56": [9],
  "58": [10],
  "507": [8],
  "593": [9],
};

/** Número en E.164 (+573001234567) o null si no es válido. */
export function normalizePhone(raw: string, dial = "57"): string | null {
  const t = raw.trim();
  let digits = t.replace(/\D/g, "");
  if (t.startsWith("+")) return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  if (dial === "57") {
    if (/^3\d{9}$/.test(digits)) return `+57${digits}`;
    if (/^573\d{9}$/.test(digits)) return `+${digits}`;
    return null;
  }
  const lens = NATIONAL_LEN[dial];
  if (lens && digits.startsWith(dial) && lens.includes(digits.length - dial.length)) {
    digits = digits.slice(dial.length);
  }
  if (dial === "1" && digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (dial === "54" && digits.length === 10 && !digits.startsWith("9")) digits = `9${digits}`;
  const ok = lens ? lens.includes(digits.length) : digits.length >= 6 && digits.length <= 14;
  return ok && dial.length + digits.length <= 15 ? `+${dial}${digits}` : null;
}

export const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
export const validName = (n: string) => /\p{L}{2,}/u.test(n.trim());

export function contactErrors(c: Contact) {
  return {
    name: !validName(c.name),
    phone: !normalizePhone(c.phone, c.dial),
    email: !validEmail(c.email),
  };
}

export function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") };
}

// ---------- Datos cifrados para Meta (SHA-256, normalizados como pide Meta) ----------
export type HashedUserData = {
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
  ct?: string;
  country?: string;
  external_id?: string;
};

const cleanName = (s: string) =>
  s
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}]/gu, "");

export function hashUserData(c: Contact, cityStatus: CityStatus): HashedUserData {
  const phone = normalizePhone(c.phone, c.dial)?.replace(/\D/g, "");
  const email = c.email.trim().toLowerCase();
  const { first, last } = splitName(c.name);
  const country = COUNTRIES.find((x) => x.dial === c.dial)?.iso.toLowerCase();
  const out: HashedUserData = {};
  if (email && validEmail(email)) out.em = sha256(email);
  if (phone) {
    out.ph = sha256(phone);
    // Mismo valor en cada visita de la misma persona: Meta lo usa para unir sus eventos.
    out.external_id = sha256(`vitalita:${phone}`);
  }
  if (first) out.fn = sha256(cleanName(first));
  if (last) out.ln = sha256(cleanName(last));
  // Solo se conoce la ciudad cuando la persona dijo que está en Barranquilla.
  if (cityStatus === "barranquilla") out.ct = sha256("barranquilla");
  if (country && phone?.startsWith(c.dial)) out.country = sha256(country);
  return out;
}

export const isSha256 = (v: unknown): v is string =>
  typeof v === "string" && /^[a-f0-9]{64}$/.test(v);

// ---------- Mensaje de WhatsApp ----------
export type LeadAnswers = {
  sesion: SesionId;
  timing: Timing;
  cityStatus: CityStatus;
  /** Zonas elegidas en el selector del cuerpo. Solo viajan en este mensaje. */
  zones: string[];
};

const formatCOP = (n: number) => `$${n.toLocaleString("es-CO")}`;

/** Mensaje en prosa y primera persona. Negritas (*) solo en los datos clave. */
export function buildLeadMessage(a: LeadAnswers, name: string, ref: string): string {
  const sesion = getSesion(a.sesion) ?? SESIONES[0];
  const first = name.trim() ? `Hola, soy *${name.trim().replace(/\s+/g, " ")}*.` : "Hola.";
  const service = `*${sesion.mensaje}* (${formatCOP(sesion.precio)})`;
  const timing = TIMINGS.find((t) => t.id === a.timing);

  const intro =
    a.timing === "averiguando"
      ? `${first} Estoy averiguando para agendar la ${service}.`
      : `${first} Quiero agendar la ${service} para *${timing?.message}*.`;

  const extra: string[] = [];
  if (a.zones.length) extra.push(`Siento más carga en ${joinList(a.zones)}.`);
  if (a.cityStatus === "outside_barranquilla") extra.push("Vengo desde otra ciudad.");

  const ask =
    a.timing === "averiguando"
      ? "¿Me cuentan qué horarios tienen disponibles?"
      : "¿Me ayudan con un horario?";

  return [[intro, ...extra, ask].join(" "), `Ref: ${ref}`].join("\n\n");
}
