import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Mail,
  Phone,
  User,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { DIRECCION, SESIONES, type SesionId } from "@/config/site";
import { metaBrowserIds, type Attribution } from "@/lib/attribution";
import { track } from "@/lib/analytics";
import {
  COUNTRIES,
  QUALITY_BY_TIMING,
  TIMINGS,
  buildLeadMessage,
  contactErrors,
  getSesion,
  hashUserData,
  isConversion,
  makeRefCode,
  refFromCode,
  splitName,
  timingDays,
  type CityStatus,
  type Contact,
  type Timing,
} from "@/lib/lead";
import { buildWhatsAppUrl, type ButtonOrigin } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export type BookingRequest = {
  origin: ButtonOrigin;
  /** Zonas del selector del cuerpo: solo viajan en el mensaje de WhatsApp. */
  zones: string[];
  preset?: SesionId;
};

type Step = "session" | "timing" | "outside" | "contact" | "done";

const formatCOP = (n: number) => `$${n.toLocaleString("es-CO")}`;
const EMPTY: Contact = { name: "", phone: "", email: "", dial: "57" };

/** El precio del pase cuenta hasta el valor de la sesión elegida, como en la sección de precios. */
function useCountUp(target: number) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const start = from.current;
    if (reduce || start === target) {
      from.current = target;
      setValue(target);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 700);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round((start + (target - start) * eased) / 1000) * 1000;
      setValue(v);
      from.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

/** Abre WhatsApp en otra pestaña en el mismo toque; si el navegador lo bloquea, en esta. */
function openWhatsAppUrl(url: string) {
  const w = window.open(url, "_blank");
  if (w) w.opener = null;
  else window.location.href = url;
}

