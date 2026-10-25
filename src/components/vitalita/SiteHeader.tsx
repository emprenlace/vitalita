import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { DIRECCION } from "@/config/site";
import { cn } from "@/lib/utils";
import { WhatsAppButton } from "./WhatsAppButton";

/** Official Vitalita wordmark; `dark` swaps to the white version for dark/video backgrounds. */
export function Logo({ dark, full }: { dark?: boolean; full?: boolean }) {
  const src = full
    ? "/images/vitalita-logo-full-white.webp"
    : dark
      ? "/images/vitalita-logo-white.webp"
      : "/images/vitalita-logo.webp";
  return (
    <a
      href="#top"
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

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header
      className={cn(
        "site-header fixed z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "site-header-scrolled border border-ink/10 bg-bone/90 shadow-sm backdrop-blur-md"
          : "border border-transparent bg-transparent",
      )}
    >
      <div className="site-header-inner flex items-center justify-between gap-3">
        <Logo dark={!scrolled} />
        <div className="flex items-center gap-3">
          <a
            href={DIRECCION.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "site-header-directions hidden min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors min-[640px]:inline-flex",
              scrolled
                ? "text-forest hover:bg-forest/5"
                : "text-white drop-shadow-[0_1px_8px_rgb(0_0_0_/_35%)] hover:bg-white/10",
            )}
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
        </div>
      </div>
    </header>
  );
}
