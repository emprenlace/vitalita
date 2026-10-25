import {
  AnimatePresence,
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Activity, HandHeart, MessageCircle, Sparkles, type LucideIcon } from "lucide-react";
import { useRef, useState } from "react";
import { FLAGS, TAMARA_NOTA } from "@/config/site";
import { cn } from "@/lib/utils";
import { WhatsAppButton } from "./WhatsAppButton";

const STEPS: { t: string; d: string; icon: LucideIcon }[] = [
  {
    t: "Conversamos",
    d: "Nos cuentas qué sientes y qué te gustaría poder hacer con más comodidad.",
    icon: MessageCircle,
  },
  {
    t: "Evaluamos tu movimiento",
    d: "Observamos cómo llegas y revisamos tu movilidad antes de empezar.",
    icon: Activity,
  },
  {
    t: "Realizamos la descarga",
    d: "Combinamos las técnicas adecuadas para ti durante la sesión.",
    icon: HandHeart,
  },
  {
    t: "Revisamos cómo te sientes",
    d: "Comparamos tu movilidad y te damos recomendaciones para continuar en casa.",
    icon: Sparkles,
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;
const TICKS = Array.from({ length: 60 }, (_, i) => i);

/** One bar per step that fills while its quarter of the hour plays. */
function StepBar({ progress, index }: { progress: MotionValue<number>; index: number }) {
  const fill = useTransform(progress, (p) => Math.min(1, Math.max(0, p * STEPS.length - index)));
  return (
    <span className="hour-bar">
      <m.span className="hour-bar-fill" style={{ scaleX: fill }} />
    </span>
  );
}

function HourDial({ progress, minutes }: { progress: MotionValue<number>; minutes: number }) {
  // The hand rides the ring itself: position from the angle, no rotation origin needed.
  const handX = useTransform(progress, (p) => 100 + 78 * Math.sin(p * 2 * Math.PI));
  const handY = useTransform(progress, (p) => 100 - 78 * Math.cos(p * 2 * Math.PI));
  return (
    <div className="hour-dial">
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <linearGradient id="hour-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.1 192)" />
            <stop offset="100%" stopColor="oklch(0.36 0.07 195)" />
          </linearGradient>
        </defs>
        {TICKS.map((tick) => (
          <line
            key={tick}
            className={cn(
              "hour-tick",
              tick % 15 === 0 ? "is-quarter" : tick % 5 === 0 && "is-five",
            )}
            x1="100"
            y1={tick % 5 === 0 ? 8 : 10}
            x2="100"
            y2={tick % 15 === 0 ? 20 : 15}
            transform={`rotate(${tick * 6} 100 100)`}
          />
        ))}
        <circle className="hour-track" cx="100" cy="100" r="78" />
        <m.circle
          className="hour-progress"
          cx="100"
          cy="100"
          r="78"
          style={{ pathLength: progress }}
          transform="rotate(-90 100 100)"
        />
        <m.circle className="hour-hand" cx={handX} cy={handY} r="7" />
      </svg>
      <div className="hour-center">
        <span className="hour-minutes">{String(minutes).padStart(2, "0")}</span>
        <span className="hour-unit">de 60 min</span>
      </div>
    </div>
  );
}

export function TimelineSection() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });
  const [minutes, setMinutes] = useState(0);
  const [active, setActive] = useState(0);

  useMotionValueEvent(progress, "change", (value) => {
    const p = Math.min(1, Math.max(0, value));
    setMinutes(Math.round(p * 60));
    setActive(Math.min(STEPS.length - 1, Math.floor(p * STEPS.length)));
  });

  // Reduced motion: no pinned scroll, just the four steps in order.
  if (reduceMotion) {
    return (
      <section className="hour-static" aria-labelledby="sesion-title">
        <div className="container-x">
          <header className="pattern-head">
            <p className="section-label">Así se vive la sesión</p>
            <h2 id="sesion-title" className="pattern-title">
              <span className="pattern-title-soft">Una hora de cuidado,</span>{" "}
              <span>paso a paso.</span>
            </h2>
          </header>
          <ol className="hour-static-list">
            {STEPS.map((step, index) => (
              <li key={step.t}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.t}</h3>
                <p>{step.d}</p>
              </li>
            ))}
          </ol>
          <div className="hour-action">
            <WhatsAppButton origin="timeline" size="md">
              Reservar mi hora
            </WhatsAppButton>
          </div>
        </div>
      </section>
    );
  }

  const step = STEPS[active] ?? STEPS[0]!;
  const Icon = step.icon;

  return (
    <section
      ref={sectionRef}
      className="hour-section"
      aria-labelledby="sesion-title"
      data-hide-sticky
    >
      <div className="hour-sticky">
        <div className="container-x hour-inner">
          <div className="hour-grid">
            <div className="hour-panel">
              <header className="hour-head">
                <p className="section-label">Así se vive la sesión</p>
                <h2 id="sesion-title" className="hour-title">
                  <span className="pattern-title-soft">Una hora de cuidado,</span>{" "}
                  <span>paso a paso.</span>
                </h2>
              </header>

              {/* Screen readers get the whole list; the animated card is visual only. */}
              <ol className="sr-only">
                {STEPS.map((s) => (
                  <li key={s.t}>
                    {s.t}: {s.d}
                  </li>
                ))}
              </ol>

              <div className="hour-card" aria-hidden="true">
                <AnimatePresence mode="wait" initial={false}>
                  <m.div
                    key={active}
                    initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    <div className="hour-card-top">
                      <span className="hour-card-icon">
                        <Icon />
                      </span>
                      <span className="hour-card-count">
                        Paso {String(active + 1).padStart(2, "0")}
                        <span> / {String(STEPS.length).padStart(2, "0")}</span>
                      </span>
                    </div>
                    <h3>{step.t}</h3>
                    <p>{step.d}</p>
                  </m.div>
                </AnimatePresence>
              </div>

              <div className="hour-bars" aria-hidden="true">
                {STEPS.map((s, index) => (
                  <StepBar key={s.t} progress={progress} index={index} />
                ))}
              </div>

              <div className="hour-action">
                <WhatsAppButton origin="timeline" size="md" className="hour-cta">
                  Reservar mi hora
                </WhatsAppButton>
              </div>
            </div>

            <HourDial progress={progress} minutes={minutes} />
          </div>

          {FLAGS.tamaraImagenes && <p className="timeline-note">{TAMARA_NOTA}</p>}
        </div>
      </div>
    </section>
  );
}
