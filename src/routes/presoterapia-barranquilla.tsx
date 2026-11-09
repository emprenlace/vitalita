import { createFileRoute } from "@tanstack/react-router";
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
  h1: "Presoterapia en Barranquilla",
  lede: (
    <>
      Presoterapia para piernas y pies dentro de una sesión individual de descarga muscular de{" "}
      {DATOS_SERVICIO.duracion}, con fisioterapeuta. En el Norte Centro Histórico, desde{" "}
      {PRECIO_SESION.label}.
    </>
  ),
  photo: {
    // Placeholder until there is a real photo of the pressotherapy equipment in use.
    src: "/images/vitalita-fachada-local.webp",
    alt: "Fachada de Vitalita Centro de Fisioterapia en el Norte Centro Histórico de Barranquilla",
    width: 1200,
    height: 1189,
  },
  intro: {
    label: "Para piernas que se sienten pesadas",
    title: "Qué es la presoterapia",
    body: (
      <>
        <p>
          La presoterapia aplica compresión de forma rítmica y por secciones sobre piernas y pies,
          de abajo hacia arriba. Es una técnica pasiva: estás acostado y el equipo hace el trabajo,
          mientras el fisioterapeuta ajusta la sesión a cómo llegas.
        </p>
        <p>
          En Vitalita la presoterapia hace parte de la <strong>sesión en piernas y pies</strong>:
          incluye descarga muscular en piernas y pies, presoterapia y evaluación funcional antes y
          después, con las técnicas que se indiquen en la valoración, sin cobros aparte.
        </p>
        <p className="svc-more">
          Si tienes antecedentes de trombosis, problemas cardíacos o circulatorios, o estás
          embarazada, cuéntanoslo antes de agendar: el fisioterapeuta evalúa si la presoterapia es
          adecuada para ti.
        </p>
      </>
    ),
  },
  cases: {
    title: "Cuándo te puede servir",
    items: [
      {
        title: "Trabajas de pie",
        body: "Comercio, salud, docencia: jornadas largas de pie que terminan con las piernas pesadas.",
      },
      {
        title: "Pasas el día sentado",
        body: "Oficina, conducción o viajes largos, cuando las piernas se sienten cargadas al final del día.",
      },
      {
        title: "Calor de Barranquilla",
        body: "Días de calor y humedad en los que la sensación de pesadez en las piernas aumenta.",
      },
      {
        title: "Después de entrenar",
        body: "Para acompañar la recuperación de piernas después de correr, montar bicicleta o entrenar fuerza.",
      },
    ],
  },
  faq: {
    title: "Sobre la presoterapia",
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
        q: "¿Puedo hacer presoterapia y trabajar cuello y espalda el mismo día?",
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
