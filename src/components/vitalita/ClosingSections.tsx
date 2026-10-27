import { ArrowUp, ArrowUpRight, Clock3, Facebook, Instagram, MapPin, Star } from "lucide-react";
import { AnimatePresence, m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  DIRECCION,
  FACEBOOK_URL,
  FAQS,
  FLAGS,
  HORARIO,
  INSTAGRAM_URL,
  MEDIA,
  OPINIONES_PUBLICAS,
  PRECIO_SESION,
  TAMARA_NOTA,
} from "@/config/site";
import { track } from "@/lib/analytics";
import { useVitalita } from "./AnalyticsProvider";
import { Reveal, SectionTag } from "./primitives";
import { Logo } from "./SiteHeader";
import { WhatsAppButton } from "./WhatsAppButton";
import { responsive } from "@/lib/responsive";

function GoogleMark() {
  return (
    <svg
      aria-label="Google"
      className="h-7 w-7 shrink-0"
      role="img"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
      />
      <path
        fill="#34A853"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.6 5.9c4.44-4.1 7.17-10.15 7.17-17.55Z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59a14.45 14.45 0 0 1 0-9.18l-7.98-6.19a23.93 23.93 0 0 0 0 21.56l7.98-6.19Z"
      />
      <path
        fill="#EA4335"
        d="M24 48c6.47 0 11.9-2.13 15.87-5.9l-7.6-5.9c-2.11 1.41-4.8 2.25-8.27 2.25-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
      />
    </svg>
  );
}

