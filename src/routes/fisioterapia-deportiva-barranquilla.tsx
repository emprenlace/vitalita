import { createFileRoute } from "@tanstack/react-router";
import { Activity, Bike, CalendarDays, Dumbbell, Footprints, Trophy } from "lucide-react";
import {
  ServiceLanding,
  serviceHead,
  type ServicePage,
} from "@/components/vitalita/ServiceLanding";
import { DATOS_SERVICIO, DIRECCION, HORARIO, PRECIO_SESION } from "@/config/site";

const LEGS = { session: "Sesión en piernas y pies", zona: "piernas y pies" };
const UPPER = { session: "Sesión en cuello, hombros y espalda", zona: "cuello, hombros y espalda" };

const PAGE: ServicePage = {
  path: "/fisioterapia-deportiva-barranquilla",
  metaTitle: "Fisioterapia deportiva en Barranquilla | Vitalita",
  metaDescription: `Recuperación muscular para deportistas con fisioterapeuta en Barranquilla: descarga muscular, liberación miofascial y masaje vibropercutor. ${DATOS_SERVICIO.duracion}, desde ${PRECIO_SESION.label}.`,
  label: "Fisioterapia deportiva",
  h1Lines: ["Fisioterapia deportiva", "en Barranquilla."],
  lede: (
    <>
      Recuperación muscular para quienes entrenan, con fisioterapeuta, en una sesión individual de{" "}
      {DATOS_SERVICIO.duracion}.
    </>
  ),
  photo: { src: "/images/pattern-band-estiramiento.webp", position: "center 45%" },
  intro: {
    label: "Para quienes entrenan",
    title: ["Una sesión pensada", "para tu recuperación."],
    body: (
      <>
        <p className="pattern-lede svc-lede">
          Cuando entrenas seguido, la carga se acumula. El fisioterapeuta revisa cómo te mueves,
          trabaja la zona que más se carga con tu deporte y vuelve a evaluar tu movilidad al final.
        </p>
        <p className="pattern-lede svc-lede">
          Usamos{" "}
          <strong>masoterapia, liberación miofascial, ventosas y masaje vibropercutor</strong> según
          la valoración. Si tienes una lesión o un dolor que no mejora, cuéntanos por WhatsApp antes
          de agendar.
        </p>
      </>
    ),
  },
  cases: {
    title: "Cuándo te puede servir",
    items: [
      {
        icon: Activity,
        title: "Carga acumulada",
        body: "Cuando sientes el cuerpo pesado por entrenar seguido.",
      },
      {
        icon: CalendarDays,
        title: "Semanas de mucho volumen",
        body: "Preparación de una carrera, torneo o competencia.",
      },
      {
        icon: Trophy,
        title: "Después de competir",
        body: "Para acompañar la recuperación tras el esfuerzo.",
      },
      {
        icon: Dumbbell,
        title: "Fuerza y gimnasio",
        body: "Espalda, hombros y piernas tensos por el entrenamiento.",
      },
    ],
  },
  feature: {
    kind: "sports",
    label: "Según tu deporte",
    title: ["Elige tu deporte,", "te decimos qué trabajar."],
    sports: [
      {
        id: "running",
        name: "Running",
        icon: Footprints,
        zones: "Gemelos, isquiotibiales y pies",
        ...LEGS,
      },
      {
        id: "gym",
        name: "Gimnasio y CrossFit",
        icon: Dumbbell,
        zones: "Espalda, hombros y cuello",
        ...UPPER,
      },
      {
        id: "futbol",
        name: "Fútbol",
        icon: Trophy,
        zones: "Cuádriceps, isquiotibiales y gemelos",
        ...LEGS,
      },
      { id: "ciclismo", name: "Ciclismo", icon: Bike, zones: "Cuádriceps y gemelos", ...LEGS },
    ],
  },
  faq: {
    title: ["Sobre la fisioterapia", "deportiva."],
    items: [
      {
        q: "¿Qué incluye la sesión para deportistas?",
        a: `Es una sesión individual de ${DATOS_SERVICIO.duracion} con evaluación funcional antes y después y las técnicas que se indiquen en la valoración: masoterapia, liberación miofascial, ventosas o masaje vibropercutor. Cuesta desde ${PRECIO_SESION.label}.`,
      },
      {
        q: "¿Cuándo conviene hacerla?",
        a: "Cuando sientes la carga acumulada de entrenar, después de una competencia o en semanas de mucho volumen. El fisioterapeuta te orienta sobre cada cuánto hacerla según tu caso.",
      },
      {
        q: "¿Atienden lesiones deportivas?",
        a: "Si tienes una lesión o un dolor que no mejora, escríbenos por WhatsApp antes de agendar y cuéntanos qué te pasa. El fisioterapeuta te orienta sobre si esta sesión es adecuada o qué necesitas.",
      },
      {
        q: "¿Puedo trabajar piernas y espalda en la misma visita?",
        a: "Cada sesión se enfoca en una zona. Cuello, hombros y espalda, y piernas y pies son sesiones distintas, cada una desde $100.000 COP. Escríbenos y te ayudamos a coordinarlas.",
      },
      {
        q: "¿Dónde están y en qué horario atienden?",
        a: `Estamos en ${DIRECCION.linea}, ${DIRECCION.ciudad}. Atendemos ${HORARIO.map((h) => `${h.dias.toLowerCase()} de ${h.horas}`).join(" y ")}, con cita previa por WhatsApp.`,
      },
    ],
  },
  serviceName: "Fisioterapia deportiva en Barranquilla",
  serviceType: "Recuperación muscular para deportistas",
};

export const Route = createFileRoute("/fisioterapia-deportiva-barranquilla")({
  head: () => serviceHead(PAGE),
  component: () => <ServiceLanding page={PAGE} />,
});
