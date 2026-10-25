import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ArrowLeft, ArrowUpRight, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { captureAttribution, getSegment, type Attribution } from "@/lib/attribution";
import { initAnalytics, track } from "@/lib/analytics";
import { buildMessage, buildWhatsAppUrl, type ButtonOrigin } from "@/lib/whatsapp";
import { DIRECCION, PRECIO_SESION } from "@/config/site";

type Ctx = {
  attribution: Attribution;
  segment: "deporte" | "general";
  /** `zones` only travel inside the WhatsApp text, never to analytics. */
  openBooking: (origin: ButtonOrigin, zones?: string[]) => void;
  openWhatsApp: (
    origin: ButtonOrigin,
    cityStatus?: "barranquilla" | "outside_barranquilla",
  ) => void;
  whatsappHref: string;
};

const AppCtx = createContext<Ctx | null>(null);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [attribution, setAttribution] = useState<Attribution>({});
  const [bookingOrigin, setBookingOrigin] = useState<ButtonOrigin | null>(null);
  const [focusZones, setFocusZones] = useState<string[]>([]);
  const [outsideCity, setOutsideCity] = useState(false);
  const lastClick = useRef(0);

  useEffect(() => {
    const a = captureAttribution();
    setAttribution(a);
    initAnalytics();
    track("PageView", { page_name: "landing_vitalita", segment: getSegment(a) });

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= 0.5) {
        track("ViewContent", { page_name: "landing_vitalita", segment: getSegment(a) });
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const segment = getSegment(attribution);

  const openBooking = useCallback(
    (origin: ButtonOrigin, zones: string[] = []) => {
      setBookingOrigin(origin);
      setFocusZones(zones);
      setOutsideCity(false);
      track("BookingDialogOpen", {
        cta_location: origin,
        segment,
        service_name: "sesion_descarga_muscular",
      });
    },
    [segment],
  );

  const whatsappHref = useMemo(
    () => buildWhatsAppUrl(buildMessage(attribution, focusZones)),
    [attribution, focusZones],
  );

  const openWhatsApp = useCallback(
    (
      origin: ButtonOrigin,
      cityStatus: "barranquilla" | "outside_barranquilla" = "barranquilla",
    ) => {
      const now = Date.now();
      if (now - lastClick.current < 1200) return;
      lastClick.current = now;
      track("Contact", {
        cta_location: origin,
        city_status: cityStatus,
        segment,
        service_name: "sesion_descarga_muscular",
        value: PRECIO_SESION.value,
        currency: PRECIO_SESION.currency,
        utm_source: attribution.utm_source,
        utm_campaign: attribution.utm_campaign,
        utm_content: attribution.utm_content,
      });
      setBookingOrigin(null);
    },
    [attribution, segment],
  );

  const chooseOutsideCity = () => {
    setOutsideCity(true);
    track("ServiceAreaNotice", {
      cta_location: bookingOrigin ?? "unknown",
      city_status: "outside_barranquilla",
      segment,
      service_name: "sesion_descarga_muscular",
    });
  };

  const value = useMemo(
    () => ({
      attribution,
      segment,
      openBooking,
      openWhatsApp,
      whatsappHref,
    }),
    [attribution, segment, openBooking, openWhatsApp, whatsappHref],
  );

  return (
    <AppCtx.Provider value={value}>
      {children}
      <Dialog
        open={bookingOrigin !== null}
        onOpenChange={(open) => {
          if (!open) {
            setBookingOrigin(null);
            setOutsideCity(false);
          }
        }}
      >
        <DialogContent className="booking-dialog max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border-0 bg-background p-6 shadow-2xl sm:p-8">
          {outsideCity ? (
            <>
              <DialogHeader className="pr-8 text-left">
                <DialogTitle className="font-display text-2xl leading-tight text-ink sm:text-3xl">
                  Nuestra atención es presencial en Barranquilla
                </DialogTitle>
                <DialogDescription className="pt-2 text-base leading-relaxed">
                  Por ahora atendemos únicamente en nuestro centro de fisioterapia. Si puedes
                  desplazarte a Barranquilla, te ayudamos a coordinar tu sesión.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-xl border border-forest/15 bg-white/70 p-4">
                <p className="flex items-start gap-2 text-sm leading-relaxed text-ink">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-forest" aria-hidden />
                  {DIRECCION.linea}, {DIRECCION.ciudad}
                </p>
              </div>
              {bookingOrigin && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => openWhatsApp(bookingOrigin, "outside_barranquilla")}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-center font-semibold text-white transition-colors hover:bg-forest-deep"
                >
                  Puedo viajar, quiero agendar
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              )}
              <button
                type="button"
                onClick={() => setOutsideCity(false)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-forest transition-colors hover:bg-forest/5"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Volver a las opciones
              </button>
            </>
          ) : (
            <>
              <DialogHeader className="pr-8 text-left">
                <p className="eyebrow text-forest">Vitalita · Barranquilla</p>
                <DialogTitle className="mt-3 font-display text-2xl leading-tight text-ink sm:text-3xl">
                  Agendar mi Sesión de Descarga en Barranquilla
                </DialogTitle>
                <DialogDescription className="pt-2 text-base leading-relaxed">
                  Atención presencial y personalizada. Sesiones desde{" "}
                  <span className="font-semibold text-ink">{PRECIO_SESION.label}</span>.
                </DialogDescription>
              </DialogHeader>
              {bookingOrigin && (
                <div className="mt-2 grid gap-3">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => openWhatsApp(bookingOrigin)}
                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-center font-semibold text-white transition-colors hover:bg-forest-deep"
                  >
                    Estoy en Barranquilla
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                  <button
                    type="button"
                    onClick={chooseOutsideCity}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-forest/25 px-5 py-3 text-center font-semibold text-forest transition-colors hover:bg-forest/5"
                  >
                    Estoy en otra ciudad
                  </button>
                </div>
              )}
              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                Al continuar por WhatsApp podrás confirmar el horario disponible.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppCtx.Provider>
  );
}

export function useVitalita() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useVitalita must be used inside AnalyticsProvider");
  return c;
}
