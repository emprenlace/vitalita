import { AnimatePresence, m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Check, MapPin, Star, type LucideIcon } from "lucide-react";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BlogShell } from "@/components/vitalita/BlogShell";
import { FaqSection, GoogleReviewsSection } from "@/components/vitalita/ClosingSections";
import { PricingSection } from "@/components/vitalita/PricingSection";
import { Reveal } from "@/components/vitalita/primitives";
import { TechniquesSection } from "@/components/vitalita/TechniquesSection";
import { WhatsAppButton } from "@/components/vitalita/WhatsAppButton";
import {
  CLINIC_ID,
  DATOS_SERVICIO,
  DIRECCION,
  GOOGLE_RATING,
  PRECIO_SESION,
  PUBLIC_URL,
  SERVICE_PAGES,
  SITE_URL,
} from "@/config/site";
import { cn } from "@/lib/utils";

type Compare = {
  kind: "compare";
  label: string;
  title: [string, string];
  columns: [string, string];
  rows: { label: string; a: string; b: string }[];
};
type Steps = {
  kind: "steps";
  label: string;
  title: [string, string];
  steps: { title: string; body: string }[];
};
type Sports = {
  kind: "sports";
  label: string;
  title: [string, string];
  sports: {
    id: string;
    name: string;
    icon: LucideIcon;
    zones: string;
    session: string;
    zona: string;
  }[];
};

export type ServicePage = {
  path: string;
  metaTitle: string;
  metaDescription: string;
  /** Breadcrumb / menu name. */
  label: string;
  /** H1, split in lines for the reveal animation. */
  h1Lines: string[];
  lede: ReactNode;
  /** Hero background photo (right side on desktop, full on mobile). */
  photo: { src: string; position?: string };
  intro: { label: string; title: [string, string]; body: ReactNode };
  cases: { title: string; items: { title: string; body: string; icon: LucideIcon }[] };
  feature: Compare | Steps | Sports;
  faq: { title: [string, string]; items: { q: string; a: string }[] };
  serviceName: string;
  serviceType: string;
};

