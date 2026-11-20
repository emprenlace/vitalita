import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "@tanstack/react-router";
import type { SesionId } from "@/config/site";
import { captureAttribution, getSegment, type Attribution } from "@/lib/attribution";
import { initAnalytics, track } from "@/lib/analytics";
import { enableSmoothAnchors } from "@/lib/smooth-anchors";
import { getSesion, inferSesion } from "@/lib/lead";
import type { ButtonOrigin } from "@/lib/whatsapp";
import { BookingSheet, type BookingRequest } from "./BookingSheet";

type Ctx = {
  attribution: Attribution;
  segment: "deporte" | "general";
  /**
   * Abre "Arma tu sesión". `zones` solo viajan en el mensaje de WhatsApp; `session`
   * preselecciona la sesión (si no viene, se deduce de las zonas).
   */
  openBooking: (origin: ButtonOrigin, zones?: string[], session?: SesionId) => void;
};

const AppCtx = createContext<Ctx | null>(null);

/** Stable analytics name per page: "landing_vitalita", "blog_index", "blog_<slug>". */
function pageName(pathname: string) {
  if (pathname === "/") return "landing_vitalita";
  if (pathname.replace(/\/$/, "") === "/blog") return "blog_index";
  const slug = pathname.match(/^\/blog\/([^/]+)/)?.[1];
  return slug ? `blog_${slug}` : pathname;
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [attribution, setAttribution] = useState<Attribution>({});
  const [booking, setBooking] = useState<BookingRequest | null>(null);

  // Optional router: tests render the provider without one.
  const router = useRouter({ warn: false }) as ReturnType<typeof useRouter> | null;
  const [pathname, setPathname] = useState<string | null>(null);

  useEffect(() => {
    setAttribution(captureAttribution());
    initAnalytics();
  }, []);

  useEffect(() => enableSmoothAnchors(), []);

  useEffect(() => {
    setPathname(window.location.pathname);
    return router?.subscribe("onResolved", (e) => setPathname(e.toLocation.pathname));
  }, [router]);

  // One PageView / ViewContent per path, so client-side navigation between blog pages counts.
  useEffect(() => {
    if (!pathname) return;
    const seg = getSegment(captureAttribution());
    const page = { page_name: pageName(pathname), page_path: pathname, segment: seg };
    track("PageView", page, `PageView:${pathname}`);

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= 0.5) {
        track("ViewContent", page, `ViewContent:${pathname}`);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const segment = getSegment(attribution);

  const openBooking = useCallback(
    (origin: ButtonOrigin, zones: string[] = [], session?: SesionId) => {
      const preset = session ?? inferSesion(zones);
      setBooking(preset ? { origin, zones, preset } : { origin, zones });
      track("BookingDialogOpen", {
        cta_location: origin,
        segment,
        service_name: "sesion_descarga_muscular",
        service_id: getSesion(preset)?.serviceId,
        session_preset: Boolean(preset),
      });
    },
    [segment],
  );

  const value = useMemo(
    () => ({ attribution, segment, openBooking }),
    [attribution, segment, openBooking],
  );

  return (
    <AppCtx.Provider value={value}>
      {children}
      <BookingSheet
        request={booking}
        attribution={attribution}
        segment={segment}
        onClose={() => setBooking(null)}
      />
    </AppCtx.Provider>
  );
}

export function useVitalita() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useVitalita must be used inside AnalyticsProvider");
  return c;
}
