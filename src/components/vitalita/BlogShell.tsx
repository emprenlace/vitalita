import { LazyMotion } from "framer-motion";
import type { ReactNode } from "react";
import { AnalyticsProvider } from "./AnalyticsProvider";
import { SiteFooter, StickyCta } from "./ClosingSections";
import { SiteHeader } from "./SiteHeader";

const loadMotionFeatures = () => import("@/lib/motion-features").then((mod) => mod.default);

/** Shared frame for blog pages: light header, footer with booking CTA, sticky mobile CTA. */
export function BlogShell({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <AnalyticsProvider>
        <SiteHeader solid />
        <a href="#main-content" className="skip-link">
          Saltar al contenido
        </a>
        <main id="main-content" className="blog-main">
          {children}
        </main>
        <SiteFooter />
        <StickyCta />
      </AnalyticsProvider>
    </LazyMotion>
  );
}
