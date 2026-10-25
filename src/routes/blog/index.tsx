import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { BlogShell } from "@/components/vitalita/BlogShell";
import { SITE_URL } from "@/config/site";
import { PostCardView } from "@/components/vitalita/PostCard";
import { getPosts } from "@/lib/sanity";
import { cn } from "@/lib/utils";

const TITLE = "Blog de fisioterapia | Vitalita Barranquilla";
const DESC =
  "Guías de fisioterapia escritas y revisadas por fisioterapeutas de Vitalita: dolor cervical, lumbar, contracturas, descarga muscular y recuperación.";

export const Route = createFileRoute("/blog/")({
  loader: () => getPosts(),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/blog` }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const posts = Route.useLoaderData();
  const [filter, setFilter] = useState<string | null>(null);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    posts.forEach((p) => p.category && map.set(p.category.slug, p.category.title));
    return [...map.entries()];
  }, [posts]);

  const visible = filter ? posts.filter((p) => p.category?.slug === filter) : posts;
  const [featured, ...rest] = visible;

  return (
    <BlogShell>
      <section className="blog-hero container-x">
        <p className="section-label">Blog de Vitalita</p>
        <h1 className="blog-hero-title">
          <span className="pattern-title-soft">Aprende a cuidar</span> <span>tu cuerpo.</span>
        </h1>
        <p className="blog-hero-lede">
          Guías claras sobre dolor muscular, postura y recuperación, escritas y revisadas por
          fisioterapeutas.
        </p>

        {categories.length > 1 && (
          <div className="blog-filters" role="group" aria-label="Filtrar por tema">
            <button
              type="button"
              aria-pressed={filter === null}
              className={cn("blog-filter", filter === null && "is-active")}
              onClick={() => setFilter(null)}
            >
              Todos
            </button>
            {categories.map(([slug, title]) => (
              <button
                key={slug}
                type="button"
                aria-pressed={filter === slug}
                className={cn("blog-filter", filter === slug && "is-active")}
                onClick={() => setFilter(slug)}
              >
                {title}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="container-x blog-list" aria-label="Artículos">
        {featured ? (
          <>
            <PostCardView post={featured} featured />
            {rest.length > 0 && (
              <div className="blog-grid">
                {rest.map((post) => (
                  <PostCardView key={post.slug} post={post} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="blog-empty">
            <p>Estamos preparando los primeros artículos.</p>
            <a href="/" className="blog-empty-link">
              Volver al inicio <ArrowUpRight aria-hidden />
            </a>
          </div>
        )}
      </section>
    </BlogShell>
  );
}
