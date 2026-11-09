import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Dumbbell,
  Footprints,
  Hand,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DATOS_SERVICIO, DIRECCION, PRECIO_SESION, SERVICE_PAGES } from "@/config/site";
import { cn } from "@/lib/utils";
import { WhatsAppButton } from "./WhatsAppButton";

/** Official Vitalita wordmark; `dark` swaps to the white version for dark/video backgrounds. */
export function Logo({
  dark,
  full,
  href = "#top",
}: {
  dark?: boolean;
  full?: boolean;
  href?: string;
}) {
  const src = full
    ? "/images/vitalita-logo-full-white.webp"
    : dark
      ? "/images/vitalita-logo-white.webp"
      : "/images/vitalita-logo.webp";
  return (
    <a
      href={href}
      className={cn("vitalita-logo", full && "vitalita-logo--full")}
      aria-label="Vitalita, centro de fisioterapia, inicio"
    >
      <img
        src={src}
        alt=""
        width={full ? 738 : 559}
        height={full ? 200 : 120}
        {...(full ? { loading: "lazy" as const, decoding: "async" as const } : {})}
      />
    </a>
  );
}

const SERVICE_ICONS: Record<string, LucideIcon> = {
  "/masajes-terapeuticos-barranquilla": Hand,
  "/presoterapia-barranquilla": Footprints,
  "/fisioterapia-deportiva-barranquilla": Dumbbell,
};

const EASE = [0.16, 1, 0.3, 1] as const;

