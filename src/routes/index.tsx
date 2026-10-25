import { createFileRoute } from "@tanstack/react-router";
import { LazyMotion } from "framer-motion";
import { AnalyticsProvider } from "@/components/vitalita/AnalyticsProvider";
import { AssessmentSection } from "@/components/vitalita/AssessmentSection";
import {
  FaqSection,
  GoogleReviewsSection,
  SiteFooter,
  StickyCta,
} from "@/components/vitalita/ClosingSections";
import { DoctorSection } from "@/components/vitalita/DoctorSection";
import { HeroSection } from "@/components/vitalita/HeroSection";
import { PatternSection } from "@/components/vitalita/PatternSection";
import { PricingSection } from "@/components/vitalita/PricingSection";
import { SiteHeader } from "@/components/vitalita/SiteHeader";
import { TechniquesSection } from "@/components/vitalita/TechniquesSection";
import { TimelineSection } from "@/components/vitalita/TimelineSection";
import { TestimonialsSection } from "@/components/vitalita/TestimonialsSection";
import {
  DIRECCION,
  FAQS,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  PRECIO_SESION,
  PUBLIC_URL,
  SITE_URL,
  WHATSAPP_NUMBER,
} from "@/config/site";

const loadMotionFeatures = () => import("@/lib/motion-features").then((mod) => mod.default);

// Brand first, then the two terms people search locally ("fisioterapia", "rehabilitación")
// and the city. Title ≤ 60 chars and description ≤ 155 so Google shows them uncut.
const TITLE = "Vitalita | Fisioterapia y Rehabilitación en Barranquilla";
const DESC =
  "Fisioterapia en Barranquilla enfocada en rehabilitación y dolor de espalda, cuello y hombros. Sesión de 60 min desde $100.000. Agenda hoy por WhatsApp.";
const CANONICAL_URL = `${SITE_URL}/`;
const SOCIAL_IMAGE_URL = `${PUBLIC_URL}/images/og-vitalita.jpg`;
// Link previews (WhatsApp, redes): logo + brand line.
const SHARE_TITLE = "Vitalita";
const SHARE_DESC = "Centro de Fisioterapia";
const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  name: "Vitalita Centro de Fisioterapia",
  medicalSpecialty: "PhysicalTherapy",
  url: SITE_URL,
  image: `${SITE_URL}/images/vitalita-fachada.webp`,
  logo: `${SITE_URL}/images/vitalita-logo-full.jpg`,
  telephone: `+${WHATSAPP_NUMBER}`,
  description:
    "Centro de fisioterapia en Barranquilla enfocado en rehabilitación, masaje terapéutico y alivio del dolor lumbar, cervical y postural, con atención presencial y personalizada.",
  hasMap: DIRECCION.mapsUrl,
  availableService: [
    "Sesión de descarga muscular",
    "Rehabilitación",
    "Masaje terapéutico y liberación miofascial",
    "Presoterapia",
    "Ventosas",
    "Evaluación funcional",
  ].map((name) => ({ "@type": "MedicalTherapy", name })),
  makesOffer: {
    "@type": "Offer",
    name: "Sesión de descarga muscular (60 minutos)",
    price: PRECIO_SESION.value,
    priceCurrency: PRECIO_SESION.currency,
    priceSpecification: {
      "@type": "PriceSpecification",
      minPrice: PRECIO_SESION.value,
      priceCurrency: PRECIO_SESION.currency,
    },
  },
  priceRange: PRECIO_SESION.fromLabel,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Cl. 79 #43B - 45",
    addressLocality: "Barranquilla",
    addressRegion: "Atlántico",
    addressCountry: "CO",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "07:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "08:00",
      closes: "15:00",
    },
  ],
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Barranquilla y su área metropolitana",
  },
  sameAs: [INSTAGRAM_URL, FACEBOOK_URL],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: `+${WHATSAPP_NUMBER}`,
    contactType: "reservas",
    availableLanguage: "Spanish",
  },
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.filter((f) => f.confirmed && f.a).map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: SHARE_TITLE },
      { property: "og:description", content: SHARE_DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${PUBLIC_URL}/` },
      { property: "og:site_name", content: "Vitalita Centro de Fisioterapia" },
      { property: "og:locale", content: "es_CO" },
      { property: "og:image", content: SOCIAL_IMAGE_URL },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "Logo de Vitalita, Centro de Fisioterapia",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SHARE_TITLE },
      { name: "twitter:description", content: SHARE_DESC },
      { name: "twitter:image", content: SOCIAL_IMAGE_URL },
    ],
    links: [
      { rel: "canonical", href: CANONICAL_URL },
      // LCP on mobile: the hero video poster.
      { rel: "preload", as: "image", href: "/images/hero-poster.webp", fetchPriority: "high" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(LOCAL_BUSINESS_SCHEMA),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(FAQ_SCHEMA),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    // `m.*` components only ship the animation features loaded here (strict: no `motion.*`).
    <LazyMotion features={loadMotionFeatures} strict>
      <AnalyticsProvider>
        <SiteHeader />
        <a href="#main-content" className="skip-link">
          Saltar al contenido
        </a>
        <main id="main-content">
          <HeroSection />
          <TechniquesSection />
          <PatternSection />
          <AssessmentSection />
          <TimelineSection />
          <PricingSection />
          <TestimonialsSection />
          <DoctorSection />
          <FaqSection />
          <GoogleReviewsSection />
        </main>
        <SiteFooter />
        <StickyCta />
      </AnalyticsProvider>
    </LazyMotion>
  );
}
