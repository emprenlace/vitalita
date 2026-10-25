import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsProvider } from "@/components/vitalita/AnalyticsProvider";
import { DoctorSection } from "@/components/vitalita/DoctorSection";
import {
  ClosingSection,
  GoogleReviewsSection,
  SiteFooter,
} from "@/components/vitalita/ClosingSections";
import { HeroSection } from "@/components/vitalita/HeroSection";
import { TechniquesSection } from "@/components/vitalita/TechniquesSection";
import { TestimonialsSection } from "@/components/vitalita/TestimonialsSection";
import { FACEBOOK_URL, INSTAGRAM_URL, MEDIA } from "@/config/site";

class TestIntersectionObserver {
  constructor(_callback: IntersectionObserverCallback) {}

  observe() {}

  unobserve() {}

  disconnect() {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", TestIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Vitalita landing content", () => {
  it("shows the four session techniques in a centered visual carousel with booking CTA", () => {
    const dataLayer: Record<string, unknown>[] = [];
    Object.assign(window, { dataLayer });

    render(
      <AnalyticsProvider>
        <TechniquesSection />
      </AnalyticsProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "Cada tensión tiene su técnica" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(4);
    expect(screen.getByText("Tracción cervical")).toBeInTheDocument();
    expect(
      screen.getByText("Una tracción suave que le da espacio y descanso a tu cuello."),
    ).toBeInTheDocument();
    expect(document.querySelector(".techniques-action > p")).toHaveTextContent("$100.000 COP");
    const bookingButton = screen.getByRole("button", { name: /Agenda tu sesión/ });
    expect(bookingButton).toBeInTheDocument();

    fireEvent.click(bookingButton);

    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Agendar mi Sesión de Descarga en Barranquilla",
    );
    expect(dataLayer.at(-1)).toMatchObject({
      event: "vitalita_booking_dialog_open",
      cta_location: "techniques",
    });
  });

  it("presents the session and price in the immersive hero with the WhatsApp booking action", () => {
    render(
      <AnalyticsProvider>
        <HeroSection />
      </AnalyticsProvider>,
    );

    expect(
      screen.getByRole("heading", {
        name: "La tensión diaria también merece atención.",
      }),
    ).toBeInTheDocument();
    expect(document.querySelector(".hero-session-name")).toHaveTextContent(
      "Sesión de descarga muscular",
    );
    expect(screen.getByText(/100\.000 COP/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Agenda tu sesión/ })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Cómo llegar a Vitalita en Barranquilla" }),
    ).toHaveAttribute("href", "https://maps.app.goo.gl/kQ61hVHLugeYfQk89");
    expect(screen.getByLabelText("Detalles de la sesión")).toHaveTextContent(
      "60 minatención individualTécnicas incluidassegún tu casoBarranquillapresencial",
    );
    expect(document.querySelector(".hero-backdrop-video")).toHaveAttribute(
      "poster",
      "/images/hero-poster.webp",
    );
    // The hero video is deferred until after page load so the poster is the first paint.
    expect(document.querySelector(".hero-backdrop-video")).toHaveAttribute("preload", "none");
    expect(screen.queryByText("Evaluación funcional")).not.toBeInTheDocument();
  });

  it("plays the patient testimonials natively and links to the Instagram profile", () => {
    const { container } = render(
      <AnalyticsProvider>
        <TestimonialsSection />
      </AnalyticsProvider>,
    );

    const videos = container.querySelectorAll<HTMLVideoElement>(".story-video");
    expect(videos).toHaveLength(MEDIA.testimonios.length);
    // Sources attach only once the section nears the viewport (never in this test).
    videos.forEach((video) => {
      expect(video).not.toHaveAttribute("src");
      expect(video).toHaveAttribute("preload", "none");
    });
    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.getByRole("link", { name: /perfil de Vitalita en Instagram/ })).toHaveAttribute(
      "href",
      "https://www.instagram.com/vitalitabaq/",
    );
  });

  it("shows only verified review excerpts and links to the Google reviews", () => {
    const { container } = render(<GoogleReviewsSection />);
    const reviewGroup = container.querySelector<HTMLElement>(".review-marquee-group");
    if (!reviewGroup) {
      throw new Error("Could not find the verified review cards.");
    }
    const visibleReviews = within(reviewGroup);

    expect(visibleReviews.getByText(/El equipo es muy profesional, atento\./)).toBeInTheDocument();
    expect(
      visibleReviews.getByText(/Una gran experiencia, excelente profesionales e instalaciones\./),
    ).toBeInTheDocument();
    expect(
      visibleReviews.getByText(/El mejor aliado para deportistas en terapias física/),
    ).toBeInTheDocument();
    expect(screen.getByText("5.0")).toBeInTheDocument();
    expect(screen.getByText("en Google")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Google" })).toBeInTheDocument();
    expect(screen.queryByText(/26 opiniones/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver reseñas en Google" })).toHaveAttribute(
      "href",
      "https://maps.app.goo.gl/kQ61hVHLugeYfQk89",
    );
  });

  it("shows the supplied portrait of Néstor Mullet", () => {
    render(
      <AnalyticsProvider>
        <DoctorSection />
      </AnalyticsProvider>,
    );

    expect(screen.getByRole("heading", { name: "Néstor Mullet" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: MEDIA.nestor.alt })).toHaveAttribute(
      "src",
      "/images/dr-nestor-mullet.webp",
    );
    expect(screen.getByText("Universidad Simón Bolívar · Barranquilla")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Áreas de enfoque" })).toHaveTextContent(
      "RehabilitaciónMasaje terapéuticoDolor lumbar, cervical y postural",
    );
  });

  it("keeps the closing CTA focused on booking and directions", () => {
    render(
      <AnalyticsProvider>
        <ClosingSection />
      </AnalyticsProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "Regálate una hora para sentir la diferencia." }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Agenda tu sesión/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Cómo llegar/ })).toHaveAttribute(
      "href",
      "https://maps.app.goo.gl/kQ61hVHLugeYfQk89",
    );
  });

  it("lists address, hours and social links in the footer", () => {
    render(
      <AnalyticsProvider>
        <SiteFooter />
      </AnalyticsProvider>,
    );

    expect(screen.getByText(/Cl\. 79 #43B - 45/)).toBeInTheDocument();
    expect(screen.getByText("Lunes a viernes")).toBeInTheDocument();
    expect(screen.getByText("7:00 a. m. – 6:00 p. m.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Instagram de Vitalita" })).toHaveAttribute(
      "href",
      INSTAGRAM_URL,
    );
    expect(screen.getByRole("link", { name: "Facebook de Vitalita" })).toHaveAttribute(
      "href",
      FACEBOOK_URL,
    );
    expect(screen.getByRole("button", { name: /WhatsApp de Vitalita/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Abrir en Google Maps/ })).toHaveAttribute(
      "href",
      "https://maps.app.goo.gl/kQ61hVHLugeYfQk89",
    );
  });
});