/** Service list: icon tile, name and one line. `onHover` drives the desktop preview. */
function ServiceLinks({
  onPick,
  active,
  onHover,
}: {
  onPick: () => void;
  active?: number;
  onHover?: (index: number) => void;
}) {
  return (
    <ul className="nav-services">
      {SERVICE_PAGES.map((page, index) => {
        const Icon = SERVICE_ICONS[page.path] ?? Hand;
        const on = active === index;
        return (
          <li key={page.path} onMouseEnter={() => onHover?.(index)}>
            <a
              href={page.path}
              className={cn("nav-service", on && "is-active")}
              onClick={onPick}
              onFocus={() => onHover?.(index)}
            >
              {on && (
                <m.span
                  layoutId="nav-service-highlight"
                  className="nav-service-highlight"
                  transition={{ duration: 0.3, ease: EASE }}
                  aria-hidden
                />
              )}
              <span className="nav-service-icon" aria-hidden>
                <Icon />
              </span>
              <span className="nav-service-text">
                <strong>{page.name}</strong>
                <span>{page.desc}</span>
              </span>
              <ArrowRight className="nav-service-arrow" aria-hidden />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** Desktop mega panel: list on the left, live preview of the hovered service on the right. */
function ServicesPanel({ onPick }: { onPick: () => void }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const page = SERVICE_PAGES[active] ?? SERVICE_PAGES[0];
  if (!page) return null;
  return (
    <m.div
      id="nav-services-panel"
      className="nav-panel nav-panel--services"
      initial={reduce ? false : { opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.25, ease: EASE }}
    >
      <div className="nav-mega-list">
        <p className="nav-panel-label">Servicios</p>
        <ServiceLinks onPick={onPick} active={active} onHover={setActive} />
      </div>
      <a href={page.path} className="nav-mega-preview" onClick={onPick} tabIndex={-1}>
        <AnimatePresence mode="popLayout" initial={false}>
          <m.img
            key={page.photo}
            src={page.photo}
            alt=""
            className="nav-mega-photo"
            initial={reduce ? false : { opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          />
        </AnimatePresence>
        <span className="nav-mega-shade" aria-hidden />
        <span className="nav-mega-caption">
          <span className="nav-mega-meta">
            {DATOS_SERVICIO.minutos} min, desde {PRECIO_SESION.label.replace(" COP", "")}
          </span>
          <strong>{page.name}</strong>
          <span className="nav-mega-cta">
            Ver servicio
            <ArrowRight aria-hidden />
          </span>
        </span>
      </a>
    </m.div>
  );
}

/**
 * `solid` keeps the light header from the start (pages without a dark hero, e.g. the blog).
 * `logoHref` defaults to "#top" on the landing; other pages send the logo home.
 */
export function SiteHeader({ solid = false, logoHref }: { solid?: boolean; logoHref?: string }) {
  const [scrolledState, setScrolled] = useState(false);
  const [menu, setMenu] = useState<"none" | "services" | "mobile">("none");
  const headerRef = useRef<HTMLElement>(null);
  const scrolled = solid || scrolledState || menu === "mobile";
  const close = () => setMenu("none");
  // Hover intent: open on enter, close a moment after leaving (button or panel).
  const closeTimer = useRef<number | undefined>(undefined);
  const hoverOpen = () => {
    window.clearTimeout(closeTimer.current);
    if (window.matchMedia("(hover: hover) and (min-width: 640px)").matches) setMenu("services");
  };
  const hoverClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(
      () => setMenu((current) => (current === "services" ? "none" : current)),
      180,
    );
  };

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Close on Escape or a click outside the header.
  useEffect(() => {
    if (menu === "none") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu("none");
    const onDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setMenu("none");
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [menu]);

  const linkClass = cn(
    "site-header-directions hidden min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors min-[640px]:inline-flex",
    scrolled
      ? "text-forest hover:bg-forest/5"
      : "text-white drop-shadow-[0_1px_8px_rgb(0_0_0_/_35%)] hover:bg-white/10",
  );

  return (
    <header
      ref={headerRef}
      className={cn(
        "site-header fixed z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "site-header-scrolled border border-ink/10 bg-bone/90 shadow-sm backdrop-blur-md"
          : "border border-transparent bg-transparent",
      )}
    >
      <div className="site-header-inner flex items-center justify-between gap-3">
        <Logo dark={!scrolled} href={logoHref ?? (solid ? "/" : "#top")} />
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={cn(linkClass, "site-header-services")}
            aria-expanded={menu === "services"}
            aria-controls="nav-services-panel"
            onClick={() => setMenu(menu === "services" ? "none" : "services")}
            onMouseEnter={hoverOpen}
            onMouseLeave={hoverClose}
          >
            Servicios
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", menu === "services" && "rotate-180")}
              aria-hidden
            />
          </button>
          <a href="/blog" className={linkClass}>
            Blog
          </a>
          <a
            href={DIRECCION.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Cómo llegar
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
          <WhatsAppButton origin="header" size="sm" hideIcon className="site-header-cta">
            <>
              <span>Agenda mi sesión</span>
              <span className="site-header-arrow">
                <ArrowUpRight aria-hidden />
              </span>
            </>
          </WhatsAppButton>
          <button
            type="button"
            className={cn("site-header-menu", scrolled ? "is-light" : "is-dark")}
            aria-label={menu === "mobile" ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menu === "mobile"}
            aria-controls="nav-mobile-panel"
            onClick={() => setMenu(menu === "mobile" ? "none" : "mobile")}
          >
            {menu === "mobile" ? <X aria-hidden /> : <Menu aria-hidden />}
          </button>
        </div>
      </div>

      <div className="nav-services-anchor" onMouseEnter={hoverOpen} onMouseLeave={hoverClose}>
        <AnimatePresence>{menu === "services" && <ServicesPanel onPick={close} />}</AnimatePresence>
      </div>

      {menu === "mobile" && (
        <nav id="nav-mobile-panel" className="nav-panel nav-panel--mobile" aria-label="Menú">
          <p className="nav-panel-label">Servicios</p>
          <ServiceLinks onPick={close} />
          <div className="nav-panel-links">
            <a href="/blog" onClick={close}>
              Blog
            </a>
            <a href={DIRECCION.mapsUrl} target="_blank" rel="noopener noreferrer" onClick={close}>
              Cómo llegar
              <ArrowUpRight aria-hidden />
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
