import { useEffect, useState, type RefObject } from "react";

type NetworkInfo = { saveData?: boolean; effectiveType?: string };

/** True when the visitor asked to save data or is on a very slow connection. */
export function prefersLightMedia(): boolean {
  if (typeof navigator === "undefined") return false;
  const connection = (navigator as Navigator & { connection?: NetworkInfo }).connection;
  return !!connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "");
}

/**
 * Flips to true once the page has finished loading and the main thread is idle,
 * so heavy media (e.g. the hero video) never competes with first paint.
 */
export function useAfterLoad(enabled = true): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let idle = 0;
    const schedule = () => {
      const ric = (window as Window & { requestIdleCallback?: typeof requestIdleCallback })
        .requestIdleCallback;
      idle = ric
        ? ric(() => setReady(true), { timeout: 1500 })
        : window.setTimeout(() => setReady(true), 300);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      const cic = (window as Window & { cancelIdleCallback?: typeof cancelIdleCallback })
        .cancelIdleCallback;
      if (cic) cic(idle);
      else window.clearTimeout(idle);
    };
  }, [enabled]);
  return ready;
}

/** Becomes true (once) when the element gets within `margin` of the viewport. */
export function useNearViewport(ref: RefObject<Element | null>, margin = "600px"): boolean {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: `${margin} 0px` },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, margin, near]);
  return near;
}
