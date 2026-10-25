import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, Lock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { joinList } from "@/lib/whatsapp";
import { useVitalita } from "./AnalyticsProvider";

type Zone = {
  id: string;
  label: string;
  detail: string;
  /** Glow center(s) on the 200×462 figure (same ratio as the silhouette image). */
  spots: [number, number][];
  glow: [number, number];
};

const ZONES: Zone[] = [
  {
    id: "cuello",
    label: "Cuello",
    detail: "Descarga manual y, si lo necesitas, una tracción suave que le da espacio a tu cuello.",
    spots: [[100, 80]],
    glow: [16, 14],
  },
  {
    id: "hombros",
    label: "Hombros",
    detail:
      "Masaje manual y liberación miofascial para soltar la carga que se acumula en los hombros.",
    spots: [
      [53, 116],
      [147, 116],
    ],
    glow: [18, 16],
  },
  {
    id: "espalda",
    label: "Espalda alta",
    detail: "Trabajo sobre la espalda con ventosas o vibropercusión, según cómo llegues ese día.",
    spots: [[100, 140]],
    glow: [30, 22],
  },
  {
    id: "lumbar",
    label: "Zona lumbar",
    detail: "Atención a molestias lumbares y posturales, con técnicas adaptadas a tu caso.",
    spots: [[100, 210]],
    glow: [26, 18],
  },
  {
    id: "piernas",
    label: "Piernas y pies",
    detail: "Presoterapia en piernas y pies para cerrar la sesión con el cuerpo más ligero.",
    spots: [
      [81, 330],
      [120, 330],
    ],
    glow: [14, 44],
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

function BodyFigure({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <svg className="body-figure" viewBox="0 0 200 462" aria-hidden="true">
      <defs>
        {/* Lifts the black silhouette into a soft teal relief on the dark card. */}
        <filter id="body-light" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="2.2 0 0 0 0.1  3 0 0 0 0.17  3 0 0 0 0.2  0 0 0 0.85 0"
          />
        </filter>
        <filter id="body-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      <image
        className="body-figure-shape"
        href="/images/body-silhouette.webp"
        width="200"
        height="462"
        filter="url(#body-light)"
      />

      {ZONES.map((zone) => {
        const active = selected.includes(zone.id);
        return (
          <g key={zone.id} className={cn("body-zone", active && "is-active")}>
            {zone.spots.map(([cx, cy]) => (
              <ellipse
                key={`glow-${cx}`}
                className="body-zone-glow"
                cx={cx}
                cy={cy}
                rx={zone.glow[0]}
                ry={zone.glow[1]}
                filter="url(#body-glow)"
              />
            ))}
            {zone.spots.map(([cx, cy]) => (
              <g key={`dot-${cx}`} className="body-zone-hit" onClick={() => onToggle(zone.id)}>
                <circle className="body-zone-target" cx={cx} cy={cy} r="18" />
                <circle className="body-zone-ring" cx={cx} cy={cy} r="10" />
                <circle className="body-zone-dot" cx={cx} cy={cy} r="5" />
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export function AssessmentSection() {
  const { openBooking } = useVitalita();
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((z) => z !== id) : [...current, id],
    );

  const chosen = ZONES.filter((zone) => selected.includes(zone.id));
  const labels = chosen.map((zone) => zone.label.toLowerCase());

  const rise = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 28 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { duration: 0.7, ease: EASE },
      };

  return (
    <section className="assessment-section" aria-labelledby="mide-title">
      <div className="container-x">
        <m.header className="pattern-head" {...rise}>
          <p className="section-label">Una atención que empieza por escucharte</p>
          <h2 id="mide-title" className="pattern-title">
            <span className="pattern-title-soft">Cada cuerpo llega</span>{" "}
            <span>con una historia distinta.</span>
          </h2>
          <p className="pattern-lede">
            Por eso no repetimos una secuencia igual para todos. Cuéntanos dónde sientes más carga y
            preparamos tu sesión a partir de ahí.
          </p>
        </m.header>

        <m.div className="assessment-grid" {...rise}>
          <div className="assessment-figure-card">
            <p className="assessment-figure-hint">Toca las zonas</p>
            <BodyFigure selected={selected} onToggle={toggle} />
          </div>

          <div className="assessment-panel">
            <p className="assessment-step">01 · ¿Qué zonas sientes más cargadas?</p>
            <div className="assessment-chips" role="group" aria-label="Zonas con más carga">
              {ZONES.map((zone) => {
                const active = selected.includes(zone.id);
                return (
                  <button
                    key={zone.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggle(zone.id)}
                    className={cn("assessment-chip", active && "is-active")}
                  >
                    <span className="assessment-chip-check" aria-hidden>
                      {active && <Check />}
                    </span>
                    {zone.label}
                  </button>
                );
              })}
            </div>

            <div className="assessment-result" aria-live="polite">
              {chosen.length === 0 ? (
                <p className="assessment-empty">
                  Elige una o varias zonas y te mostramos cómo las trabajamos en tu sesión de 60
                  minutos.
                </p>
              ) : (
                <ul className="assessment-list">
                  <AnimatePresence initial={false}>
                    {chosen.map((zone) => (
                      <m.li
                        key={zone.id}
                        layout={!reduceMotion}
                        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                        transition={{ duration: reduceMotion ? 0 : 0.35, ease: EASE }}
                      >
                        <strong>{zone.label}</strong>
                        <span>{zone.detail}</span>
                      </m.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            <button
              type="button"
              className="assessment-cta"
              onClick={() => openBooking("assessment", labels)}
            >
              <span>
                {labels.length ? `Agendar con foco en ${joinList(labels)}` : "Agendar mi sesión"}
              </span>
              <span className="assessment-cta-arrow" aria-hidden>
                <ArrowUpRight />
              </span>
            </button>
            <p className="assessment-privacy">
              <Lock aria-hidden />
              Lo que elijas solo se incluye en tu mensaje de WhatsApp.
            </p>
          </div>
        </m.div>
      </div>
    </section>
  );
}
