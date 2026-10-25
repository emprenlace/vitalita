import { m, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight, CircleDot, Footprints, Hand, Waves } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PRECIO_SESION } from "@/config/site";
import { WhatsAppButton } from "./WhatsAppButton";
import { responsive } from "@/lib/responsive";

const TECHNIQUES = [
  {
    name: "Descarga muscular",
    description:
      "Trabajo sobre cuello, hombros y espalda para soltar la tensión que se acumula en el día a día.",
    image: "/images/technique-descarga.webp",
    alt: "Masaje manual en la espalda durante una sesión terapéutica",
    icon: Hand,
    angle: -6,
    offset: "outer",
    position: "center",
  },
  {
    name: "Tracción cervical",
    description: "Una tracción suave que le da espacio y descanso a tu cuello.",
    image: "/images/clinic-session.webp",
    alt: "Fisioterapeuta guiando un ejercicio de movilidad con una paciente",
    icon: Waves,
    angle: -2,
    offset: "raised",
    position: "center",
  },
  {
    name: "Piernas y pies",
    description: "Cuidado complementario para cerrar la sesión con todo el cuerpo más ligero.",
    image: "/images/active-recovery.webp",
    alt: "Deportista realizando un ejercicio de recuperación muscular",
    icon: Footprints,
    angle: 2,
    offset: "raised",
    position: "center",
  },
  {
    name: "Ventosas",
    description: "Una técnica que usamos según tu caso para aliviar zonas de tensión.",
    image: "/images/technique-ventosas.webp",
    alt: "Aplicación de ventosas terapéuticas en la espalda",
    icon: CircleDot,
    angle: 6,
    offset: "outer",
    position: "center",
  },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

function TechniqueCard({
  item,
  index,
  scrollProgress,
  reduceMotion,
  isMobile,
}: {
  item: (typeof TECHNIQUES)[number];
  index: number;
  scrollProgress: MotionValue<number>;
  reduceMotion: boolean;
  isMobile: boolean;
}) {
  const openAngle = item.angle < 0 ? item.angle - 1.5 : item.angle + 1.5;
  const scrollAngle = useTransform(scrollProgress, [0, 1], [0, openAngle - item.angle]);
  const Icon = item.icon;

  return (
    <m.div
      className={`technique-card-wrap technique-card-wrap--${item.offset}`}
      style={{ rotate: reduceMotion || isMobile ? 0 : scrollAngle }}
      initial={reduceMotion ? false : { opacity: 0, y: 32 }}
      whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: reduceMotion ? 0 : 0.8,
        delay: reduceMotion ? 0 : index * 0.1,
        ease: EASE,
      }}
    >
      <m.article
        className="technique-card"
        tabIndex={0}
        initial={reduceMotion ? false : { rotate: 0 }}
        whileInView={{ rotate: reduceMotion || isMobile ? 0 : item.angle }}
        whileHover={reduceMotion || isMobile ? {} : { rotate: 0, y: -12 }}
        whileFocus={reduceMotion || isMobile ? {} : { rotate: 0, y: -12 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                rotate: { duration: 0.8, delay: index * 0.1, ease: EASE },
                y: { type: "spring", stiffness: 180, damping: 24, mass: 0.8 },
              }
        }
      >
        <img
          className="technique-card-image"
          src={item.image}
          {...responsive(item.image, "(max-width: 899px) 70vw, 260px")}
          alt={item.alt}
          width="720"
          height="960"
          loading="lazy"
          decoding="async"
          style={{ objectPosition: item.position }}
        />
        <div className="technique-card-tint" aria-hidden />
        <div className="technique-card-glass">
          <p>{item.description}</p>
        </div>
        <div className="technique-card-caption">
          <span className="technique-card-icon">
            <Icon aria-hidden />
          </span>
          <span>{item.name}</span>
        </div>
      </m.article>
    </m.div>
  );
}

export function TechniquesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const breakpoint = window.matchMedia("(max-width: 899px)");
    const update = () => setIsMobile(breakpoint.matches);
    update();
    breakpoint.addEventListener("change", update);
    return () => breakpoint.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  return (
    <section
      ref={sectionRef}
      id="tecnicas"
      className="techniques-section"
      aria-labelledby="techniques-title"
    >
      <div className="container-x">
        <m.div
          className="techniques-heading"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, ease: EASE }}
        >
          <p className="section-label">En tu sesión</p>
          <h2 id="techniques-title" aria-label="Cada tensión tiene su técnica">
            <span>Cada tensión tiene</span>
            <span>su técnica</span>
          </h2>
        </m.div>

        <div className="techniques-carousel" role="region" aria-label="Técnicas de la sesión">
          {TECHNIQUES.map((item, index) => (
            <TechniqueCard
              key={item.name}
              item={item}
              index={index}
              scrollProgress={scrollYProgress}
              reduceMotion={reduceMotion}
              isMobile={isMobile}
            />
          ))}
        </div>

        <div className="techniques-action">
          <WhatsAppButton
            origin="techniques"
            size="md"
            className="techniques-cta"
            hideIcon
            ariaLabel="Agenda tu sesión. Abre opciones para agendar."
          >
            <>
              <span>Agenda tu sesión</span>
              <span className="techniques-cta-arrow">
                <ArrowUpRight aria-hidden />
              </span>
            </>
          </WhatsAppButton>
          <p>
            Sesión de descarga muscular <span aria-hidden>·</span> {PRECIO_SESION.fromLabel}
          </p>
        </div>
      </div>
    </section>
  );
}
