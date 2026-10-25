import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnalyticsProvider } from "@/components/vitalita/AnalyticsProvider";
import { AssessmentSection } from "@/components/vitalita/AssessmentSection";
import { WhatsAppButton } from "@/components/vitalita/WhatsAppButton";
import { sanitize, track } from "@/lib/analytics";

describe("Vitalita booking flow", () => {
  it("opens the city selector and filters out-of-city visitors transparently", () => {
    render(
      <AnalyticsProvider>
        <WhatsAppButton origin="hero">Agendar mi sesión</WhatsAppButton>
      </AnalyticsProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Agendar mi sesión/ }));

    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Agendar mi Sesión de Descarga en Barranquilla",
    );
    expect(screen.getByRole("dialog")).toHaveTextContent("desde $100.000 COP");

    fireEvent.click(screen.getByRole("button", { name: "Estoy en otra ciudad" }));

    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Nuestra atención es presencial en Barranquilla",
    );
    expect(screen.getByRole("link", { name: /Puedo viajar, quiero agendar/ })).toHaveAttribute(
      "href",
      expect.stringContaining("wa.me/573012376079"),
    );
  });

  it("adds the chosen body zones to the WhatsApp text only", () => {
    class IO {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IO;
    const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
    w.dataLayer = [];
    render(
      <AnalyticsProvider>
        <AssessmentSection />
      </AnalyticsProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cuello" }));
    fireEvent.click(screen.getByRole("button", { name: "Zona lumbar" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Agendar con foco en cuello y zona lumbar" }),
    );

    const href = decodeURIComponent(
      screen.getByRole("link", { name: /Estoy en Barranquilla/ }).getAttribute("href") ?? "",
    );
    expect(href).toContain("Siento más carga en: cuello y zona lumbar.");
    expect(JSON.stringify(w.dataLayer)).not.toMatch(/cuello|lumbar/);
  });

  it("does not pass health-related answers through the analytics allowlist", () => {
    expect(sanitize({ cta_location: "hero", zona: "espalda", tiempo: "seis meses" })).toEqual({
      cta_location: "hero",
    });
  });

  it("pushes a structured WhatsApp conversion event to the dataLayer", () => {
    const dataLayer: Record<string, unknown>[] = [];
    Object.assign(window, { dataLayer });
    track("Contact", {
      cta_location: "hero",
      city_status: "barranquilla",
      service_name: "sesion_descarga_muscular",
      value: 100000,
      currency: "COP",
      zona: "espalda",
    });

    expect(dataLayer.at(-1)).toMatchObject({
      event: "vitalita_whatsapp_click",
      event_name: "Contact",
      event_source: "website",
      event_version: 1,
      cta_location: "hero",
      city_status: "barranquilla",
      value: 100000,
      currency: "COP",
    });
    expect(dataLayer.at(-1)).not.toHaveProperty("zona");
  });
});
