import { createFileRoute } from "@tanstack/react-router";
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
  h1: "Masajes terapéuticos en Barranquilla",
  lede: (
    <>
      Masaje descontracturante y descarga muscular con fisioterapeuta, en una sesión individual de{" "}
      {DATOS_SERVICIO.duracion}. En el Norte Centro Histórico, desde {PRECIO_SESION.label}.
    </>
  ),
  photo: {
    src: "/images/tecnica-masoterapia.webp",
    alt: "Masaje terapéutico manual en la espalda durante una sesión de masoterapia",
    width: 640,
    height: 854,
  },
  intro: {
    label: "Un masaje con criterio clínico",
    title: "Un masaje hecho por un fisioterapeuta",
    body: (
      <>
        <p>
          Un masaje terapéutico no es un masaje de spa. Antes de empezar, el fisioterapeuta revisa
          cómo te mueves y dónde está la tensión, y con eso decide qué técnicas usar y con qué
          intensidad. Al final vuelve a evaluar tu movilidad y te da recomendaciones para continuar
          en casa.
        </p>
        <p>
          Cada sesión se enfoca en una zona: <strong>cuello, hombros y espalda</strong>, con
          tracción cervical manual, o <strong>piernas y pies</strong>, con presoterapia. Las
          técnicas que se indiquen en la valoración están incluidas, sin cobros aparte.
        </p>
        <p className="svc-more">
          ¿Dudas entre una descarga y un masaje descontracturante?{" "}
          <a href="/blog/descarga-muscular-vs-masaje-descontracturante">
            Te explicamos la diferencia
          </a>
          .
        </p>
      </>
    ),
  },
  cases: {
    title: "Cuándo te puede servir",
    items: [
      {
        title: "Cuello y hombros cargados",
        body: "Por horas frente al computador o el celular, cuando la tensión sube hasta la nuca.",
      },
      {
        title: "Espalda tensa al final del día",
        body: "Jornadas largas sentado o de pie que se acumulan en la espalda alta y la zona lumbar.",
      },
      {
        title: "Piernas pesadas",
        body: "Si pasas mucho tiempo de pie, con descarga muscular y presoterapia en piernas y pies.",
      },
      {
        title: "Después de entrenar",
        body: "Para acompañar la recuperación muscular cuando entrenas con frecuencia.",
      },
    ],
  },
  faq: {
    title: "Sobre los masajes terapéuticos",
    items: [
      {
        q: "¿Qué diferencia hay entre un masaje terapéutico y uno relajante?",
        a: "El masaje relajante busca bienestar general. El terapéutico lo realiza un fisioterapeuta: empieza con una evaluación funcional, se enfoca en la zona donde sientes la tensión y usa técnicas como masoterapia, liberación miofascial, ventosas o masaje vibropercutor según lo que encuentre.",
      },
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
