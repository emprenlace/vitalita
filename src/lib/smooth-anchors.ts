/**
 * Desplazamiento suave solo para los enlaces internos (#top, índice del blog).
 * No se usa `scroll-behavior: smooth` en el CSS: con él, el navegador anima la
 * restauración del scroll al recargar y la página "salta" desde arriba.
 */
export function enableSmoothAnchors() {
  if (typeof document === "undefined") return () => {};
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
    const link = (event.target as Element | null)?.closest?.("a[href^='#']");
    if (!(link instanceof HTMLAnchorElement)) return;
    const hash = link.getAttribute("href") ?? "";
    // El enlace para saltar al contenido mueve el foco: se deja al navegador.
    if (hash === "#main-content" || hash.length < 2) return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target && hash !== "#top") return;
    event.preventDefault();
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = reduce ? "auto" : "smooth";
    if (hash === "#top") window.scrollTo({ top: 0, behavior });
    else target!.scrollIntoView({ behavior, block: "start" });
    history.replaceState(
      history.state,
      "",
      hash === "#top" ? location.pathname + location.search : hash,
    );
  };
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}
