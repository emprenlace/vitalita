/**
 * Datos de negocio centralizados de Vitalita.
 * Todo valor editable (número, precio, dirección, horarios, IDs de analítica)
 * vive aquí. Los contenidos con `confirmed: false` NO se publican.
 */

export const GTM_ID = ""; // Configura el contenedor de Google Tag Manager.
export const META_PIXEL_ID = ""; // Configura el Pixel directo solo si no se usa GTM.
export const WHATSAPP_NUMBER = "573012376079";
export const SITE_URL = "https://www.vitalita.com";
/**
 * Where the site is reachable today; link previews (WhatsApp, Facebook) fetch the
 * share image from here. Set it to SITE_URL once www.vitalita.com is connected.
 */
export const PUBLIC_URL = "https://emprenlace-vitalita.vitalita.workers.dev";

export const PRECIO_SESION = {
  value: 100000,
  currency: "COP",
  label: "$100.000 COP",
  /** Always shown to visitors: the session price is a starting price. */
  fromLabel: "Desde $100.000 COP",
};

export const SERVICIO_NOMBRE = "Sesión de Descarga Muscular";

export const DIRECCION = {
  linea: "Cl. 79 #43B - 45, Nte. Centro Histórico",
  ciudad: "Barranquilla, Atlántico",
  mapsQuery: "Cl. 79 #43B - 45, Norte Centro Histórico, Barranquilla, Atlántico",
  mapsUrl: "https://maps.app.goo.gl/kQ61hVHLugeYfQk89",
  reviewsUrl: "https://maps.app.goo.gl/kQ61hVHLugeYfQk89",
};

export const INSTAGRAM_URL = "https://www.instagram.com/vitalitabaq/";
export const FACEBOOK_URL = "https://www.facebook.com/vitalitabaq/";

export const OPINIONES_PUBLICAS = [
  {
    author: "Ángela Garay Suárez",
    text: "El equipo es muy profesional, atento.",
  },
  {
    author: "Brandon Andres Racedo Rodriguez",
    text: "Una gran experiencia, excelente profesionales e instalaciones.",
  },
  {
    author: "Hellen F",
    text: "El mejor aliado para deportistas en terapias física",
  },
];

export const HORARIO = [
  { dias: "Lunes a viernes", horas: "7:00 a. m. – 6:00 p. m." },
  { dias: "Sábados", horas: "8:00 a. m. – 3:00 p. m." },
];

export const DATOS_SERVICIO = {
  duracion: "60 minutos",
  incluye: [
    "Descarga muscular en cuello, hombros y espalda",
    "Presoterapia para piernas y pies",
    "Evaluación funcional antes y después",
    "Masaje manual y liberación miofascial",
    "Ventosas, vibropercusión y termoterapia según tu caso",
  ],
};

/** Flags de contenido pendiente de confirmación. */
export const FLAGS = {
  cuposLimitados: false, // «Cupos limitados por semana»
  tamaraImagenes: false, // beneficio de remisión con descuento
};

export const TAMARA_NOTA =
  "Si necesitas imágenes diagnósticas, podemos orientarte sobre la remisión a Tamara Imágenes, con un 50% de descuento y sin cita previa, presentando la orden de Vitalita.";

export type Benefit = { title: string; body: string; confirmed: boolean };
export const BENEFICIOS: Benefit[] = [
  {
    title: "Una hora dedicada a ti",
    body: "Tu sesión dura 60 minutos y se adapta a cómo llegas y a lo que necesitas.",
    confirmed: true,
  },
  {
    title: "Modalidades incluidas",
    body: "Las técnicas que se indiquen para tu sesión están incluidas, sin cobros por separado.",
    confirmed: true,
  },
  {
    title: "Atención personalizada",
    body: "El fisioterapeuta revisa cómo te mueves antes y después de la sesión.",
    confirmed: true,
  },
  {
    title: "Revaloración en los paquetes",
    body: "Revaloración gratuita en los paquetes de terapia física.",
    confirmed: false,
  },
  {
    title: "Un plan para continuar en casa",
    body: "Te llevas ejercicios y recomendaciones para acompañar tu proceso fuera del consultorio.",
    confirmed: true,
  },
  {
    title: "Horarios que se acomodan a ti",
    body: "Atención entre semana y los sábados, con cita coordinada por WhatsApp.",
    confirmed: true,
  },
];

