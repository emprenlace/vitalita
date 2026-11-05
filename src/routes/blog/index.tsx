import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { BlogShell } from "@/components/vitalita/BlogShell";
import { PUBLIC_URL, SITE_URL } from "@/config/site";
import { PostCardView } from "@/components/vitalita/PostCard";
import { getPosts, type PostCard } from "@/lib/sanity";
import { cn } from "@/lib/utils";

const TITLE = "Blog de fisioterapia | Vitalita Barranquilla";
const DESC =
  "Guías de fisioterapia escritas y revisadas por fisioterapeutas de Vitalita: dolor cervical, lumbar, contracturas, descarga muscular y recuperación.";

const BLOG_URL = `${SITE_URL}/blog`;

export const Route = createFileRoute("/blog/")({
  loader: () => getPosts(),
  head: ({ loaderData: posts }) => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: BLOG_URL },
      { property: "og:image", content: `${PUBLIC_URL}/images/og-vitalita.jpg` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
    ],
    links: [{ rel: "canonical", href: BLOG_URL }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(blogSchema(posts ?? [])) }],
  }),
  component: BlogIndex,
});

function blogSchema(posts: PostCard[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${BLOG_URL}#blog`,
        name: TITLE,
        description: DESC,
        url: BLOG_URL,
        inLanguage: "es-CO",
        publisher: {
          "@type": "MedicalClinic",
          name: "Vitalita Centro de Fisioterapia",
          url: SITE_URL,
          logo: { "@type": "ImageObject", url: `${SITE_URL}/images/vitalita-logo-full.jpg` },
        },
        blogPost: posts.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          url: `${BLOG_URL}/${p.slug}`,
          datePublished: p.publishedAt,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: BLOG_URL },
        ],
      },
    ],
  };
}

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