export function BookingSheet({
  request,
  attribution,
  segment,
  onClose,
}: {
  request: BookingRequest | null;
  attribution: Attribution;
  segment: "deporte" | "general";
  onClose: () => void;
}) {
  const open = request !== null;
  const [step, setStep] = useState<Step>("session");
  const [sesion, setSesion] = useState<SesionId | undefined>();
  const [timing, setTiming] = useState<Timing | undefined>();
  const [city, setCity] = useState<CityStatus>("barranquilla");
  const [contact, setContact] = useState<Contact>(EMPTY);
  // Los errores se muestran después del primer intento de envío, no al salir del campo:
  // si aparecen al tocar el botón, empujan el botón y el toque se pierde.
  const [shown, setShown] = useState({ name: false, phone: false, email: false });
  const [result, setResult] = useState<{ ref: string; url: string; first: string } | null>(null);
  // La referencia se fija al abrir: así el enlace a WhatsApp está listo antes del toque.
  const [refCode, setRefCode] = useState("");
  // En celular, WhatsApp se abre en la misma pestaña (el enlace universal abre la app y la
  // web queda donde estaba); en computador, en otra pestaña.
  const [touch, setTouch] = useState(false);
  const finishTimer = useRef<number | undefined>(undefined);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const advanceTimer = useRef<number | undefined>(undefined);

  // Cada apertura empieza limpia; si el botón ya sabe la sesión, salta la primera pregunta.
  useEffect(() => {
    if (!request) return;
    setSesion(request.preset);
    setStep(request.preset ? "timing" : "session");
    setTiming(undefined);
    setCity("barranquilla");
    setShown({ name: false, phone: false, email: false });
    setResult(null);
    setRefCode(makeRefCode());
  }, [request]);

  useEffect(() => {
    setTouch(window.matchMedia?.("(pointer: coarse)").matches ?? false);
    return () => window.clearTimeout(finishTimer.current);
  }, []);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  // El foco sigue a la pregunta (lectores de pantalla); en computador, directo al nombre.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      const fine = window.matchMedia?.("(pointer: fine)").matches;
      if (step === "contact" && fine) nameRef.current?.focus({ preventScroll: true });
      else headingRef.current?.focus({ preventScroll: true });
    }, 60);
    return () => window.clearTimeout(id);
  }, [step, open]);

  const chosen = getSesion(sesion);
  const preset = Boolean(request?.preset);
  const order: Step[] = preset ? ["timing", "contact"] : ["session", "timing", "contact"];
  const position = step === "outside" ? order.indexOf("timing") : order.indexOf(step);
  const progress = step === "done" ? 1 : (position + 1) / (order.length + 1);
  const errors = useMemo(() => contactErrors(contact), [contact]);
  const price = useCountUp(chosen?.precio ?? SESIONES[0].precio);
  const timingLabel = TIMINGS.find((t) => t.id === timing)?.label.replace("Solo estoy ", "");
  const shownName = contact.name.trim().replace(/\s+/g, " ");

  const base = () => ({
    cta_location: request?.origin ?? "unknown",
    segment,
    service_name: "sesion_descarga_muscular",
    service_id: chosen?.serviceId,
  });

  const advance = (next: Step) => {
    window.clearTimeout(advanceTimer.current);
    // Una pausa corta para que se vea la opción marcada antes de pasar.
    advanceTimer.current = window.setTimeout(() => setStep(next), 220);
  };

  const pickSesion = (id: SesionId) => {
    const s = getSesion(id)!;
    setSesion(id);
    track("LeadStep", { ...base(), service_id: s.serviceId, step: "session", answer: s.serviceId });
    advance("timing");
  };

  const pickTiming = (t: Timing) => {
    setTiming(t);
    track("LeadStep", { ...base(), step: "timing", answer: t });
    advance("contact");
  };

  const goOutside = () => {
    track("ServiceAreaNotice", { ...base(), city_status: "outside_barranquilla" });
    setStep("outside");
  };

  const back = () => {
    if (step === "contact") setStep("timing");
    else if (step === "outside") setStep("timing");
    else if (step === "timing" && !preset) setStep("session");
  };

  const close = () => {
    if (step !== "done") {
      track("BookingDialogClose", { ...base(), step: step === "outside" ? "outside" : step });
    }
    onClose();
  };

  const valid = !errors.name && !errors.phone && !errors.email;

  // Enlace final a WhatsApp, armado mientras la persona escribe: el toque lo abre directo.
  const draft = useMemo(() => {
    if (!request || !chosen || !timing || !valid || !refCode) return null;
    const quality = QUALITY_BY_TIMING[timing];
    const ref = refFromCode(refCode, quality);
    const message = buildLeadMessage(
      { sesion: chosen.id, timing, cityStatus: city, zones: request.zones },
      contact.name,
      ref,
    );
    return { ref, quality, url: buildWhatsAppUrl(message) };
  }, [request, chosen, timing, valid, refCode, city, contact.name]);

  /** Capa de datos + base de la clínica. Va en el mismo toque, antes de salir a WhatsApp. */
  const sendLead = (d: NonNullable<typeof draft>) => {
    if (!request || !chosen || !timing) return;
    const params = {
      ...base(),
      city_status: city,
      lead_quality: d.quality,
      lead_ref: d.ref,
      lead_timing: timing,
      value: chosen.precio,
      currency: "COP",
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      utm_content: attribution.utm_content,
      utm_term: attribution.utm_term,
    };
    // Todo lead completo (A, B y C) para el embudo de GA4.
    track("LeadSubmit", params, { eventId: `${d.ref}-submit` });
    // Solo A y B son conversión para la pauta: mismo event_id que la API de Conversiones.
    if (isConversion(d.quality)) {
      track("Contact", params, { eventId: d.ref, userData: hashUserData(contact, city) });
      // Puente temporal hacia el activador actual de GTM (ver ContactLegacy en analytics.ts).
      track("ContactLegacy", params, { eventId: d.ref, userData: hashUserData(contact, city) });
    }

    const { fbp, fbc } = metaBrowserIds(attribution);
    const body = JSON.stringify({
      ref: d.ref,
      sesion: chosen.id,
      timing,
      cityStatus: city,
      contact,
      cta: request.origin,
      page: window.location.pathname,
      pageUrl: window.location.href.split("#")[0],
      attribution,
      fbp,
      fbc,
    });
    // keepalive: el envío sobrevive a que se abra WhatsApp.
    fetch("/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  };

  /**
   * Pasa a la pantalla final un instante después: si el enlace desaparece en el mismo
   * toque, el navegador cancela la navegación a WhatsApp.
   */
  const finish = (d: NonNullable<typeof draft>) => {
    setResult({ ref: d.ref, url: d.url, first: splitName(contact.name).first });
    window.clearTimeout(finishTimer.current);
    finishTimer.current = window.setTimeout(() => setStep("done"), 400);
  };

  /** Toque en el enlace: el navegador abre WhatsApp por su cuenta (sin preventDefault). */
  const onSendClick = () => {
    if (!draft) return;
    sendLead(draft);
    finish(draft);
  };

  /** Enviar con Enter, o tocar el botón con datos incompletos: muestra los errores. */
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!request || !chosen || !timing) return;
    if (!valid || !draft) {
      setShown({ name: true, phone: true, email: true });
      const first = (["name", "phone", "email"] as const).find((k) => errors[k]);
      document.getElementById(`bk-${first}`)?.focus();
      track("LeadStep", {
        ...base(),
        step: "contact_error",
        answer: (["name", "phone", "email"] as const).filter((k) => errors[k]).join("_"),
      });
      return;
    }
    sendLead(draft);
    finish(draft);
    openWhatsAppUrl(draft.url);
  };

  /**
   * Teclado en celular: no se mueve la hoja por código. Safari sube la vista una sola vez,
   * al ritmo del teclado; cualquier ajuste propio encima de eso se veía como un brinco.
   * Enter ("Siguiente") en nombre o WhatsApp pasa al siguiente campo; en el correo, envía.
   */
  const nextOnEnter = (next: string) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    document.getElementById(next)?.focus();
  };

  const update = (k: keyof Contact) => (v: string) => setContact((c) => ({ ...c, [k]: v }));
  const country = COUNTRIES.find((c) => c.dial === contact.dial) ?? COUNTRIES[0];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && close()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="bk-overlay" />
        <DialogPrimitive.Content
          className="bk-sheet"
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="bk-top">
            {(step === "timing" && !preset) || step === "contact" || step === "outside" ? (
              <button type="button" className="bk-icon" onClick={back} aria-label="Volver">
                <ArrowLeft aria-hidden />
              </button>
            ) : (
              <span className="bk-icon is-empty" aria-hidden />
            )}
            <p className="bk-count" aria-live="polite">
              {step === "done"
                ? "Solicitud lista"
                : `Paso ${Math.max(position, 0) + 1} de ${order.length}`}
            </p>
            <DialogPrimitive.Close className="bk-icon" aria-label="Cerrar">
              <X aria-hidden />
            </DialogPrimitive.Close>
          </div>

          <div className="bk-progress" aria-hidden>
            <span style={{ transform: `scaleX(${progress})` }} />
          </div>

          {/* El pase de sesión (el mismo de la sección de precios) se llena con cada respuesta. */}
          <div className={cn("bk-ticket", step === "done" && "is-done")}>
            <div className="bk-ticket-main">
              <p className="bk-ticket-kicker">Tu pase de sesión</p>
              <p
                key={chosen?.id ?? "none"}
                className={cn("bk-ticket-title", !chosen && "is-empty")}
              >
                {chosen?.titulo ?? "Elige tu sesión"}
              </p>
              <dl className="bk-ticket-fields">
                <div>
                  <dt>Cuándo</dt>
                  <dd key={timing ?? "none"} className={cn(!timing && "is-empty")}>
                    {timingLabel ?? "Por elegir"}
                  </dd>
                </div>
                <div>
                  <dt>A nombre de</dt>
                  <dd className={cn(!shownName && "is-empty")}>{shownName || "Por completar"}</dd>
                </div>
              </dl>
              {preset && step === "timing" && (
                <button type="button" className="bk-pass-change" onClick={() => setStep("session")}>
                  Cambiar sesión
                </button>
              )}
              <span className="bk-stamp" aria-hidden>
                Enviada
              </span>
            </div>
            <div className="bk-ticket-stub">
              <p className="bk-ticket-from">{chosen ? "Valor" : "Desde"}</p>
              <p className="bk-ticket-price">
                {formatCOP(price)}
                <small>COP</small>
              </p>
            </div>
          </div>

          <div className="bk-body" key={step}>
            {step === "session" && (
              <>
                <DialogPrimitive.Title
                  id="bk-q"
                  ref={headingRef}
                  tabIndex={-1}
                  className="bk-title"
                >
                  <span className="bk-title-soft">¿Qué quieres</span> trabajar?
                </DialogPrimitive.Title>
                <div className="bk-options" role="group" aria-labelledby="bk-q">
                  {SESIONES.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      style={{ "--i": i } as CSSProperties}
                      className={cn("bk-option is-session", sesion === s.id && "is-on")}
                      aria-pressed={sesion === s.id}
                      onClick={() => pickSesion(s.id)}
                    >
                      <strong className="bk-option-title">{s.titulo}</strong>
                      <span className="bk-option-price">{formatCOP(s.precio)}</span>
                      <span className="bk-option-detail">{s.detalle}</span>
                    </button>
                  ))}
                </div>
                <p className="bk-note">
                  Atendemos de forma presencial en el Norte Centro Histórico de Barranquilla.
                </p>
              </>
            )}

            {step === "timing" && (
              <>
                <DialogPrimitive.Title
                  id="bk-q"
                  ref={headingRef}
                  tabIndex={-1}
                  className="bk-title"
                >
                  <span className="bk-title-soft">¿Cuándo te gustaría</span> venir?
                </DialogPrimitive.Title>
                <div className="bk-options" role="group" aria-labelledby="bk-q">
                  {TIMINGS.map((t, i) => {
                    const days = timingDays(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        style={{ "--i": i } as CSSProperties}
                        className={cn(
                          "bk-option",
                          days ? "is-date" : "is-soft",
                          timing === t.id && "is-on",
                        )}
                        aria-pressed={timing === t.id}
                        onClick={() => pickTiming(t.id)}
                      >
                        {days && (
                          <span className="bk-date" aria-hidden>
                            <span>{days.month}</span>
                            <strong>{days.day}</strong>
                          </span>
                        )}
                        <span className="bk-option-text">
                          <strong>{t.label}</strong>
                          {days && <span>{days.range}</span>}
                        </span>
                        <span className="bk-option-mark" aria-hidden>
                          {timing === t.id ? <Check /> : <ArrowRight />}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {city === "barranquilla" ? (
                  <p className="bk-note">
                    Atendemos de forma presencial en el Norte Centro Histórico de Barranquilla.{" "}
                    <button type="button" className="bk-link" onClick={goOutside}>
                      ¿Estás en otra ciudad?
                    </button>
                  </p>
                ) : (
                  <p className="bk-note">
                    Vienes desde otra ciudad: lo incluimos en tu mensaje para coordinar mejor.
                  </p>
                )}
              </>
            )}

            {step === "outside" && (
              <>
                <DialogPrimitive.Title
                  id="bk-q"
                  ref={headingRef}
                  tabIndex={-1}
                  className="bk-title"
                >
                  Nuestra atención es presencial en Barranquilla
                </DialogPrimitive.Title>
                <p className="bk-lede">
                  Por ahora atendemos únicamente en nuestro centro, en {DIRECCION.linea}. Si puedes
                  desplazarte, te ayudamos a coordinar tu sesión.
                </p>
                <div className="bk-actions">
                  <button
                    type="button"
                    className="bk-primary"
                    onClick={() => {
                      setCity("outside_barranquilla");
                      track("LeadStep", {
                        ...base(),
                        step: "outside",
                        answer: "can_travel",
                        city_status: "outside_barranquilla",
                      });
                      setStep("timing");
                    }}
                  >
                    <span>Puedo viajar, continuar</span>
                    <span className="bk-primary-arrow" aria-hidden>
                      <ArrowRight />
                    </span>
                  </button>
                  <button type="button" className="bk-secondary" onClick={() => setStep("timing")}>
                    Volver
                  </button>
                </div>
              </>
            )}

            {step === "contact" && (
              <form className="bk-form" onSubmit={submit} noValidate>
                <DialogPrimitive.Title
                  id="bk-q"
                  ref={headingRef}
                  tabIndex={-1}
                  className="bk-title"
                >
                  <span className="bk-title-soft">¿A nombre de</span> quién agendamos?
                </DialogPrimitive.Title>

                <div className={cn("bk-field", shown.name && errors.name && "is-bad")}>
                  <label htmlFor="bk-name">Nombre y apellido</label>
                  <span className="bk-input">
                    <User aria-hidden />
                    <input
                      ref={nameRef}
                      id="bk-name"
                      onKeyDown={nextOnEnter("bk-phone")}
                      name="name"
                      autoComplete="name"
                      autoCapitalize="words"
                      enterKeyHint="next"
                      value={contact.name}
                      onChange={(e) => update("name")(e.target.value)}
                      aria-invalid={shown.name && errors.name}
                      aria-describedby="bk-name-err"
                    />
                  </span>
                  <p id="bk-name-err" className="bk-error">
                    Escribe tu nombre.
                  </p>
                </div>

                <div className={cn("bk-field", shown.phone && errors.phone && "is-bad")}>
                  <label htmlFor="bk-phone">WhatsApp</label>
                  <div className="bk-phone">
                    <span className="bk-dial">
                      <select
                        aria-label="Indicativo del país"
                        value={contact.dial}
                        onChange={(e) => update("dial")(e.target.value)}
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.iso} value={c.dial}>
                            {c.name} +{c.dial}
                          </option>
                        ))}
                      </select>
                      <span aria-hidden>+{country.dial}</span>
                      <ChevronDown aria-hidden />
                    </span>
                    <span className="bk-input">
                      <Phone aria-hidden />
                      <input
                        id="bk-phone"
                        onKeyDown={nextOnEnter("bk-email")}
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel-national"
                        enterKeyHint="next"
                        placeholder={contact.dial === "57" ? "300 000 0000" : ""}
                        value={contact.phone}
                        onChange={(e) => update("phone")(e.target.value)}
                        aria-invalid={shown.phone && errors.phone}
                        aria-describedby="bk-phone-err"
                      />
                    </span>
                  </div>
                  <p id="bk-phone-err" className="bk-error">
                    {contact.dial === "57"
                      ? "Revisa el número: son 10 dígitos y empieza por 3."
                      : "Revisa el número de WhatsApp."}
                  </p>
                </div>

                <div className={cn("bk-field", shown.email && errors.email && "is-bad")}>
                  <label htmlFor="bk-email">Correo</label>
                  <span className="bk-input">
                    <Mail aria-hidden />
                    <input
                      id="bk-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      enterKeyHint="send"
                      value={contact.email}
                      onChange={(e) => update("email")(e.target.value)}
                      aria-invalid={shown.email && errors.email}
                      aria-describedby="bk-email-err"
                    />
                  </span>
                  <p id="bk-email-err" className="bk-error">
                    Revisa el correo.
                  </p>
                </div>

                {draft ? (
                  <a
                    className="bk-primary"
                    href={draft.url}
                    {...(touch ? {} : { target: "_blank" })}
                    rel="noopener"
                    onClick={onSendClick}
                  >
                    <span>Agendar por WhatsApp</span>
                    <span className="bk-primary-arrow" aria-hidden>
                      <ArrowUpRight />
                    </span>
                  </a>
                ) : (
                  <button type="submit" className="bk-primary">
                    <span>Agendar por WhatsApp</span>
                    <span className="bk-primary-arrow" aria-hidden>
                      <ArrowUpRight />
                    </span>
                  </button>
                )}
                <p className="bk-legal">
                  Te escribimos por WhatsApp para confirmar el horario. Al continuar autorizas el
                  tratamiento de tus datos según nuestra{" "}
                  <a href="/politica-de-privacidad" target="_blank" rel="noopener">
                    política de privacidad
                  </a>
                  .
                </p>
              </form>
            )}

            {step === "done" && result && (
              <>
                <DialogPrimitive.Title
                  id="bk-q"
                  ref={headingRef}
                  tabIndex={-1}
                  className="bk-title"
                >
                  <span className="bk-title-soft">
                    Listo{result.first ? `, ${result.first}` : ""}.
                  </span>
                  <br />
                  Te abrimos WhatsApp
                </DialogPrimitive.Title>
                <p className="bk-lede">
                  Solo toca enviar y te confirmamos el horario. Tu referencia es{" "}
                  <strong>{result.ref}</strong>.
                </p>
                <div className="bk-actions">
                  <a
                    className="bk-primary"
                    href={result.url}
                    {...(touch ? {} : { target: "_blank" })}
                    rel="noopener"
                  >
                    <span>Abrir WhatsApp de nuevo</span>
                    <span className="bk-primary-arrow" aria-hidden>
                      <ArrowUpRight />
                    </span>
                  </a>
                </div>
                <p className="bk-note">
                  Te esperamos en {DIRECCION.linea}, Barranquilla.{" "}
                  <a className="bk-link" href={DIRECCION.mapsUrl} target="_blank" rel="noopener">
                    Cómo llegar
                  </a>
                </p>
              </>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
