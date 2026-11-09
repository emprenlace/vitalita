import { createFileRoute } from "@tanstack/react-router";
import { Armchair, Bike, PersonStanding, Sun } from "lucide-react";
import {
  ServiceLanding,
  serviceHead,
  type ServicePage,
} from "@/components/vitalita/ServiceLanding";
import { DATOS_SERVICIO, DIRECCION, HORARIO, PRECIO_SESION } from "@/config/site";

const PAGE: ServicePage = {
  path: "/presoterapia-barranquilla",
  metaTitle: "Presoterapia en Barranquilla | Vitalita",
  metaDescription: `Presoterapia para piernas y pies con fisioterapeuta en Barranquilla, dentro de una sesión de descarga muscular de ${DATOS_SERVICIO.duracion}, desde ${PRECIO_SESION.label}.`,
  label: "Presoterapia",
  h1Lines: ["Presoterapia", "en Barranquilla."],
  lede: (
    <>
      Para piernas y pies, dentro de una sesión individual de descarga muscular de{" "}
      {DATOS_SERVICIO.duracion} con fisioterapeuta.
    </>
  ),
  // Placeholder until there is a real photo of the pressotherapy equipment in use.
  photo: { src: "/images/vitalita-fachada-local.webp", position: "center 35%" },
  intro: {
    label: "Para piernas que se sienten pesadas",
    title: ["Qué es", "la presoterapia."],
    body: (
      <>
        <p className="pattern-lede svc-lede">
          Compresión rítmica y por secciones sobre piernas y pies, de abajo hacia arriba. Es una
          técnica pasiva: estás acostado mientras el fisioterapeuta ajusta la sesión a cómo llegas.
        </p>
        <p className="pattern-lede svc-lede">
          Hace parte de la <strong>sesión en piernas y pies</strong>, con descarga muscular y
          evaluación funcional antes y después. Si tienes antecedentes de trombosis, problemas
          cardíacos o circulatorios, o estás embarazada, cuéntanoslo antes de agendar.
        </p>
      </>
    ),
  },
  cases: {
    title: "Cuándo te puede servir",
    items: [
      {
        icon: PersonStanding,
        title: "Trabajas de pie",
        body: "Comercio, salud, docencia: jornadas largas de pie.",
      },
      {
        icon: Armchair,
        title: "Pasas el día sentado",
        body: "Oficina, conducción o viajes largos.",
      },
      {
        icon: Sun,
        title: "Calor de Barranquilla",
        body: "Días en los que la pesadez en las piernas aumenta.",
      },
      {
        icon: Bike,
        title: "Después de entrenar",
        body: "Correr, montar bicicleta o entrenar fuerza.",
      },
    ],
  },
  feature: {
    kind: "steps",
    label: "Paso a paso",
    title: ["Así es tu sesión", "de presoterapia."],
    steps: [
      {
        title: "Evaluamos cómo llegas",
        body: "Revisamos tus piernas, cómo te mueves y si la presoterapia es adecuada para ti.",
      },
      {
        title: "Descarga y presoterapia",
        body: "Trabajo manual en piernas y pies, y compresión rítmica por secciones.",
      },
      {
        title: "Revisamos cómo te sientes",
        body: "Volvemos a evaluar y te damos recomendaciones para continuar en casa.",
      },
    ],
  },
  faq: {
    title: ["Sobre", "la presoterapia."],
    items: [
      {
        q: "¿Cómo se siente la presoterapia?",
        a: "Sientes una presión que sube por las piernas por secciones y luego se libera, de forma rítmica. No debería doler; si la presión te incomoda, el fisioterapeuta la ajusta.",
      },
      {
        q: "¿Cuánto cuesta y cuánto dura?",
        a: `Hace parte de la sesión en piernas y pies, que dura ${DATOS_SERVICIO.duracion} y cuesta desde ${PRECIO_SESION.label}. Incluye descarga muscular en piernas y pies, presoterapia y evaluación funcional antes y después.`,
      },
      {
        q: "¿Puedo trabajar cuello y espalda el mismo día?",
        a: "Cada sesión se enfoca en una zona. Cuello, hombros y espalda, y piernas y pies son sesiones distintas, cada una desde $100.000 COP. Escríbenos y te ayudamos a coordinarlas.",
      },
      {
        q: "¿Hay casos en que no se recomienda?",
        a: "Sí. Si tienes antecedentes de trombosis, problemas cardíacos o circulatorios, heridas o infecciones en las piernas, o estás embarazada, cuéntanoslo antes: el fisioterapeuta evalúa si es adecuada para ti.",
      },
      {
        q: "¿Dónde están y en qué horario atienden?",
        a: `Estamos en ${DIRECCION.linea}, ${DIRECCION.ciudad}. Atendemos ${HORARIO.map((h) => `${h.dias.toLowerCase()} de ${h.horas}`).join(" y ")}, con cita previa por WhatsApp.`,
      },
    ],
  },
  serviceName: "Presoterapia en Barranquilla",
  serviceType: "Presoterapia para piernas y pies",
};

export const Route = createFileRoute("/presoterapia-barranquilla")({
  head: () => serviceHead(PAGE),
  component: () => <ServiceLanding page={PAGE} />,
});