/** Head tags for a service page: canonical, Open Graph and its Service / FAQ / Breadcrumb data. */
export function serviceHead(page: ServicePage) {
  const url = `${SITE_URL}${page.path}`;
  const h1 = page.h1Lines.join(" ");
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
      { property: "og:title", content: h1 },
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

const enter = (delay: number) => ({ style: { "--hero-delay": `${delay}s` } as CSSProperties });

/**
 * Light hero, same family as the blog: ink text on the page canvas and the photo as the
 * only colour, in its own rounded card. The video hero stays exclusive to the home.
 */
function ServiceHero({ page }: { page: ServicePage }) {
  const reduce = useReducedMotion();
  const photoRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: photoRef, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  return (
    <section id="top" className="svc-hero">
      <div className="container-x svc-hero-grid">
        <div className="hero-copy svc-hero-copy">
          <p {...enter(0)} className="hero-in eyebrow svc-hero-eyebrow">
            Vitalita, centro de fisioterapia
          </p>
          <h1 className="hero-title svc-hero-title" aria-label={page.h1Lines.join(" ")}>
            {page.h1Lines.map((line, index) => (
              <span
                className={index === 0 ? "hero-title-line hero-title-soft" : "hero-title-line"}
                key={line}
              >
                <span
                  className="hero-line-in"
                  style={{ "--hero-delay": `${0.12 + index * 0.12}s` } as CSSProperties}
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <p {...enter(0.45)} className="hero-in hero-lede">
            {page.lede}
          </p>
          <div {...enter(0.6)} className="hero-in hero-main-action">
            <WhatsAppButton
              origin="service"
              size="lg"
              className="hero-main-button"
              hideIcon
              ariaLabel="Agenda tu sesión. Abre opciones para agendar."
            >
              <>
                <span>Agenda tu sesión</span>
                <span className="hero-main-arrow">
                  <ArrowUpRight aria-hidden />
                </span>
              </>
            </WhatsAppButton>
            <a
              href={DIRECCION.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-location"
              aria-label="Cómo llegar a Vitalita en Barranquilla"
            >
              <MapPin aria-hidden />
              Cómo llegar
            </a>
          </div>
          <dl {...enter(0.8)} className="hero-in hero-stats" aria-label="Detalles de la sesión">
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

        <div ref={photoRef} {...enter(0.2)} className="hero-in svc-hero-photo">
          <m.img
            src={page.photo.src}
            alt=""
            fetchPriority="high"
            decoding="async"
            style={{
              ...(reduce ? {} : { y: imageY }),
              ...(page.photo.position ? { objectPosition: page.photo.position } : {}),
            }}
          />
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ title, id }: { title: [string, string]; id: string }) {
  return (
    <h2 id={id} className="pattern-title svc-section-title">
      <span className="pattern-title-soft">{title[0]}</span> <span>{title[1]}</span>
    </h2>
  );
}

function IntroSection({ page }: { page: ServicePage }) {
  return (
    <section className="svc-section" aria-labelledby="svc-intro">
      <div className="container-x svc-intro-grid">
        <Reveal className="svc-prose">
          <p className="section-label">{page.intro.label}</p>
          <SectionTitle title={page.intro.title} id="svc-intro" />
          {page.intro.body}
        </Reveal>
        <div className="svc-cases" aria-label={page.cases.title}>
          <Reveal>
            <h3 className="svc-cases-title">{page.cases.title}</h3>
          </Reveal>
          {page.cases.items.map((c, index) => {
            const Icon = c.icon;
            return (
              <Reveal key={c.title} delay={0.08 * (index + 1)} className="svc-case">
                <span className="svc-case-icon" aria-hidden>
                  <Icon />
                </span>
                <span>
                  <strong>{c.title}</strong>
                  <span>{c.body}</span>
                </span>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CompareFeature({ f }: { f: Compare }) {
  return (
    <section className="svc-section svc-feature" aria-labelledby="svc-feature">
      <div className="container-x">
        <Reveal className="svc-feature-head">
          <p className="section-label">{f.label}</p>
          <SectionTitle title={f.title} id="svc-feature" />
        </Reveal>
        <Reveal delay={0.1} className="svc-compare">
          <div className="svc-compare-row svc-compare-head" aria-hidden>
            <span />
            <span>{f.columns[0]}</span>
            <span>{f.columns[1]}</span>
          </div>
          {f.rows.map((r) => (
            <div key={r.label} className="svc-compare-row">
              <span className="svc-compare-label">{r.label}</span>
              <span className="svc-compare-a">
                <span className="svc-compare-mobile-label">{f.columns[0]}: </span>
                {r.a}
              </span>
              <span className="svc-compare-b">
                <span className="svc-compare-mobile-label">{f.columns[1]}: </span>
                {r.b}
              </span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function StepsFeature({ f }: { f: Steps }) {
  return (
    <section className="svc-section svc-feature" aria-labelledby="svc-feature">
      <div className="container-x">
        <Reveal className="svc-feature-head">
          <p className="section-label">{f.label}</p>
          <SectionTitle title={f.title} id="svc-feature" />
        </Reveal>
        <div className="svc-steps">
          {f.steps.map((s, index) => (
            <Reveal key={s.title} delay={0.1 * index} className="svc-step">
              <span className="svc-step-num" aria-hidden>
                {String(index + 1).padStart(2, "0")}
              </span>
              <strong>{s.title}</strong>
              <p>{s.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function SportsFeature({ f }: { f: Sports }) {
  const [active, setActive] = useState(f.sports[0]?.id ?? "");
  const reduce = useReducedMotion();
  const sport = f.sports.find((s) => s.id === active) ?? f.sports[0];
  if (!sport) return null;
  return (
    <section className="svc-section svc-feature" aria-labelledby="svc-feature">
      <div className="container-x">
        <Reveal className="svc-feature-head">
          <p className="section-label">{f.label}</p>
          <SectionTitle title={f.title} id="svc-feature" />
        </Reveal>
        <Reveal delay={0.1} className="svc-sports">
          <div className="svc-sports-tabs" role="tablist" aria-label="Elige tu deporte">
            {f.sports.map((s) => {
              const Icon = s.icon;
              const on = s.id === sport.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls="svc-sport-panel"
                  className={cn("svc-sport-tab", on && "is-on")}
                  onClick={() => setActive(s.id)}
                >
                  <Icon aria-hidden />
                  {s.name}
                </button>
              );
            })}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={sport.id}
              id="svc-sport-panel"
              role="tabpanel"
              className="svc-sport-panel"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: reduce ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="svc-sport-k">Lo que más se carga</p>
              <p className="svc-sport-v">{sport.zones}</p>
              <p className="svc-sport-k">Tu sesión</p>
              <p className="svc-sport-v">
                <Check aria-hidden />
                {sport.session}
              </p>
              <WhatsAppButton
                origin="service"
                size="md"
                className="svc-sport-cta"
                zones={[sport.zona]}
                ariaLabel={`Agendar ${sport.session.toLowerCase()}. Abre opciones para agendar.`}
              >
                Agendar esta sesión
              </WhatsAppButton>
            </m.div>
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}

function RelatedServices({ path }: { path: string }) {
  const others = SERVICE_PAGES.filter((p) => p.path !== path);
  return (
    <nav className="container-x svc-related" aria-label="Otros servicios">
      <p className="section-label">También en Vitalita</p>
      <div className="svc-related-grid">
        {others.map((p, index) => (
          <Reveal key={p.path} delay={0.08 * index}>
            <a href={p.path} className="svc-related-card">
              <span>
                <strong>{p.name}</strong>
                <span>{p.desc}</span>
              </span>
              <ArrowUpRight aria-hidden />
            </a>
          </Reveal>
        ))}
      </div>
    </nav>
  );
}

/** Shared layout for service pages; every booking button is the site's qualifying CTA. */
export function ServiceLanding({ page }: { page: ServicePage }) {
  const f = page.feature;
  return (
    <BlogShell variant="service">
      <ServiceHero page={page} />
      <IntroSection page={page} />
      {f.kind === "compare" && <CompareFeature f={f} />}
      {f.kind === "steps" && <StepsFeature f={f} />}
      {f.kind === "sports" && <SportsFeature f={f} />}
      <TechniquesSection />
      <PricingSection />
      <GoogleReviewsSection />
      <FaqSection items={page.faq.items} title={page.faq.title} />
      <RelatedServices path={page.path} />
    </BlogShell>
  );
}
