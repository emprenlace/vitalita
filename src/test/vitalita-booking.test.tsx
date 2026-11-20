import { createHash } from "node:crypto";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsProvider } from "@/components/vitalita/AnalyticsProvider";
import { AssessmentSection } from "@/components/vitalita/AssessmentSection";
import { WhatsAppButton } from "@/components/vitalita/WhatsAppButton";
import { sanitize, track } from "@/lib/analytics";
import { buildLeadMessage, hashUserData, inferSesion, makeRef, normalizePhone } from "@/lib/lead";
import { sha256 } from "@/lib/sha256";
import { handleLead } from "@/server/lead";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- lectura libre de la capa de datos en pruebas
type Loose = any;
type Push = Loose;
let dataLayer: Push[];
let opened: string[];
let posted: { url: string; init: RequestInit }[];

beforeEach(() => {
  dataLayer = [];
  opened = [];
  posted = [];
  Object.assign(window, { dataLayer });
  // Nada sale a la red en las pruebas: ni la hoja de la clínica ni Meta.
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      posted.push({ url, init });
      return new Response("{}", { status: 200 });
    }),
  );
  // El botón final es un enlace real: se registra su destino y se evita la navegación.
  document.addEventListener("click", captureLink, true);
  vi.spyOn(window, "open").mockImplementation((url) => {
    opened.push(String(url));
    return { opener: window } as unknown as Window;
  });
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IO;
});

function captureLink(event: MouseEvent) {
  const link = (event.target as Element | null)?.closest?.("a[href^='https://wa.me']");
  if (link) {
    opened.push(link.getAttribute("href") ?? "");
    event.preventDefault();
  }
}

afterEach(() => {
  document.removeEventListener("click", captureLink, true);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const events = () => dataLayer.map((p) => p.event);
const last = (event: string) => [...dataLayer].reverse().find((p) => p.event === event);

function openFromHero() {
  render(
    <AnalyticsProvider>
      <WhatsAppButton origin="hero">Agendar mi sesión</WhatsAppButton>
    </AnalyticsProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: /Agendar mi sesión/ }));
}

async function fillContact(
  contact = { name: "Laura Gómez", phone: "300 123 4567", email: "Laura@Correo.com" },
) {
  fireEvent.change(await screen.findByLabelText("Nombre y apellido"), {
    target: { value: contact.name },
  });
  fireEvent.change(screen.getByLabelText("WhatsApp"), { target: { value: contact.phone } });
  fireEvent.change(screen.getByLabelText("Correo"), { target: { value: contact.email } });
  // Con datos válidos es un enlace; con datos incompletos, un botón que muestra los errores.
  fireEvent.click(screen.getByText("Agendar por WhatsApp").closest("a, button")!);
}

