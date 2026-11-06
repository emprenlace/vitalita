import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, MapPin, Star } from "lucide-react";
import { useRef, type CSSProperties } from "react";
import { DIRECCION, GOOGLE_RATING, PRECIO_SESION } from "@/config/site";
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

        {/* Mobile: title at the top, action and facts at the bottom, the video as a window between. */}
        <div className="hero-stage-content relative z-10">
          <div className="hero-copy">
            <p {...enter(0)} className="hero-in eyebrow text-white/90">
              Centro de Fisioterapia · Barranquilla
            </p>
            <h1 className="hero-title text-white" aria-label={copy.title}>
              {copy.lines.map((line, index) => (
                <span
                  className={index === 0 ? "hero-title-line hero-title-soft" : "hero-title-line"}
                  key={line}
                >
                  <span
                    className="hero-line-in"
                    style={{ "--hero-delay": `${0.12 + index * 0.12}s` } as CSSProperties}
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h1>
            <p {...enter(0.45)} className="hero-in hero-lede">
              {copy.body}
            </p>
            <div {...enter(0.6)} className="hero-in hero-main-action">
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
              <a
                href={DIRECCION.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-location"
                aria-label="Cómo llegar a Vitalita en Barranquilla"
              >
                <MapPin aria-hidden />
                Cómo llegar
              </a>
            </div>

            {/* Proof, time and price: the three answers people look for before writing. */}
            <dl {...enter(0.8)} className="hero-in hero-stats" aria-label="Detalles de la sesión">
              <div>
                <dt>
                  {GOOGLE_RATING.score}
                  <Star aria-hidden />
                </dt>
                <dd>en Google</dd>
              </div>
              <div>
                <dt>60 min</dt>
                <dd>individual</dd>
              </div>
              <div>
                <dt className="hero-session-name">{PRECIO_SESION.label.replace(" COP", "")}</dt>
                <dd>desde, por sesión</dd>
              </div>
            </dl>
          </div>
        </div>
      </m.div>
    </section>
  );
}