export type Faq = { q: string; a: string; confirmed: boolean };
export const FAQS: Faq[] = [
  {
    q: "¿Qué incluye la sesión de descarga?",
    a: "Trabajo muscular en cuello, hombros y espalda, presoterapia en piernas y pies, y una evaluación funcional antes y después. Las técnicas se eligen según lo que necesites.",
    confirmed: true,
  },
  { q: "¿Cuánto dura?", a: "La sesión dura 60 minutos.", confirmed: true },
  { q: "¿Necesito una orden médica?", a: "", confirmed: false },
  {
    q: "¿Atienden con SOAT?",
    a: "Sí. Si tuviste un accidente de tránsito, puedes hacer tu proceso de fisioterapia con el SOAT. Escríbenos por WhatsApp y te indicamos los documentos que necesitas para empezar.",
    confirmed: true,
  },
  { q: "¿Cómo puedo pagar?", a: "", confirmed: false },
  {
    q: "¿Atienden en otras ciudades?",
    a: "La atención es presencial en Barranquilla y su área metropolitana. No ofrecemos servicio en otras ciudades.",
    confirmed: true,
  },
  {
    q: "¿Dónde están ubicados?",
    a: "Estamos en Cl. 79 #43B - 45, Norte Centro Histórico, Barranquilla, Atlántico.",
    confirmed: true,
  },
];

export const MEDIA = {
  consultorio: {
    src: "/images/clinic-session.webp",
    alt: "Imagen de stock de una fisioterapeuta guiando un ejercicio de movilidad",
    label: "Sesión de fisioterapia",
  },
  sesion: {
    src: "/images/clinic-session.webp",
    alt: "Imagen de stock de atención fisioterapéutica individual",
    label: "Atención individual",
  },
  deporte: {
    src: "/images/active-recovery.webp",
    alt: "Mujer realizando ejercicio de recuperación",
    label: "Movimiento y recuperación",
  },
  cierre: {
    src: "/images/nestor-sesion-espalda.webp",
    alt: "Néstor Mullet, fisioterapeuta, realizando descarga muscular en la espalda de un paciente en Vitalita",
    label: "Sesión de descarga muscular en Vitalita",
  },
  patron: {
    diaADia: "/images/pattern-dia-a-dia.webp",
    tensionVideo: {
      src: "/videos/doctor-sesion.mp4",
      poster: "/images/doctor-sesion-poster.webp",
    },
    cuerpoNota: "/images/pattern-cuerpo-nota.webp",
    banda: {
      src: "/images/pattern-band-estiramiento.webp",
      alt: "Paciente realizando un estiramiento de cadera en el área de ejercicio de Vitalita",
    },
    atencion: {
      src: "/images/nestor-laser-cervical.webp",
      alt: "Néstor Mullet, fisioterapeuta, aplicando terapia en la zona cervical de un paciente en Vitalita",
    },
  },
  fachada: {
    src: "/images/vitalita-fachada.webp",
    thumb: "/images/vitalita-fachada-thumb.webp",
    alt: "Fachada del centro de fisioterapia Vitalita en Barranquilla",
    label: "Fachada de Vitalita",
  },
  nestor: {
    src: "/images/dr-nestor-mullet.webp",
    alt: "Néstor Mullet, fisioterapeuta, realizando una técnica de fisioterapia en Vitalita",
    label: "Foto de Néstor Mullet, fisioterapeuta",
  },
  /** Patient testimonials (vertical, burned-in subtitles). `name: null` shows a generic label. */
  testimonios: [
    {
      src: "/videos/testimonio-1.mp4",
      poster: "/images/testimonio-1-poster.webp",
      name: "Martha Vargas",
    },
    { src: "/videos/testimonio-2.mp4", poster: "/images/testimonio-2-poster.webp", name: "Hans" },
    { src: "/videos/testimonio-3.mp4", poster: "/images/testimonio-3-poster.webp", name: "Karen" },
    {
      src: "/videos/testimonio-4.mp4",
      poster: "/images/testimonio-4-poster.webp",
      name: "Policarpa",
    },
  ] as { src: string; poster: string; name: string | null }[],
};
