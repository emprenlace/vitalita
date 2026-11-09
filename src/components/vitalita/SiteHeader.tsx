import { AnimatePresence, m, MotionConfig, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Dumbbell,
  Footprints,
  Hand,
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
          <m.li
            key={page.path}
            onMouseEnter={() => onHover?.(index)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.06 + index * 0.05, ease: EASE }}
          >
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
          </m.li>
        );
      })}
    </ul>
  );
}

/** Label that rolls up on hover: the copy below slides in as the original leaves. */
function Roll({ children }: { children: string }) {
  return (
    <span className="nav-roll">
      <span>{children}</span>
      <span aria-hidden>{children}</span>
    </span>
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
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
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
 * One glass bar: logo left, plain text links centered, booking button right.
 * Dark glass over a dark hero, light glass once scrolled (or when `solid`).
 * `current` marks the section the visitor is in.
 */
export function SiteHeader({
  solid = false,
  logoHref,
  current,
}: {
  solid?: boolean;
  logoHref?: string;
  current?: "servicios" | "blog";
}) {
  const [scrolledState, setScrolled] = useState(false);
  const [menu, setMenu] = useState<"none" | "services" | "mobile">("none");
  const [hover, setHover] = useState<string | null>(null);
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
      () => setMenu((m) => (m === "services" ? "none" : m)),
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

  /** Sliding highlight shared by the three links. */
  const highlight = (id: string) =>
    hover === id && (
      <m.span
        layoutId="nav-link-hover"
        className="nav-link-hover"
        transition={{ duration: 0.28, ease: EASE }}
        aria-hidden
      />
    );

  return (
    // reducedMotion="user": framer animations follow the visitor's "reduce motion" setting.
    <MotionConfig reducedMotion="user">
      <header
        ref={headerRef}
        className={cn(
          "site-header nav-bar fixed z-50",
          scrolled ? "is-light" : "is-dark",
          scrolledState && "is-compact",
        )}
      >
        <div className="nav-row">
          <Logo dark={!scrolled} href={logoHref ?? (solid ? "/" : "#top")} />

          <nav className="nav-links" aria-label="Principal" onMouseLeave={() => setHover(null)}>
            <button
              type="button"
              className={cn("nav-link", current === "servicios" && "is-current")}
              aria-expanded={menu === "services"}
              aria-controls="nav-services-panel"
              onClick={() => setMenu(menu === "services" ? "none" : "services")}
              onMouseEnter={() => {
                setHover("servicios");
                hoverOpen();
              }}
              onMouseLeave={hoverClose}
            >
              {highlight("servicios")}
              <Roll>Servicios</Roll>
              <ChevronDown
                className={cn("nav-link-chevron", menu === "services" && "is-open")}
                aria-hidden
              />
            </button>
            <a
              href="/blog"
              className={cn("nav-link", current === "blog" && "is-current")}
              onMouseEnter={() => setHover("blog")}
            >
              {highlight("blog")}
              <Roll>Blog</Roll>
            </a>
            <a
              href={DIRECCION.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link nav-link--directions"
              onMouseEnter={() => setHover("llegar")}
            >
              {highlight("llegar")}
              <Roll>Cómo llegar</Roll>
              <ArrowUpRight className="nav-link-ext" aria-hidden />
            </a>
          </nav>

          <div className="nav-actions">
            <WhatsAppButton
              origin="header"
              size="sm"
              hideIcon
              className="site-header-cta"
              ariaLabel="Agenda mi sesión. Abre opciones para agendar."
            >
              <>
                <span>
                  <span className="nav-cta-full">Agenda mi sesión</span>
                  <span className="nav-cta-short">Agendar</span>
                </span>
                <span className="site-header-arrow">
                  <ArrowUpRight aria-hidden />
                </span>
              </>
            </WhatsAppButton>
            <button
              type="button"
              className="site-header-menu"
              aria-label={menu === "mobile" ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menu === "mobile"}
              aria-controls="nav-mobile-panel"
              onClick={() => setMenu(menu === "mobile" ? "none" : "mobile")}
            >
              <span className="nav-burger" aria-hidden>
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>

        <div className="nav-services-anchor" onMouseEnter={hoverOpen} onMouseLeave={hoverClose}>
          <AnimatePresence>
            {menu === "services" && <ServicesPanel onPick={close} />}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {menu === "mobile" && (
            <m.nav
              id="nav-mobile-panel"
              className="nav-panel nav-panel--mobile"
              aria-label="Menú"
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              <p className="nav-panel-label">Servicios</p>
              <ServiceLinks onPick={close} />
              <div className="nav-panel-links">
                <a href="/blog" onClick={close}>
                  Blog
                </a>
                <a
                  href={DIRECCION.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                >
                  Cómo llegar
                  <ArrowUpRight aria-hidden />
                </a>
              </div>
            </m.nav>
          )}
        </AnimatePresence>
      </header>
    </MotionConfig>
  );
}
