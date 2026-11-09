import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin, Star } from "lucide-react";
import { BlogShell } from "@/components/vitalita/BlogShell";
import { PricingSection } from "@/components/vitalita/PricingSection";
import { TechniquesSection } from "@/components/vitalita/TechniquesSection";
import { WhatsAppButton } from "@/components/vitalita/WhatsAppButton";
import {
  CLINIC_ID,
  DATOS_SERVICIO,
  DIRECCION,
  GOOGLE_RATING,
  HORARIO,
  OPINIONES_PUBLICAS,
  PRECIO_SESION,
  PUBLIC_URL,
  SITE_URL,
} from "@/config/site";
import { responsive } from "@/lib/responsive";

const PATH = "/masajes-terapeuticos-barranquilla";
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = "Masajes terapéuticos en Barranquilla | Vitalita";
const DESC = `Masaje descontracturante y descarga muscular con fisioterapeuta en Barranquilla. Sesión individual de ${DATOS_SERVICIO.duracion}, desde ${PRECIO_SESION.label}. Agenda por WhatsApp.`;
const PHOTO = "/images/tecnica-masoterapia.webp";

/** Situations people search for; each one is a reason to book, not a promised result. */
const CASES = [
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
];

const FAQ = [
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
];

const SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${PAGE_URL}#servicio`,
      name: "Masajes terapéuticos en Barranquilla",
      serviceType: "Masaje terapéutico y descarga muscular",
      description: DESC,
      url: PAGE_URL,
      provider: { "@id": CLINIC_ID },
      areaServed: { "@type": "City", name: "Barranquilla" },
      offers: {
        "@type": "Offer",
        price: PRECIO_SESION.value,
        priceCurrency: PRECIO_SESION.currency,
        priceSpecification: {
          "@type": "PriceSpecification",
          minPrice: PRECIO_SESION.value,
          priceCurrency: PRECIO_SESION.currency,
        },
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Masajes terapéuticos", item: PAGE_URL },
      ],
    },
  ],
};

export const Route = createFileRoute("/masajes-terapeuticos-barranquilla")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Masajes terapéuticos en Barranquilla" },
      { property: "og:description", content: DESC },
      { property: "og:url", content: PAGE_URL },
      { property: "og:image", content: `${PUBLIC_URL}/images/og-vitalita.jpg` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
    ],
    links: [
      { rel: "canonical", href: PAGE_URL },
      { rel: "preload", as: "image", href: PHOTO, fetchPriority: "high" },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(SCHEMA) }],
  }),
  component: MassagePage,
});

function MassagePage() {
  return (
    <BlogShell>
      <section className="svc-hero container-x" aria-labelledby="svc-title">
        <div className="svc-hero-copy">
          <p className="section-label">Masajes terapéuticos</p>
          <h1 id="svc-title" className="svc-title">
            Masajes terapéuticos en Barranquilla
          </h1>
          <p className="svc-lede">
            Masaje descontracturante y descarga muscular con fisioterapeuta, en una sesión
            individual de {DATOS_SERVICIO.duracion}. En el Norte Centro Histórico, desde{" "}
            {PRECIO_SESION.label}.
          </p>
          <div className="svc-actions">
            <WhatsAppButton
              origin="service"
              size="lg"
              hideIcon
              className="svc-cta"
              ariaLabel="Agenda tu sesión. Abre opciones para agendar."
            >
              <>
                <span>Agenda tu sesión</span>
                <span className="svc-cta-arrow">
                  <ArrowUpRight aria-hidden />
                </span>
              </>
            </WhatsAppButton>
            <a
              href={DIRECCION.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="svc-link"
              aria-label="Cómo llegar a Vitalita en Barranquilla"
            >
              <MapPin aria-hidden />
              Cómo llegar
            </a>
          </div>
          <dl className="svc-facts" aria-label="Detalles de la sesión">
            <div>
              <dt>
                {GOOGLE_RATING.score}
                <Star aria-hidden />
              </dt>
              <dd>en Google</dd>
            </div>
            <div>
              <dt>{DATOS_SERVICIO.minutos} min</dt>
              <dd>individual</dd>
            </div>
            <div>
              <dt className="hero-session-name">{PRECIO_SESION.label.replace(" COP", "")}</dt>
              <dd>desde, por sesión</dd>
            </div>
          </dl>
        </div>
        <figure className="svc-photo">
          <img
            src={PHOTO}
            {...responsive(PHOTO, "(max-width: 899px) 92vw, 480px")}
            alt="Masaje terapéutico manual en la espalda durante una sesión de masoterapia"
            width={640}
            height={854}
            fetchPriority="high"
            decoding="async"
          />
        </figure>
      </section>

      <section className="svc-section container-x" aria-labelledby="svc-que-es">
        <div className="svc-prose">
          <p className="section-label">Un masaje con criterio clínico</p>
          <h2 id="svc-que-es" className="svc-h2">
            Un masaje hecho por un fisioterapeuta
          </h2>
          <p>
            Un masaje terapéutico no es un masaje de spa. Antes de empezar, el fisioterapeuta revisa
            cómo te mueves y dónde está la tensión, y con eso decide qué técnicas usar y con qué
            intensidad. Al final vuelve a evaluar tu movilidad y te da recomendaciones para
            continuar en casa.
          </p>
          <p>
            Cada sesión se enfoca en una zona: <strong>cuello, hombros y espalda</strong>, con
            tracción cervical manual, o <strong>piernas y pies</strong>, con presoterapia. Las
            técnicas que se indiquen en la valoración están incluidas, sin cobros aparte.
          </p>
          <p className="svc-more">
            ¿Dudas entre una descarga y un masaje descontracturante?{" "}
            <Link
              to="/blog/$slug"
              params={{ slug: "descarga-muscular-vs-masaje-descontracturante" }}
            >
              Te explicamos la diferencia
            </Link>
            .
          </p>
        </div>

        <div className="svc-cases">
          <h2 className="svc-h3">Cuándo te puede servir</h2>
          <div className="svc-cases-grid">
            {CASES.map((c) => (
              <article key={c.title} className="svc-case">
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <TechniquesSection />
      <PricingSection />

      <section className="svc-section container-x" aria-labelledby="svc-opiniones">
        <div className="svc-reviews-head">
          <p className="section-label">Experiencias en Google</p>
          <h2 id="svc-opiniones" className="svc-h2">
            {GOOGLE_RATING.score} de 5 en Google
          </h2>
        </div>
        <div className="svc-reviews">
          {OPINIONES_PUBLICAS.map((o) => (
            <figure key={o.author} className="svc-review">
              <span className="svc-review-stars" role="img" aria-label="5 de 5 estrellas">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} aria-hidden />
                ))}
              </span>
              <blockquote>“{o.text}”</blockquote>
              <figcaption>{o.author}</figcaption>
            </figure>
          ))}
        </div>
        <a
          href={DIRECCION.reviewsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="svc-link svc-reviews-link"
        >
          Ver todas las reseñas en Google
          <ArrowUpRight aria-hidden />
        </a>
      </section>

      <section className="svc-section container-x" aria-labelledby="svc-faq">
        <div className="svc-faq">
          <p className="section-label">Preguntas frecuentes</p>
          <h2 id="svc-faq" className="svc-h2">
            Sobre los masajes terapéuticos
          </h2>
          <div className="svc-faq-list">
            {FAQ.map((f) => (
              <details key={f.q} className="svc-faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </BlogShell>
  );
}