export function FaqSection() {
  const faqs = FAQS.filter((f) => f.confirmed && f.a);
  const { openBooking } = useVitalita();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(0);

  return (
    <section className="faq-section" aria-labelledby="faq-title">
      <div className="container-x faq-grid">
        <div className="faq-aside">
          <SectionTag label="Antes de agendar" />
          <h2 id="faq-title" className="faq-title">
            <span className="pattern-title-soft">Resolvamos</span> <span>tus dudas.</span>
          </h2>
          <p className="faq-help">
            ¿Tienes otra pregunta? Escríbenos y te respondemos antes de que agendes.
          </p>
          <button type="button" className="faq-ask" onClick={() => openBooking("faq")}>
            Preguntar por WhatsApp
            <ArrowUpRight aria-hidden />
          </button>
        </div>

        <div className="faq-list">
          {faqs.map((f, index) => {
            const isOpen = open === index;
            const id = `faq-${index}`;
            return (
              <div key={f.q} className={isOpen ? "faq-item is-open" : "faq-item"}>
                <h3>
                  <button
                    type="button"
                    className="faq-question"
                    aria-expanded={isOpen}
                    aria-controls={id}
                    onClick={() => setOpen(isOpen ? -1 : index)}
                  >
                    <span>{f.q}</span>
                    <span className="faq-icon" aria-hidden />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <m.div
                      id={id}
                      className="faq-answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={
                        reduceMotion ? { duration: 0 } : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
                      }
                    >
                      <p>{f.a}</p>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          {FLAGS.tamaraImagenes && <p className="faq-note">{TAMARA_NOTA}</p>}
        </div>
      </div>
    </section>
  );
}

export function GoogleReviewsSection() {
  return (
    <section className="section-y overflow-hidden bg-sand/35" aria-labelledby="reviews-title">
      <div className="container-x">
        <div className="reviews-head grid items-end gap-6 md:grid-cols-12">
          <div className="reviews-intro md:col-span-7">
            <SectionTag label="Experiencias en Google" />
            <Reveal>
              <h2 id="reviews-title" className="reviews-title">
                <span className="pattern-title-soft">Lo que cuentan</span>{" "}
                <span>quienes nos visitan.</span>
              </h2>
              <p className="reviews-lede mt-3 max-w-[52ch] text-muted-foreground">
                Estas son algunas de sus opiniones. Puedes leerlas completas en Google.
              </p>
            </Reveal>
          </div>
          <div className="google-rating-card flex w-full max-w-[34rem] items-center gap-3 rounded-xl bg-white/90 p-3.5 shadow-[0_12px_36px_rgba(7,50,52,0.08)] backdrop-blur-xl sm:gap-4 md:col-span-5 md:col-start-8 md:justify-self-end md:p-4">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <GoogleMark />
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <p className="whitespace-nowrap font-semibold leading-tight text-ink">5.0</p>
                <span className="flex items-center gap-0.5" aria-hidden="true">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  ))}
                </span>
                <span className="whitespace-nowrap text-sm font-medium text-ink">en Google</span>
              </div>
            </div>
            <a
              href={DIRECCION.reviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ver reseñas en Google"
              className="inline-flex min-h-11 shrink-0 items-center gap-1 font-semibold text-forest underline decoration-forest/30 underline-offset-4 hover:decoration-forest"
            >
              <span className="google-rating-link-label">
                <span className="google-rating-link-verb">Ver </span>reseñas
              </span>
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>

        <div
          className="reviews-marquee"
          role="region"
          aria-label="Fragmentos de opiniones de pacientes"
        >
          <div className="review-marquee-track">
            {/* Four identical groups: the track slides by half (two groups), so the loop
                stays seamless even when one group is narrower than the viewport. */}
            {[0, 1, 2, 3].map((copy) => (
              <div key={copy} className="review-marquee-group" aria-hidden={copy > 0 || undefined}>
                {OPINIONES_PUBLICAS.map((review) => (
                  <article key={review.author} className="review-card">
                    <span className="review-stars" role="img" aria-label="5 de 5 estrellas">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} aria-hidden />
                      ))}
                    </span>
                    <p className="review-text">“{review.text}”</p>
                    <p className="review-author">
                      <span className="review-initial" aria-hidden>
                        {review.author.charAt(0)}
                      </span>
                      {review.author}
                    </p>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function ClosingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [-10, 10]);
  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: { duration: 0.6, delay, ease: EASE },
        };

  return (
    <section
      ref={sectionRef}
      className="closing-section"
      aria-labelledby="cierre-title"
      data-hide-sticky
    >
      <m.div
        className="closing-surface"
        {...(reduceMotion
          ? {}
          : {
              initial: { opacity: 0, scale: 0.97 },
              whileInView: { opacity: 1, scale: 1 },
              viewport: { once: true, amount: 0.2 },
              transition: { duration: 0.8, ease: EASE },
            })}
      >
        <m.img
          className="closing-photo"
          src={MEDIA.cierre.src}
          {...responsive(MEDIA.cierre.src, "(max-width: 767px) 100vw, 800px")}
          alt=""
          width={1200}
          height={1189}
          loading="lazy"
          decoding="async"
          style={reduceMotion ? {} : { y: imageY }}
          aria-hidden="true"
        />
        <div className="closing-photo-shade" aria-hidden="true" />

        <div className="closing-content">
          <div className="closing-copy">
            <p className="closing-eyebrow">Tu próximo paso</p>
            <h2 id="cierre-title" className="closing-title">
              {["Regálate una hora", "para sentir la", "diferencia."].map((line, index) => (
                <span className="closing-title-mask" key={line}>
                  <m.span
                    className="closing-title-line"
                    {...(reduceMotion
                      ? {}
                      : {
                          initial: { opacity: 0, y: 30, filter: "blur(10px)" },
                          whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
                          viewport: { once: true },
                          transition: {
                            duration: 0.65,
                            delay: 0.15 + index * 0.1,
                            ease: EASE,
                          },
                        })}
                  >
                    {line}
                  </m.span>
                </span>
              ))}
            </h2>
            <p className="closing-price">
              Sesión de descarga muscular <span aria-hidden>·</span> {PRECIO_SESION.fromLabel}
            </p>
            <m.div className="closing-action" {...rise(0.45)}>
              <WhatsAppButton
                origin="closing"
                size="md"
                hideIcon
                className="closing-cta"
                ariaLabel="Agenda tu sesión. Abre opciones para agendar."
              >
                <>
                  <span>Agenda tu sesión</span>
                  <span className="closing-cta-arrow">
                    <ArrowUpRight aria-hidden />
                  </span>
                </>
              </WhatsAppButton>
              <a
                className="closing-maps-link"
                href={DIRECCION.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin aria-hidden />
                Cómo llegar
              </a>
            </m.div>
          </div>
        </div>
      </m.div>
    </section>
  );
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20.5 11.8a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.3-5a8.4 8.4 0 1 1 16.2-3.7Zm-8.4-6.7a6.8 6.8 0 0 0-5.8 10.4l.2.4-.8 2.9 3-.8.4.2a6.8 6.8 0 1 0 3-13.1Zm3.8 9.7c-.2-.1-1.3-.7-1.5-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8.9-.1.2-.3.2-.5.1-.2-.1-.9-.3-1.7-1-.6-.5-1-1.2-1.2-1.4-.1-.2 0-.3.1-.5l.4-.4c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.5 3.9 3.4.5.2.9.3 1.2.4.5.2 1 .1 1.4.1.4-.1 1.3-.5 1.5-1 .2-.5.2-.9.1-1-.1-.2-.3-.3-.5-.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Agency credit: UTMs let Emprenlace's GA4 attribute visits coming from this site. */
const AGENCY_URL =
  "https://emprenlace.com/?utm_source=vitalita.com.co&utm_medium=referral&utm_campaign=portafolio&utm_content=footer_credit";

export function SiteFooter() {
  const { openBooking } = useVitalita();
  const [street, ...neighborhood] = DIRECCION.linea.split(", ");

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <ClosingSection />
        <div className="footer-body" data-hide-sticky>
          <div className="footer-grid">
            <div className="footer-brand">
              <Logo full />
              <p>
                Centro de fisioterapia en Barranquilla. Atención presencial, individual y
                personalizada.
              </p>
              <nav className="footer-socials" aria-label="Redes sociales">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram de Vitalita"
                  className="footer-social"
                >
                  <Instagram aria-hidden />
                </a>
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook de Vitalita"
                  className="footer-social"
                >
                  <Facebook aria-hidden />
                </a>
                <button
                  type="button"
                  onClick={() => openBooking("footer")}
                  aria-label="WhatsApp de Vitalita. Abre opciones para agendar."
                  className="footer-social"
                >
                  <WhatsAppGlyph />
                </button>
              </nav>
            </div>

            <div className="footer-col">
              <h2 className="footer-heading">Visítanos</h2>
              <address className="footer-text">
                {street}
                <br />
                {neighborhood.join(", ")}
                <br />
                {DIRECCION.ciudad}
              </address>
              <a
                className="footer-link"
                href={DIRECCION.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir en Google Maps
                <ArrowUpRight aria-hidden />
              </a>
            </div>

            <div className="footer-col">
              <h2 className="footer-heading">Horario</h2>
              <dl className="footer-hours">
                {HORARIO.map((item) => (
                  <div key={item.dias}>
                    <dt>{item.dias}</dt>
                    <dd>{item.horas}</dd>
                  </div>
                ))}
              </dl>
              <p className="footer-note">
                <Clock3 aria-hidden />
                Cita previa por WhatsApp
              </p>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Vitalita · Fisioterapia en Barranquilla</p>
            <a
              href={AGENCY_URL}
              target="_blank"
              rel="noopener"
              className="footer-agency"
              onClick={() => track("AgencyClick", { cta_location: "footer" })}
            >
              Powered by <strong>Emprenlace</strong>
            </a>
            <a href="#top" className="footer-top-link">
              Volver arriba
              <ArrowUp aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function StickyCta() {
  const [show, setShow] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 500);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    const targets = document.querySelectorAll("[data-hide-sticky]");
    if (!targets.length) return;
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        setHidden(visible.size > 0);
      },
      { threshold: 0.01 },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);
  return (
    <div
      className={`sticky-cta fixed inset-x-0 bottom-0 z-40 border-t border-forest/10 bg-background/95 px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-300 md:hidden ${show && !hidden ? "translate-y-0" : "translate-y-full"}`}
    >
      <WhatsAppButton origin="sticky" block>
        Agendar mi sesión
      </WhatsAppButton>
    </div>
  );
}