describe("Arma tu sesión", () => {
  it("lleva un lead A de cuerpo completo a WhatsApp, a la hoja y a Meta sin datos en texto", async () => {
    openFromHero();
    expect(screen.getByRole("dialog")).toHaveTextContent("¿Qué quieres trabajar?");
    expect(screen.getByRole("dialog")).toHaveTextContent("$150.000");

    fireEvent.click(screen.getByRole("button", { name: /Cuerpo completo/ }));
    fireEvent.click(await screen.findByRole("button", { name: /Esta semana/ }));
    await fillContact();

    expect(opened).toHaveLength(1);
    const message = decodeURIComponent(opened[0]!.split("text=")[1]!);
    expect(opened[0]).toContain("wa.me/573012376079");
    expect(message).toContain("Hola, soy *Laura Gómez*.");
    expect(message).toContain("*Sesión de Descarga Muscular de cuerpo completo* ($150.000)");
    expect(message).toContain("para *esta semana*");
    expect(message).toMatch(/Ref: VT-[A-Z0-9]{5}-1$/);

    expect(events()).toEqual(
      expect.arrayContaining([
        "vitalita_form_abierto",
        "vitalita_form_paso",
        "vitalita_lead",
        "vitalita_lead_calificado",
      ]),
    );
    const contact = last("vitalita_lead_calificado")!;
    expect(contact).toMatchObject({
      event_name: "Contact",
      event_version: 2,
      lead_quality: "A",
      lead_timing: "esta_semana",
      service_id: "descarga_cuerpo_completo",
      value: 150000,
      currency: "COP",
      city_status: "barranquilla",
      cta_location: "hero",
    });
    expect(contact.event_id).toBe(contact.lead_ref);
    // Puente temporal: el evento viejo sale igual, con el mismo event_id, para GTM actual.
    expect(last("vitalita_whatsapp_click")).toMatchObject({
      event_name: "ContactLegacy",
      event_id: contact.lead_ref,
      lead_quality: "A",
      value: 150000,
    });
    const userData = contact.user_data as Loose;
    expect(userData.em).toBe(sha256("laura@correo.com"));
    expect(userData.ph).toBe(sha256("573001234567"));
    expect(userData.fn).toBe(sha256("laura"));
    expect(userData.ln).toBe(sha256("gómez"));
    expect(userData.ct).toBe(sha256("barranquilla"));

    // Ningún dato de contacto en texto en la capa de datos.
    const json = JSON.stringify(dataLayer);
    expect(json).not.toMatch(/laura|gómez|3001234567|correo\.com/i);

    expect(posted).toHaveLength(1);
    expect(posted[0]!.url).toBe("/api/lead");
    expect(posted[0]!.init.keepalive).toBe(true);
    expect(JSON.parse(String(posted[0]!.init.body))).toMatchObject({
      sesion: "completo",
      timing: "esta_semana",
      cityStatus: "barranquilla",
      cta: "hero",
    });

    expect(await screen.findByText(/Listo, Laura/)).toBeInTheDocument();
  });

  it("un lead C (solo averiguando) llega a WhatsApp pero no es conversión", async () => {
    openFromHero();
    fireEvent.click(screen.getByRole("button", { name: /Piernas y pies/ }));
    fireEvent.click(await screen.findByRole("button", { name: /Solo estoy averiguando/ }));
    await fillContact();

    expect(opened).toHaveLength(1);
    expect(decodeURIComponent(opened[0]!)).toContain("Estoy averiguando para agendar");
    expect(last("vitalita_lead")).toMatchObject({ lead_quality: "C", value: 100000 });
    expect(events()).not.toContain("vitalita_lead_calificado");
    expect(events()).not.toContain("vitalita_whatsapp_click");
  });

  it("no envía nada si el contacto tiene errores", async () => {
    openFromHero();
    fireEvent.click(screen.getByRole("button", { name: /Cuello, hombros y espalda/ }));
    fireEvent.click(await screen.findByRole("button", { name: /La próxima semana/ }));
    await fillContact({ name: "Ana Ruiz", phone: "123", email: "ana@" });

    expect(opened).toHaveLength(0);
    expect(posted).toHaveLength(0);
    expect(last("vitalita_form_paso")).toMatchObject({
      step: "contact_error",
      answer: "phone_email",
    });
    expect(screen.getByText(/son 10 dígitos y empieza por 3/)).toBeVisible();
  });

  it("filtra a quien está en otra ciudad y lo deja seguir si puede viajar", async () => {
    openFromHero();
    fireEvent.click(screen.getByRole("button", { name: /Cuello, hombros y espalda/ }));
    fireEvent.click(await screen.findByRole("button", { name: "¿Estás en otra ciudad?" }));
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Nuestra atención es presencial en Barranquilla",
    );
    expect(last("vitalita_form_fuera_de_zona")).toMatchObject({
      city_status: "outside_barranquilla",
    });

    fireEvent.click(screen.getByRole("button", { name: /Puedo viajar, continuar/ }));
    fireEvent.click(await screen.findByRole("button", { name: /La próxima semana/ }));
    await fillContact();

    expect(decodeURIComponent(opened[0]!)).toContain("Vengo desde otra ciudad.");
    const contact = last("vitalita_lead_calificado")!;
    expect(contact).toMatchObject({ city_status: "outside_barranquilla", lead_quality: "B" });
    expect((contact.user_data as Loose).ct).toBeUndefined();
  });

  it("las zonas del selector preseleccionan la sesión y solo viajan en el mensaje", async () => {
    render(
      <AnalyticsProvider>
        <AssessmentSection />
      </AnalyticsProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Cuello" }));
    fireEvent.click(screen.getByRole("button", { name: "Piernas y pies" }));
    expect(screen.getByText(/sesión de cuerpo completo por \$150\.000/)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Agendar con foco en cuello y piernas y pies" }),
    );

    // Ya sabe la sesión: empieza por el momento.
    expect(
      await screen.findByRole("heading", { name: "¿Cuándo te gustaría venir?" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveTextContent("Cuerpo completo");
    expect(last("vitalita_form_abierto")).toMatchObject({
      service_id: "descarga_cuerpo_completo",
      session_preset: true,
    });

    fireEvent.click(screen.getByRole("button", { name: /Esta semana/ }));
    await fillContact();
    expect(decodeURIComponent(opened[0]!)).toContain(
      "Siento más carga en cuello y piernas y pies.",
    );
    expect(JSON.stringify(dataLayer)).not.toMatch(/cuello|piernas/);
  });
});

describe("Lógica del lead", () => {
  it("SHA-256 coincide con el de Node, también con tildes", () => {
    for (const s of ["", "abc", "gómez", "laura@correo.com", "x".repeat(200)]) {
      expect(sha256(s)).toBe(createHash("sha256").update(s, "utf8").digest("hex"));
    }
  });

  it("normaliza celulares de Colombia y de otros países", () => {
    expect(normalizePhone("300 123 4567")).toBe("+573001234567");
    expect(normalizePhone("+57 300 123 4567")).toBe("+573001234567");
    expect(normalizePhone("573001234567")).toBe("+573001234567");
    expect(normalizePhone("1234567")).toBeNull();
    expect(normalizePhone("0412 123 4567", "58")).toBe("+584121234567");
    expect(normalizePhone("612 34 56 78", "34")).toBe("+34612345678");
  });

  it("deduce la sesión desde las zonas", () => {
    expect(inferSesion(["cuello", "zona lumbar"])).toBe("superior");
    expect(inferSesion(["piernas y pies"])).toBe("piernas");
    expect(inferSesion(["hombros", "piernas y pies"])).toBe("completo");
    expect(inferSesion([])).toBeUndefined();
  });

  it("la referencia lleva la calidad", () => {
    expect(makeRef("A")).toMatch(/^VT-[A-Z2-9]{5}-1$/);
    expect(makeRef("B")).toMatch(/-2$/);
    expect(makeRef("C")).toMatch(/-3$/);
  });

  it("el mensaje va en prosa, con la referencia al final", () => {
    const text = buildLeadMessage(
      { sesion: "piernas", timing: "proxima_semana", cityStatus: "barranquilla", zones: [] },
      "  Carlos   Pérez ",
      "VT-ABCDE-2",
    );
    expect(text).toBe(
      "Hola, soy *Carlos Pérez*. Quiero agendar la *Sesión de Descarga Muscular en piernas y pies* ($100.000) para *la próxima semana*. ¿Me ayudan con un horario?\n\nRef: VT-ABCDE-2",
    );
  });
});

describe("Capa de datos", () => {
  it("la lista de permitidos deja fuera los datos de salud", () => {
    expect(sanitize({ cta_location: "hero", zona: "espalda", tiempo: "seis meses" })).toEqual({
      cta_location: "hero",
    });
  });

  it("cada push vacía los parámetros del evento anterior y descarta user_data sin cifrar", () => {
    track("LeadStep", { step: "timing", answer: "esta_semana", lead_quality: "A" });
    track(
      "ServiceAreaNotice",
      { city_status: "outside_barranquilla" },
      {
        userData: { em: "laura@correo.com" },
      },
    );
    const pushed = dataLayer.at(-1)!;
    expect(pushed).toMatchObject({ event: "vitalita_form_fuera_de_zona", event_version: 2 });
    expect(pushed).toHaveProperty("step", undefined);
    expect(pushed).toHaveProperty("lead_quality", undefined);
    expect(pushed.user_data).toBeUndefined();
  });

  it("hashUserData no incluye la ciudad si la persona no está en Barranquilla", () => {
    const u = hashUserData(
      { name: "Ana", phone: "3001234567", email: "ana@x.co", dial: "57" },
      "outside_barranquilla",
    );
    expect(u.ct).toBeUndefined();
    expect(u.country).toBe(sha256("co"));
    expect(u.ln).toBeUndefined();
  });
});

describe("Servidor /api/lead", () => {
  const lead = (over: Record<string, unknown> = {}) => ({
    ref: "VT-ABCDE-1",
    sesion: "superior",
    timing: "esta_semana",
    cityStatus: "barranquilla",
    contact: { name: "Laura Gómez", phone: "3001234567", email: "laura@correo.com", dial: "57" },
    cta: "hero",
    page: "/",
    pageUrl: "https://www.vitalita.com.co/",
    attribution: { utm_source: "facebook", utm_campaign: "descarga", zona: "lumbar" },
    fbp: "fb.1.1.123",
    ...over,
  });
  const env = {
    LEADS_SHEET_URL: "https://sheet.test/exec",
    META_DATASET_ID: "123",
    META_CAPI_TOKEN: "tok",
  };

  it("guarda en la hoja y envía Contact a Meta con el contacto cifrado y sin datos de salud", async () => {
    const calls: { url: string; body: Loose }[] = [];
    const doFetch = vi.fn(async (url: string, init: RequestInit) => {
      calls.push({ url, body: JSON.parse(String(init.body)) });
      return new Response("{}", { status: 200 });
    }) as unknown as typeof fetch;

    const res = await handleLead(lead(), { ip: "1.2.3.4", userAgent: "UA" }, env, doFetch);
    expect(res.status).toBe(200);
    expect(calls.map((c) => c.url)).toEqual([
      "https://sheet.test/exec",
      "https://graph.facebook.com/v24.0/123/events?access_token=tok",
    ]);

    expect(calls[0]!.body).toMatchObject({
      ref: "VT-ABCDE-1",
      calidad: "A",
      nombre: "Laura Gómez",
      whatsapp: "+573001234567",
      utm_source: "facebook",
    });
    expect(calls[0]!.body).not.toHaveProperty("zona");

    const event = (calls[1]!.body.data as Loose[])[0]!;
    expect(event).toMatchObject({
      event_name: "Contact",
      event_id: "VT-ABCDE-1",
      action_source: "website",
      custom_data: { value: 100000, currency: "COP" },
    });
    const ud = event.user_data as Loose;
    expect(ud.em).toEqual([sha256("laura@correo.com")]);
    expect(ud.ph).toEqual([sha256("573001234567")]);
    expect(ud).toMatchObject({
      client_ip_address: "1.2.3.4",
      client_user_agent: "UA",
      fbp: "fb.1.1.123",
    });
    expect(JSON.stringify(calls[1]!.body)).not.toMatch(/laura|cuello|lumbar|espalda|esta_semana/i);
  });

  it("un lead C solo va a la hoja", async () => {
    const doFetch = vi.fn(async () => new Response("{}")) as unknown as typeof fetch;
    await handleLead(lead({ ref: "VT-ABCDE-3", timing: "averiguando" }), {}, env, doFetch);
    expect(doFetch).toHaveBeenCalledTimes(1);
  });

  it("rechaza referencias que no coinciden con las respuestas y descarta robots", async () => {
    const doFetch = vi.fn(async () => new Response("{}")) as unknown as typeof fetch;
    expect(
      (await handleLead(lead({ ref: "VT-ABCDE-1", timing: "averiguando" }), {}, env, doFetch))
        .status,
    ).toBe(400);
    expect((await handleLead(lead({ empresa: "spam" }), {}, env, doFetch)).status).toBe(200);
    expect(doFetch).not.toHaveBeenCalled();
  });

  it("sin variables de entorno no envía nada", async () => {
    const doFetch = vi.fn() as unknown as typeof fetch;
    const res = await handleLead(lead(), {}, {}, doFetch);
    expect(res.status).toBe(200);
    expect(doFetch).not.toHaveBeenCalled();
  });
});
