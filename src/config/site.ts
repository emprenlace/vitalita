/**
 * Datos de negocio centralizados de Vitalita.
 * Todo valor editable (número, precio, dirección, horarios, IDs de analítica)
 * vive aquí. Los contenidos con `confirmed: false` NO se publican.
 */

export const GTM_ID = "GTM-K4NN7CKL";
export const META_PIXEL_ID = ""; // Configura el Pixel directo solo si no se usa GTM.
export const WHATSAPP_NUMBER = "573012376079";
export const SITE_URL = "https://www.vitalita.com.co";
/** Service landing pages (also listed in the sitemap). */
export const SERVICE_PAGES = [
  { path: "/masajes-terapeuticos-barranquilla", name: "Masajes terapéuticos" },
  { path: "/presoterapia-barranquilla", name: "Presoterapia" },
  { path: "/fisioterapia-deportiva-barranquilla", name: "Fisioterapia deportiva" },
];
/** Where link previews (WhatsApp, Facebook) fetch the share image from. */
export const PUBLIC_URL = SITE_URL;
/** Search Console HTML-tag verification code (only the `content` value). Empty = no tag. */
export const GOOGLE_SITE_VERIFICATION = "rp7lC939cQtxYG3fTVhWUwve9EFVc_bO0w_wHtGMGLw";

export const PRECIO_SESION = {
  value: 100000,
  currency: "COP",
  label: "$100.000 COP",
  /** Always shown to visitors: the session price is a starting price. */
  fromLabel: "Desde $100.000 COP",
};

/** Google Business Profile rating, as shown on Google Maps. Update when it changes. */
export const GOOGLE_RATING = { score: "5,0" };

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
export const FRESHA_URL =
  "https://www.fresha.com/a/vitalita-centro-de-fisioterapia-barranquilla-norte-centro-historico-calle-79-43b45-c1ukehdx";
/** Brand names people search for; tells Google they all mean this clinic. */
export const BRAND_NAME = "Vitalita";
export const BRAND_ALT_NAMES = [
  "Vitalita Centro de Fisioterapia",
  "Vitalita Barranquilla",
  "Vitalita Fisioterapia",
];
/** Stable ids that tie the website, the clinic and the blog together in structured data. */
export const CLINIC_ID = "https://www.vitalita.com.co/#clinica";
export const WEBSITE_ID = "https://www.vitalita.com.co/#website";

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
  duracion: "50 minutos",
  minutos: 50,
  realizado: "Por un fisioterapeuta",
};

/**
 * The session is booked for ONE zone. Both options cost the same and last the same;
 * the techniques shared by both are applied according to the initial assessment.
 */
export const OPCIONES_SESION = [
  {
    id: "superior",
    zona: "cuello, hombros y espalda",
    titulo: "Sesión en cuello, hombros y espalda",
    incluye: [
      "Descarga muscular en cuello, hombros y espalda",
      "Tracción cervical manual",
      "Evaluación funcional antes y después",
      "Ventosas + masoterapia",
      "Liberación miofascial + masaje vibropercutor",
    ],
  },
  {
    id: "piernas",
    zona: "piernas y pies",
    titulo: "Sesión en piernas y pies",
    incluye: [
      "Descarga muscular en piernas y pies",
      "Presoterapia",
      "Evaluación funcional antes y después",
      "Ventosas + masoterapia",
      "Liberación miofascial + masaje vibropercutor",
    ],
  },
] as const;

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
    title: "Una sesión dedicada a ti",
    body: "Tu sesión dura 50 minutos y se adapta a cómo llegas y a lo que necesitas.",
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
    a: "Atención personalizada para aliviar tensiones musculares, favorecer la recuperación y mejorar tu bienestar, con técnicas seleccionadas según tus necesidades. Cada sesión se enfoca en una zona: cuello, hombros y espalda, o piernas y pies.",
    confirmed: true,
  },
  { q: "¿Cuánto dura?", a: "La sesión dura 50 minutos.", confirmed: true },
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
    src: "/images/vitalita-fachada-local.webp",
    alt: "Fachada de Vitalita Centro de Fisioterapia en el Norte Centro Histórico de Barranquilla",
    label: "Fachada de Vitalita",
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
