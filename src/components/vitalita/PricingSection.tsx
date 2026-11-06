import {
  animate,
  m,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Check } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { DATOS_SERVICIO, FLAGS, OPCIONES_SESION, PRECIO_SESION } from "@/config/site";
import { cn } from "@/lib/utils";
import { WhatsAppButton } from "./WhatsAppButton";

const FIELDS = [
  { label: "Duración", value: DATOS_SERVICIO.duracion },
  { label: "Modalidad", value: "Individual" },
  { label: "Lugar", value: "Barranquilla" },
  { label: "Realizado", value: DATOS_SERVICIO.realizado },
];

const CHECK_STEP_MS = 260;
const formatCOP = (n: number) => `$${Math.round(n).toLocaleString("es-CO")}`;

type Option = (typeof OPCIONES_SESION)[number];

/** One pass per zone: same price and duration, its own list of what is included. */
function SessionPass({ option, index }: { option: Option; index: number }) {
  const reduceMotion = useReducedMotion();
  const ticketRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ticketRef, { once: true, amount: 0.45 });
  const items = option.incluye;

  const [price, setPrice] = useState(reduceMotion ? PRECIO_SESION.value : 0);
  const [checked, setChecked] = useState(reduceMotion ? items.length : 0);
  const stamped = checked >= items.length;

  // Price counts up and the inclusions tick one by one once the pass is on screen.
  useEffect(() => {
    if (!inView || reduceMotion) return;
    const counter = animate(0, PRECIO_SESION.value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setPrice,
    });
    const timers = items.map((_, i) =>
      window.setTimeout(() => setChecked(i + 1), 450 + i * CHECK_STEP_MS),
    );
    return () => {
      counter.stop();
      timers.forEach(window.clearTimeout);
    };
  }, [inView, reduceMotion, items]);

  // Subtle 3D tilt that follows the pointer on desktop.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-5, 5]), {
    stiffness: 150,
    damping: 18,
  });
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [4, -4]), {
    stiffness: 150,
    damping: 18,
  });
  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div className="pass-stage" onPointerMove={onMove} onPointerLeave={onLeave}>
      <m.div
        ref={ticketRef}
        className="pass"
        style={reduceMotion ? {} : { rotateX, rotateY }}
        initial={reduceMotion ? false : { opacity: 0, y: 40, rotate: index ? 2 : -2 }}
        whileInView={reduceMotion ? {} : { opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="pass-main">
          <div className="pass-topline">
            <span>Vitalita · Pase de sesión</span>
            <span>Admite 1 persona</span>
          </div>
          <h3 className="pass-service">{option.titulo}</h3>

          <dl className="pass-fields">
            {FIELDS.map((field) => (
              <div key={field.label}>
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>

          <p className="pass-list-title">Incluido</p>
          <ul className="pass-list">
            {items.map((item, i) => {
              const on = i < checked;
              return (
                <li key={item} className={cn(on && "is-on")}>
                  <span className="pass-check" aria-hidden>
                    <Check />
                  </span>
                  {item}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="pass-perforation" aria-hidden />

        <div className="pass-stub">
          <p className="pass-from">Desde</p>
          <p className="pass-price">
            <span className="sr-only">{PRECIO_SESION.fromLabel}</span>
            <span aria-hidden>{formatCOP(price)}</span>
            <small aria-hidden>{PRECIO_SESION.currency}</small>
          </p>
          <p className="pass-stub-note">
            Por sesión. Técnicas según valoración, sin cobros aparte.
          </p>

          <span className={cn("pass-stamp", stamped && "is-on")} aria-hidden>
            Todo
            <br />
            incluido
          </span>

          <WhatsAppButton
            origin="pricing"
            size="md"
            className="pass-cta"
            zones={[option.zona]}
            ariaLabel={`Agendar ${option.titulo.toLowerCase()}. Abre opciones para agendar.`}
          >
            Agendar esta sesión
          </WhatsAppButton>
          <p className="pass-stub-foot">Coordinas tu horario por WhatsApp.</p>
          {FLAGS.cuposLimitados && <p className="pass-stub-foot">Cupos limitados por semana</p>}
          <span className="pass-barcode" aria-hidden />
        </div>
      </m.div>
    </div>
  );
}

export function PricingSection() {
  return (
    <section className="pass-section" aria-labelledby="precio-title" id="precio">
      <div className="container-x">
        <div className="pass-intro">
          <p className="section-label">Lo que incluye tu sesión</p>
          <h2 id="precio-title" className="pass-title">
            Tu pase para <em>el alivio</em> del dolor.
          </h2>
          <p className="pass-lede">
            Elige la zona que quieres tratar. Cada sesión, desde {PRECIO_SESION.label}.
          </p>
        </div>

        <div className="pass-pair">
          {OPCIONES_SESION.map((option, index) => (
            <SessionPass key={option.id} option={option} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
