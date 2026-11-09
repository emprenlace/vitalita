import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Dumbbell, Footprints, Laptop } from "lucide-react";
import {
  ServiceLanding,
  serviceHead,
  type ServicePage,
} from "@/components/vitalita/ServiceLanding";
import { DATOS_SERVICIO, DIRECCION, HORARIO, PRECIO_SESION } from "@/config/site";

const PAGE: ServicePage = {
  path: "/masajes-terapeuticos-barranquilla",
  metaTitle: "Masajes terapéuticos en Barranquilla | Vitalita",
  metaDescription: `Masaje descontracturante y descarga muscular con fisioterapeuta en Barranquilla. Sesión individual de ${DATOS_SERVICIO.duracion}, desde ${PRECIO_SESION.label}. Agenda por WhatsApp.`,
  label: "Masajes terapéuticos",
  h1Lines: ["Masajes terapéuticos", "en Barranquilla."],
  lede: (
    <>
      Masaje descontracturante y descarga muscular con fisioterapeuta, en una sesión individual de{" "}
      {DATOS_SERVICIO.duracion}.
    </>
  ),
  photo: { src: "/images/tecnica-masoterapia.webp", position: "center 40%" },
  intro: {
    label: "Un masaje con criterio clínico",
    title: ["Un masaje hecho", "por un fisioterapeuta."],
    body: (
      <>
        <p className="pattern-lede svc-lede">
          Antes de empezar, el fisioterapeuta revisa cómo te mueves y dónde está la tensión, y con
          eso decide qué técnicas usar y con qué intensidad. Al final vuelve a evaluar tu movilidad
          y te da recomendaciones para continuar en casa.
        </p>
        <p className="pattern-lede svc-lede">
          Cada sesión se enfoca en una zona: <strong>cuello, hombros y espalda</strong>, o{" "}
          <strong>piernas y pies</strong>. Las técnicas de la valoración están incluidas.{" "}
          <a href="/blog/descarga-muscular-vs-masaje-descontracturante" className="svc-inline-link">
            Descarga vs. masaje descontracturante
          </a>
        </p>
      </>
    ),
  },
  cases: {
    title: "Cuándo te puede servir",
    items: [
      {
        icon: Laptop,
        title: "Cuello y hombros cargados",
        body: "Horas frente al computador o el celular.",
      },
      {
        icon: Briefcase,
        title: "Espalda tensa al final del día",
        body: "Jornadas largas sentado o de pie.",
      },
      {
        icon: Footprints,
        title: "Piernas pesadas",
        body: "Descarga muscular y presoterapia en piernas y pies.",
      },
      {
        icon: Dumbbell,
        title: "Después de entrenar",
        body: "Para acompañar tu recuperación muscular.",
      },
    ],
  },
  feature: {
    kind: "compare",
    label: "No es un masaje de spa",
    title: ["Relajante o terapéutico:", "la diferencia."],
    columns: ["Masaje relajante", "Masaje terapéutico en Vitalita"],
    rows: [
      {
        label: "Cómo empieza",
        a: "Directamente con el masaje",
        b: "Con una evaluación de cómo te mueves",
      },
      {
        label: "En qué se enfoca",
        a: "Bienestar general y relajación",
        b: "La zona donde sientes la tensión",
      },
      {
        label: "Técnicas",
        a: "Masaje manual",
        b: "Masoterapia, liberación miofascial, ventosas o masaje vibropercutor",
      },
      { label: "Quién lo hace", a: "Spa o centro de estética", b: "Un fisioterapeuta" },
      {
        label: "Al terminar",
        a: "Sensación de relajación",
        b: "Nueva evaluación y recomendaciones para casa",
      },
    ],
  },
  faq: {
    title: ["Sobre los masajes", "terapéuticos."],
    items: [
      {
        q: "¿Es lo mismo que un masaje descontracturante?",
        a: "En Vitalita el trabajo descontracturante hace parte de la sesión de descarga muscular: el fisioterapeuta trabaja las contracturas de la zona que elijas, con la presión adecuada para ti.",
      },
      {
        q: "¿Cuánto cuesta y cuánto dura?",
        a: `La sesión es individual, dura ${DATOS_SERVICIO.duracion} y cuesta desde ${PRECIO_SESION.label}. Cada sesión se enfoca en una zona: cuello, hombros y espalda, o piernas y pies.`,
      },
      {
        q: "¿Duele?",
        a: "En zonas muy cargadas puedes sentir presión o algo de molestia. El fisioterapeuta ajusta la intensidad a lo que toleras y te pregunta durante la sesión.",
      },
      {
        q: "¿Dónde están y en qué horario atienden?",
        a: `Estamos en ${DIRECCION.linea}, ${DIRECCION.ciudad}. Atendemos ${HORARIO.map((h) => `${h.dias.toLowerCase()} de ${h.horas}`).join(" y ")}, con cita previa por WhatsApp.`,
      },
    ],
  },
  serviceName: "Masajes terapéuticos en Barranquilla",
  serviceType: "Masaje terapéutico y descarga muscular",
};

export const Route = createFileRoute("/masajes-terapeuticos-barranquilla")({
  head: () => serviceHead(PAGE),
  component: () => <ServiceLanding page={PAGE} />,
});
