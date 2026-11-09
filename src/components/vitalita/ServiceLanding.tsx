import { ArrowUpRight, MapPin, Star } from "lucide-react";
import type { ReactNode } from "react";
import { BlogShell } from "@/components/vitalita/BlogShell";
import { PricingSection } from "@/components/vitalita/PricingSection";
import { TechniquesSection } from "@/components/vitalita/TechniquesSection";
import { WhatsAppButton } from "@/components/vitalita/WhatsAppButton";
import {
  CLINIC_ID,
  DATOS_SERVICIO,
  DIRECCION,
  GOOGLE_RATING,
  OPINIONES_PUBLICAS,
  PRECIO_SESION,
  PUBLIC_URL,
  SERVICE_PAGES,
  SITE_URL,
} from "@/config/site";
import { responsive } from "@/lib/responsive";

export type ServicePage = {
  path: string;
  /** <title> and meta description. */
  metaTitle: string;
  metaDescription: string;
  /** Small handwritten label above the H1, the H1 itself and the lede under it. */
  label: string;
  h1: string;
  lede: ReactNode;
  photo: { src: string; alt: string; width: number; height: number };
  intro: { label: string; title: string; body: ReactNode };
  cases: { title: string; items: { title: string; body: string }[] };
  faq: { title: string; items: { q: string; a: string }[] };
  /** schema.org Service fields. */
  serviceName: string;
  serviceType: string;
};

/** Head tags for a service page: canonical, Open Graph and its Service / FAQ / Breadcrumb data. */
export function serviceHead(page: ServicePage) {
  const url = `${SITE_URL}${page.path}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#servicio`,
        name: page.serviceName,
        serviceType: page.serviceType,
        description: page.metaDescription,
        url,
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
        mainEntity: page.faq.items.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: page.label, item: url },
        ],
      },
    ],
  };
  return {
    meta: [
      { title: page.metaTitle },
      { name: "description", content: page.metaDescription },
      { property: "og:type", content: "website" },
      { property: "og:title", content: page.h1 },
      { property: "og:description", content: page.metaDescription },
      { property: "og:url", content: url },
      { property: "og:image", content: `${PUBLIC_URL}/images/og-vitalita.jpg` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "preload", as: "image", href: page.photo.src, fetchPriority: "high" as const },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(schema) }],
  };
}

/** Shared layout for service pages; the booking button is the site's qualifying CTA. */
export function ServiceLanding({ page }: { page: ServicePage }) {
  const others = SERVICE_PAGES.filter((p) => p.path !== page.path);
  return (
    <BlogShell>
      <section className="svc-hero container-x" aria-labelledby="svc-title">
        <div className="svc-hero-copy">
          <p className="section-label">{page.label}</p>
          <h1 id="svc-title" className="svc-title">
            {page.h1}
          </h1>
          <p className="svc-lede">{page.lede}</p>
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
            src={page.photo.src}
            {...responsive(page.photo.src, "(max-width: 899px) 92vw, 480px")}
            alt={page.photo.alt}
            width={page.photo.width}
            height={page.photo.height}
            fetchPriority="high"
            decoding="async"
          />
        </figure>
      </section>

      <section className="svc-section container-x" aria-labelledby="svc-intro">
        <div className="svc-prose">
          <p className="section-label">{page.intro.label}</p>
          <h2 id="svc-intro" className="svc-h2">
            {page.intro.title}
          </h2>
          {page.intro.body}
        </div>

        <div className="svc-cases">
          <h2 className="svc-h3">{page.cases.title}</h2>
          <div className="svc-cases-grid">
            {page.cases.items.map((c) => (
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
            {page.faq.title}
          </h2>
          <div className="svc-faq-list">
            {page.faq.items.map((f) => (
              <details key={f.q} className="svc-faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Links between service pages, so each one is reachable from the others. */}
        <nav className="svc-related" aria-label="Otros servicios">
          <p className="svc-related-title">También en Vitalita</p>
          <div>
            {others.map((p) => (
              <a key={p.path} href={p.path} className="svc-link">
                {p.name}
                <ArrowUpRight aria-hidden />
              </a>
            ))}
          </div>
        </nav>
      </section>
    </BlogShell>
  );
}
