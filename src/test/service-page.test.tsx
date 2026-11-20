import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnalyticsProvider } from "@/components/vitalita/AnalyticsProvider";
import { WhatsAppButton } from "@/components/vitalita/WhatsAppButton";

describe("service pages", () => {
  it("book through the same qualifying dialog and events as the landing", () => {
    const dataLayer: Record<string, unknown>[] = [];
    Object.assign(window, { dataLayer });

    render(
      <AnalyticsProvider>
        <WhatsAppButton origin="service">Agenda tu sesión</WhatsAppButton>
      </AnalyticsProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Agenda tu sesión/ }));
    expect(screen.getByRole("dialog")).toHaveTextContent("¿Qué quieres trabajar?");
    expect(dataLayer.at(-1)).toMatchObject({
      event: "vitalita_form_abierto",
      cta_location: "service",
      session_preset: false,
    });
    // La conversión ya no se dispara al abrir: solo al terminar el formulario.
    expect(JSON.stringify(dataLayer)).not.toContain("vitalita_lead_calificado");
  });
});
