import { m, useReducedMotion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <m.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 14, scale: 0.99 }}
      {...(reduce ? {} : { whileInView: { opacity: 1, y: 0, scale: 1 } })}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}

/** Editorial section label: auto-numbered by CSS ("03 — Text"), no pill. */
export function SectionTag({ label }: { label: string }) {
  return <p className="section-label">{label}</p>;
}

/** Photo slot: renders the real image when `src` is set, otherwise a labelled placeholder. */
export function Photo({
  src,
  alt,
  label,
  className,
  width,
  height,
  priority,
}: {
  src: string;
  alt: string;
  label: string;
  className?: string;
  width: number;
  height: number;
  priority?: boolean;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn("h-full w-full rounded-lg object-cover", className)}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={`Espacio reservado: ${label}`}
      style={{ aspectRatio: `${width} / ${height}` }}
      className={cn(
        "placeholder-photo relative flex w-full items-end overflow-hidden rounded-lg border",
        className,
      )}
    >
      <div className="m-3 flex items-center gap-2 rounded-full bg-bone/85 px-3 py-1.5 text-xs font-medium text-ink backdrop-blur">
        <ImageIcon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </div>
    </div>
  );
}
