import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import { useRef, type CSSProperties } from "react";
import { DIRECCION, MEDIA, PRECIO_SESION } from "@/config/site";
import { useVitalita } from "./AnalyticsProvider";
import { prefersLightMedia, useAfterLoad } from "@/lib/defer";
import { WhatsAppButton } from "./WhatsAppButton";

const COPY = {
  general: {
    title: "La tensión diaria también merece atención.",
    lines: ["La tensión diaria", "también merece", "atención."],
    body: "Una sesión individual de descarga muscular para cuello, hombros y espalda, con cuidado complementario para tus piernas y pies.",
  },
  deporte: {
    title: "Tu entrenamiento merece un cuerpo bien cuidado.",
    lines: ["Tu entrenamiento", "merece un cuerpo", "bien cuidado."],
    body: "Una sesión individual para acompañar tu recuperación muscular, con atención a cómo te mueves antes y después.",
  },
};

const DETAILS = [
  { title: "60 min", detail: "atención individual" },
  { title: "Técnicas incluidas", detail: "según tu caso" },
  { title: "Barranquilla", detail: "presencial" },
];

export function HeroSection() {
  const { segment } = useVitalita();
  const copy = COPY[segment];
  const reduce = useReducedMotion();
  const loadVideo = useAfterLoad(!reduce && !prefersLightMedia());
  const stageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 24]);
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);
  const stageRadius = useTransform(scrollYProgress, [0, 1], [32, 48]);
  // Entrance runs in CSS (see .hero-in): text is visible from the server HTML and
  // animates on first paint, without waiting for JavaScript to hydrate.
  const enter = (delay: number) => ({
    style: { "--hero-delay": `${delay}s` } as CSSProperties,
  });

  return (
    <section id="top" className="hero-surface">
      <m.div
        ref={stageRef}
        className="hero-stage relative isolate"
        style={reduce ? {} : { scale: stageScale, borderRadius: stageRadius }}
      >
        <m.div className="hero-backdrop" style={reduce ? {} : { y: imageY }}>
          {/* The poster paints instantly (LCP); the video streams in once the page is idle. */}
          <video
            className="hero-backdrop-video"
            autoPlay={!reduce}
            loop
            muted
            playsInline
            preload="none"
            poster="/images/hero-poster.webp"
            aria-hidden="true"
            tabIndex={-1}
            {...(loadVideo ? { src: "/videos/vitalita-hero.mp4" } : {})}
          />
        </m.div>
        <div className="hero-backdrop-shade" aria-hidden />

        <div className="hero-stage-content relative z-10">
          <div className="hero-copy">
            <p {...enter(0)} className="hero-in eyebrow text-white/90">
              Centro de Fisioterapia · Barranquilla
            </p>
            <h1 className="hero-title text-white" aria-label={copy.title}>
              {copy.lines.map((line, index) => (
                <span className="hero-title-line" key={line}>
                  <span
                    className="hero-line-in"
                    style={{ "--hero-delay": `${0.12 + index * 0.12}s` } as CSSProperties}
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h1>
            <div {...enter(0.5)} className="hero-in hero-main-action">
              <WhatsAppButton
                origin="hero"
                size="lg"
                className="hero-main-button"
                hideIcon
                ariaLabel="Agenda tu sesión. Abre opciones para agendar."
              >
                <>
                  <span>Agenda tu sesión</span>
                  <span className="hero-main-arrow">
                    <ArrowUpRight aria-hidden />
                  </span>
                </>
              </WhatsAppButton>
            </div>
          </div>

          <a
            href={DIRECCION.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            {...enter(0.7)}
            className="hero-in hero-map-card"
            aria-label="Cómo llegar a Vitalita en Barranquilla"
          >
            <img src={MEDIA.fachada.thumb} alt="" width="64" height="64" />
            <span>
              Cómo llegar
              <ArrowUpRight aria-hidden />
            </span>
          </a>

          <aside {...enter(0.85)} className="hero-in hero-session-note">
            <p className="hero-session-label">
              <MapPin aria-hidden />
              <span className="hero-session-name">
                <span className="hero-session-prefix">Sesión de </span>descarga muscular
              </span>
              <span className="hero-session-price">{PRECIO_SESION.fromLabel}</span>
            </p>
            <p>{copy.body}</p>
          </aside>

          <dl
            {...enter(1)}
            className="hero-in hero-details relative z-10"
            aria-label="Detalles de la sesión"
          >
            {DETAILS.map((item) => (
              <div key={item.title} className="hero-detail">
                <dt className="hero-detail-title">{item.title}</dt>
                <dd className="hero-detail-description">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </m.div>
    </section>
  );
}
