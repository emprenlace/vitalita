import { m, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { INSTAGRAM_URL, MEDIA } from "@/config/site";
import { WhatsAppButton } from "./WhatsAppButton";
import { responsive } from "@/lib/responsive";

const FOCUS = ["Rehabilitación", "Masaje terapéutico", "Dolor lumbar, cervical y postural"];
const EASE = [0.16, 1, 0.3, 1] as const;

export function DoctorSection() {
  const reduceMotion = useReducedMotion();
  const rise = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.3 },
          transition: { duration: 0.8, delay, ease: EASE },
        };

  return (
    <section className="doctor-section" aria-labelledby="doctor-title">
      <div className="container-x doctor-grid">
        <m.figure className="doctor-photo" {...rise()}>
          <img
            src={MEDIA.nestor.src}
            {...responsive(MEDIA.nestor.src, "(max-width: 899px) 92vw, 460px")}
            alt={MEDIA.nestor.alt}
            width={768}
            height={960}
            loading="lazy"
            decoding="async"
          />
        </m.figure>

        <m.div className="doctor-copy" {...rise(0.1)}>
          <p className="section-label">Experiencia que acompaña tu recuperación</p>
          <h2 id="doctor-title" className="doctor-title">
            Néstor Mullet
          </h2>
          <p className="doctor-lede">
            Fisioterapeuta enfocado en rehabilitación y masaje terapéutico. Acompaña a personas con
            molestias lumbares, cervicales y posturales con atención personalizada.
          </p>

          <dl className="doctor-facts">
            <div>
              <dt>Profesión</dt>
              <dd>Fisioterapeuta</dd>
            </div>
            <div>
              <dt>Formación</dt>
              <dd>Universidad Simón Bolívar · Barranquilla</dd>
            </div>
            <div>
              <dt>Enfoque</dt>
              <dd>
                <ul className="doctor-focus" aria-label="Áreas de enfoque">
                  {FOCUS.map((area) => (
                    <li key={area}>{area}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>

          <div className="doctor-actions">
            <WhatsAppButton origin="doctor" size="md">
              Agendar con Néstor
            </WhatsAppButton>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="doctor-link"
            >
              Conocer Vitalita
              <ArrowUpRight aria-hidden />
            </a>
          </div>
        </m.div>
      </div>
    </section>
  );
}
