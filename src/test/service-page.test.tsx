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
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Agendar mi Sesión de Descarga en Barranquilla",
    );
    expect(dataLayer.at(-1)).toMatchObject({
      event: "vitalita_booking_dialog_open",
      cta_location: "service",
    });

    fireEvent.click(screen.getByRole("link", { name: /Estoy en Barranquilla/ }));
    expect(dataLayer.at(-1)).toMatchObject({
      event: "vitalita_whatsapp_click",
      cta_location: "service",
      city_status: "barranquilla",
      value: 100000,
      currency: "COP",
    });
  });
});
