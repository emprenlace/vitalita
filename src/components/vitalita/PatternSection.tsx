import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Armchair, HeartPulse, Layers, Waves, type LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { MEDIA } from "@/config/site";
import { useNearViewport } from "@/lib/defer";
import { WhatsAppButton } from "./WhatsAppButton";
import { responsive } from "@/lib/responsive";

const STEPS: { t: string; d: string; icon: LucideIcon; image: string; video?: string }[] = [
  {
    t: "El día a día",
    d: "Pasas horas sentado, conduces o repites el mismo movimiento en el trabajo.",
    icon: Armchair,
    image: MEDIA.patron.diaADia,
  },
  {
    t: "La tensión se acumula",
    d: "Al final del día, cuello y hombros se sienten cargados; la espalda pide una pausa.",
    icon: Layers,
    image: MEDIA.patron.tensionVideo.poster,
    video: MEDIA.patron.tensionVideo.src,
  },
  {
    t: "Tu cuerpo lo nota",
    d: "Te cuesta encontrar una postura cómoda o moverte con la misma soltura.",
    icon: Waves,
    image: MEDIA.patron.cuerpoNota,
  },
  {
    t: "Es momento de atenderlo",
    d: "Una sesión personalizada puede ayudarte a soltar tensión y entender qué necesita tu cuerpo.",
    icon: HeartPulse,
    image: MEDIA.patron.atencion.src,
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/** Muted background clip that only plays while on screen, to save mobile data. */
function StepVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const near = useNearViewport(ref, "600px");

  useEffect(() => {
    const video = ref.current;
    if (!video || reduceMotion) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduceMotion, near]);

  return (
    <video
      ref={ref}
      className="pattern-step-bg"
      {...(near ? { poster } : {})}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
    >
      {near && <source src={src} type="video/mp4" />}
    </video>
  );
}

export function PatternSection() {
  const reduceMotion = useReducedMotion();
  const bandRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: bandRef, offset: ["start end", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.3 },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <section className="pattern-section" aria-labelledby="patron-title">
      <div className="container-x">
        <m.header className="pattern-head" {...rise(0)}>
          <p className="section-label">Cuando el cuerpo pide una pausa</p>
          <h2 id="patron-title" className="pattern-title">
            <span className="pattern-title-soft">La tensión también se acumula</span>{" "}
            <span>en los días normales.</span>
          </h2>
          <p className="pattern-lede">
            Una jornada larga, el entrenamiento o una mala noche pueden dejar el cuerpo más rígido
            de lo habitual. Escucharlo a tiempo también es cuidarte.
          </p>
        </m.header>

        <ol className="pattern-steps">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const last = index === STEPS.length - 1;
            return (
              <m.li
                key={step.t}
                className={`pattern-step pattern-step--${index + 1}`}
                {...rise(index * 0.08)}
              >
                {step.video ? (
                  <StepVideo src={step.video} poster={step.image} />
                ) : (
                  <img
                    src={step.image}
                    {...responsive(
                      step.image,
                      "(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 270px",
                    )}
                    alt=""
                    width={1000}
                    height={1250}
                    loading="lazy"
                    decoding="async"
                    className="pattern-step-bg"
                  />
                )}
                <div className="pattern-step-bg-shade" aria-hidden />
                <div className="pattern-step-top">
                  <span className="pattern-step-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="pattern-step-icon">
                    <Icon aria-hidden />
                  </span>
                </div>
                <div className="pattern-step-body">
                  <h3>{step.t}</h3>
                  <p>{step.d}</p>
                  {last && (
                    <WhatsAppButton origin="pattern" size="md" className="pattern-step-cta">
                      Agendar mi sesión
                    </WhatsAppButton>
                  )}
                </div>
              </m.li>
            );
          })}
        </ol>

        <m.div ref={bandRef} className="pattern-band" {...rise(0)}>
          <m.img
            src={MEDIA.patron.banda.src}
            {...responsive(MEDIA.patron.banda.src, "(max-width: 767px) 92vw, 600px")}
            alt={MEDIA.patron.banda.alt}
            width={1440}
            height={1799}
            loading="lazy"
            decoding="async"
            className="pattern-band-photo"
            style={reduceMotion ? {} : { y: photoY }}
          />
          <div className="pattern-band-shade" aria-hidden />
          <p className="pattern-band-quote">Una hora para que el cuerpo vuelva a sentirse tuyo.</p>
        </m.div>
      </div>
    </section>
  );
}
