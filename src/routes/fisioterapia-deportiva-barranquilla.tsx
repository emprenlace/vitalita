import { createFileRoute } from "@tanstack/react-router";
import {
  ServiceLanding,
  serviceHead,
  type ServicePage,
} from "@/components/vitalita/ServiceLanding";
import { DATOS_SERVICIO, DIRECCION, HORARIO, PRECIO_SESION } from "@/config/site";

const PAGE: ServicePage = {
  path: "/fisioterapia-deportiva-barranquilla",
  metaTitle: "Fisioterapia deportiva en Barranquilla | Vitalita",
  metaDescription: `Recuperación muscular para deportistas con fisioterapeuta en Barranquilla: descarga muscular, liberación miofascial y masaje vibropercutor. ${DATOS_SERVICIO.duracion}, desde ${PRECIO_SESION.label}.`,
  label: "Fisioterapia deportiva",
  h1: "Fisioterapia deportiva en Barranquilla",
  lede: (
    <>
      Recuperación muscular para deportistas, con fisioterapeuta, en una sesión individual de{" "}
      {DATOS_SERVICIO.duracion}. En el Norte Centro Histórico, desde {PRECIO_SESION.label}.
    </>
  ),
  photo: {
    src: "/images/pattern-band-estiramiento.webp",
    alt: "Paciente realizando un estiramiento de cadera en el área de ejercicio de Vitalita",
    width: 1000,
    height: 1250,
  },
  intro: {
    label: "Para quienes entrenan",
    title: "Una sesión pensada para tu recuperación",
    body: (
      <>
        <p>
          Cuando entrenas seguido, la carga se acumula: piernas pesadas después de correr, espalda y
          hombros tensos después del gimnasio. En la sesión, el fisioterapeuta revisa cómo te
          mueves, trabaja la zona que más se carga con tu deporte y vuelve a evaluar tu movilidad al
          final.
        </p>
        <p>
          Usamos{" "}
          <strong>masoterapia, liberación miofascial, ventosas y masaje vibropercutor</strong> según
          lo que encuentre en la valoración. Cada sesión se enfoca en una zona: cuello, hombros y
          espalda, o piernas y pies.
        </p>
        <p className="svc-more">
          Si tienes una lesión o un dolor que no mejora, cuéntanos por WhatsApp antes de agendar: el
          fisioterapeuta te orienta sobre si esta sesión es adecuada para ti.
        </p>
      </>
    ),
  },
  cases: {
    title: "Para qué deportistas",
    items: [
      {
        title: "Running",
        body: "Gemelos, isquiotibiales y pies cargados después de rodajes largos o competencias.",
      },
      {
        title: "Gimnasio y CrossFit",
        body: "Espalda, hombros y piernas tensos por el entrenamiento de fuerza.",
      },
      {
        title: "Fútbol y deportes de equipo",
        body: "Piernas cargadas por partidos y entrenamientos seguidos.",
      },
      {
        title: "Ciclismo",
        body: "Cuádriceps, zona lumbar y cuello tensos después de salidas largas.",
      },
    ],
  },
  faq: {
    title: "Sobre la fisioterapia deportiva",
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
