/** Widths available for each photo: `<name>-sm.webp` (small) and `<name>.webp` (large). */
const VARIANTS: Record<string, [small: number, large: number]> = {
  "/images/pattern-dia-a-dia.webp": [480, 800],
  "/images/pattern-cuerpo-nota.webp": [480, 620],
  "/images/nestor-laser-cervical.webp": [480, 800],
  "/images/pattern-band-estiramiento.webp": [600, 1000],
  "/images/technique-descarga.webp": [400, 640],
  "/images/technique-ventosas.webp": [400, 640],
  "/images/clinic-session.webp": [400, 640],
  "/images/active-recovery.webp": [400, 640],
  "/images/vitalita-fachada-local.webp": [700, 1200],
  "/images/dr-nestor-mullet.webp": [500, 768],
};

/** `srcSet`/`sizes` props so phones download the small variant. */
export function responsive(src: string, sizes: string) {
  const widths = VARIANTS[src];
  if (!widths) return {};
  const small = src.replace(/\.webp$/, "-sm.webp");
  return { srcSet: `${small} ${widths[0]}w, ${src} ${widths[1]}w`, sizes };
}
