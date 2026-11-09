import { LazyMotion } from "framer-motion";
import type { ReactNode } from "react";
import { AnalyticsProvider } from "./AnalyticsProvider";
import { SiteFooter, StickyCta } from "./ClosingSections";
import { SiteHeader } from "./SiteHeader";

const loadMotionFeatures = () => import("@/lib/motion-features").then((mod) => mod.default);

/**
 * Shared frame for inner pages: header, footer with booking CTA, sticky mobile CTA.
 * `blog` uses the light header over a light page; `service` starts on a dark hero like the home.
 */
export function BlogShell({
  children,
  variant = "blog",
}: {
  children: ReactNode;
  variant?: "blog" | "service";
}) {
  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <AnalyticsProvider>
        {variant === "blog" ? <SiteHeader solid /> : <SiteHeader logoHref="/" />}
        <a href="#main-content" className="skip-link">
          Saltar al contenido
        </a>
        <main id="main-content" className={variant === "blog" ? "blog-main" : undefined}>
          {children}
        </main>
        <SiteFooter />
        <StickyCta />
      </AnalyticsProvider>
    </LazyMotion>
  );
}
