import { m, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Instagram,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { INSTAGRAM_URL, MEDIA } from "@/config/site";
import { useNearViewport } from "@/lib/defer";
import { cn } from "@/lib/utils";
import { WhatsAppButton } from "./WhatsAppButton";

const STORIES = MEDIA.testimonios;
const EASE = [0.16, 1, 0.3, 1] as const;

export function TestimonialsSection() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Posters and video sources attach only when the section is close, so they never
  // compete with the first screen.
  const near = useNearViewport(sectionRef, "900px");
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const [inView, setInView] = useState(false);
  // Reduced motion: nothing plays until the visitor taps.
  const [started, setStarted] = useState(!reduceMotion);

  // Section visibility gates playback so videos never run off-screen.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Coverflow: scale/fade every card from its distance to the center, frame by frame,
  // without React renders. The active story (and its video) only changes once the
  // strip settles, so playback never starts mid-swipe.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    let settle = 0;

    const nearest = () => {
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = index;
        }
      });
      return best;
    };

    const paint = () => {
      frame = 0;
      const center = track.scrollLeft + track.clientWidth / 2;
      cardRefs.current.forEach((card) => {
        if (!card) return;
        const step = card.offsetWidth * 1.08;
        const d = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center) / step;
        const t = Math.max(0, 1 - d);
        card.style.transform = `scale(${0.86 + 0.14 * t})`;
        card.style.opacity = String(0.5 + 0.5 * t);
      });
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
      window.clearTimeout(settle);
      settle = window.setTimeout(() => setActive(nearest()), 140);
    };

    paint();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === active && inView && started) {
        video.muted = muted;
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [active, inView, muted, started, near]);

  const goTo = useCallback(
    (index: number) => {
      const card = cardRefs.current[(index + STORIES.length) % STORIES.length];
      const track = trackRef.current;
      if (!card || !track) return;
      // Scroll only the strip (never the page) so the card lands centered.
      track.scrollTo({
        left: card.offsetLeft - (track.clientWidth - card.clientWidth) / 2,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    },
    [reduceMotion],
  );

  const onCardClick = (index: number) => {
    if (index !== active) return goTo(index);
    if (!started) return setStarted(true);
    setMuted((current) => !current);
  };

  const onTime = (index: number) => {
    const video = videoRefs.current[index];
    const bar = barRefs.current[index];
    if (video && bar && video.duration) {
      bar.style.transform = `scaleX(${video.currentTime / video.duration})`;
    }
  };

  return (
    <section ref={sectionRef} className="stories-section" aria-labelledby="instagram-title">
      <div className="container-x">
        <m.header
          className="pattern-head"
          {...(reduceMotion
            ? {}
            : {
                initial: { opacity: 0, y: 28 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, amount: 0.3 },
                transition: { duration: 0.7, ease: EASE },
              })}
        >
          <p className="section-label">Experiencias compartidas</p>
          <h2 id="instagram-title" className="pattern-title">
            <span className="pattern-title-soft">Historias contadas</span>{" "}
            <span>por quienes ya nos visitaron.</span>
          </h2>
          <p className="pattern-lede">
            Pacientes reales cuentan cómo llegaron y cómo se sintieron. Toca un video para activar
            el sonido.
          </p>
        </m.header>
      </div>

      <div className="stories-stage">
        <div
          ref={trackRef}
          className="stories-track"
          role="region"
          aria-label="Videos de testimonios"
        >
          {STORIES.map((story, index) => {
            const isActive = index === active;
            const label = story.name ?? `Paciente de Vitalita · ${index + 1}`;
            return (
              <article
                key={story.src}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                data-index={index}
                className={cn("story-card", isActive && "is-active")}
              >
                <button type="button" className="story-hit" onClick={() => onCardClick(index)}>
                  <video
                    ref={(el) => {
                      videoRefs.current[index] = el;
                    }}
                    className="story-video"
                    {...(near ? { src: story.src, poster: story.poster } : {})}
                    playsInline
                    muted
                    preload="none"
                    onTimeUpdate={() => onTime(index)}
                    onEnded={() => goTo(index + 1)}
                  />
                  <span className="story-shade" aria-hidden />
                  <span className="story-progress" aria-hidden>
                    <span
                      ref={(el) => {
                        barRefs.current[index] = el;
                      }}
                    />
                  </span>
                  <span className="story-top" aria-hidden>
                    <span className="story-avatar">
                      <img
                        src="/images/vitalita-avatar.webp"
                        alt=""
                        width={48}
                        height={48}
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                    <span className="story-handle">vitalitabaq</span>
                  </span>
                  <span className="story-sound" aria-hidden>
                    {!started ? <Play /> : muted ? <VolumeX /> : <Volume2 />}
                    {isActive && (!started ? "Reproducir" : muted ? "Activar sonido" : "Sonido")}
                  </span>
                  <span className="story-name">{label}</span>
                  <span className="sr-only">
                    {isActive
                      ? started && !muted
                        ? ": silenciar testimonio"
                        : ": reproducir con sonido"
                      : ": ver testimonio"}
                  </span>
                </button>
              </article>
            );
          })}
        </div>

        <div className="stories-controls">
          <button
            type="button"
            className="stories-arrow"
            onClick={() => goTo(active - 1)}
            aria-label="Testimonio anterior"
          >
            <ArrowLeft aria-hidden />
          </button>
          <div className="stories-dots" aria-hidden>
            {STORIES.map((story, index) => (
              <span key={story.src} className={cn(index === active && "is-active")} />
            ))}
          </div>
          <button
            type="button"
            className="stories-arrow"
            onClick={() => goTo(active + 1)}
            aria-label="Siguiente testimonio"
          >
            <ArrowRight aria-hidden />
          </button>
        </div>
      </div>

      <div className="container-x stories-action">
        <WhatsAppButton origin="testimonials" size="md">
          Quiero vivir mi experiencia
        </WhatsAppButton>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="stories-ig">
          <Instagram aria-hidden />
          Ver el perfil de Vitalita en Instagram
          <ArrowUpRight aria-hidden />
        </a>
      </div>
    </section>
  );
}
