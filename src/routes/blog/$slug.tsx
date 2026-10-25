import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "@portabletext/react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, BadgeCheck, Clock3 } from "lucide-react";
import { BlogShell } from "@/components/vitalita/BlogShell";
import { useVitalita } from "@/components/vitalita/AnalyticsProvider";
import { PRECIO_SESION, SITE_URL } from "@/config/site";
import { formatDate, getPost, imageUrl, type Post } from "@/lib/sanity";
import { PostCardView } from "@/components/vitalita/PostCard";

const REVIEWER = { name: "Néstor Mullet", role: "Fisioterapeuta" };

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getPost({ data: params.slug });
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData: post }) => {
    if (!post) return {};
    const url = `${SITE_URL}/blog/${post.slug}`;
    const title = `${post.seoTitle || post.title} | Vitalita`;
    const image = imageUrl(post.mainImage, 1200, 630);
    return {
      meta: [
        { title },
        { name: "description", content: post.seoDescription },
        { property: "og:type", content: "article" },
        { property: "og:title", content: post.seoTitle || post.title },
        { property: "og:description", content: post.seoDescription },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "article:published_time", content: post.publishedAt },
        { property: "article:modified_time", content: post._updatedAt },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(postSchema(post, url)) }],
    };
  },
  component: BlogPost,
});

function postSchema(post: Post, url: string) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "BlogPosting",
      headline: post.title,
      description: post.seoDescription,
      image: imageUrl(post.mainImage, 1200, 630),
      datePublished: post.publishedAt,
      dateModified: post._updatedAt,
      mainEntityOfPage: url,
      author: {
        "@type": "Person",
        name: post.author?.name,
        jobTitle: post.author?.role,
        ...(post.author?.university
          ? { alumniOf: { "@type": "CollegeOrUniversity", name: post.author.university } }
          : {}),
        ...(post.author?.links?.length ? { sameAs: post.author.links } : {}),
      },
      publisher: {
        "@type": "MedicalClinic",
        name: "Vitalita Centro de Fisioterapia",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/images/vitalita-logo-full.jpg` },
      },
      ...(post.keyword ? { keywords: post.keyword } : {}),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];
  if (post.faqs?.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: post.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const blockText = (block: unknown) =>
  ((block as { children?: { text?: string }[] }).children ?? [])
    .map((child) => child.text ?? "")
    .join("");

const components: PortableTextComponents = {
  block: {
    h2: ({ children, value }) => <h2 id={slugify(blockText(value))}>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  marks: {
    link: ({ children, value }) => {
      const href: string = value?.href ?? "#";
      const external = /^https?:\/\//.test(href) && !href.includes("vitalita.com");
      return (
        <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => (
      <figure className="post-figure">
        <img
          src={imageUrl(value, 1200)}
          srcSet={`${imageUrl(value, 640)} 640w, ${imageUrl(value, 1200)} 1200w`}
          sizes="(max-width: 767px) 92vw, 720px"
          alt={value.alt ?? ""}
          loading="lazy"
          decoding="async"
        />
        {value.caption && <figcaption>{value.caption}</figcaption>}
      </figure>
    ),
    callout: ({ value }) => (
      <aside className={`post-callout post-callout--${value.tone ?? "tip"}`}>
        {value.title && <p className="post-callout-title">{value.title}</p>}
        <p>{value.text}</p>
      </aside>
    ),
  },
};

function BookingBlock({ title }: { title: string }) {
  const { openBooking } = useVitalita();
  return (
    <aside className="post-cta">
      <p className="post-cta-title">{title}</p>
      <p>
        Sesión de descarga muscular de 60 minutos con fisioterapeuta en Barranquilla,{" "}
        {PRECIO_SESION.fromLabel.toLowerCase()}.
      </p>
      <button type="button" className="post-cta-button" onClick={() => openBooking("blog")}>
        Agendar mi sesión
        <ArrowUpRight aria-hidden />
      </button>
    </aside>
  );
}

function BlogPost() {
  const post = Route.useLoaderData();
  const toc = post.body
    .filter((b) => b["style"] === "h2")
    .map((b) => {
      const text = blockText(b);
      return { id: slugify(text), text };
    });

  return (
    <BlogShell>
      <article className="post">
        <header className="post-head container-x">
          <nav className="post-breadcrumb" aria-label="Ruta">
            <Link to="/blog">
              <ArrowLeft aria-hidden /> Blog
            </Link>
            {post.category && <span>{post.category.title}</span>}
          </nav>
          <h1 className="post-title">{post.title}</h1>
          <p className="post-excerpt">{post.excerpt}</p>
          <div className="post-meta">
            <span>
              Por <strong>{post.author?.name}</strong>, {post.author?.role?.toLowerCase()}
            </span>
            <span>{formatDate(post.publishedAt)}</span>
            <span>
              <Clock3 aria-hidden /> {post.readingMinutes} min
            </span>
          </div>
          <p className="post-reviewed">
            <BadgeCheck aria-hidden />
            {post.author?.name === REVIEWER.name ? "Escrito y revisado" : "Revisado"} por{" "}
            {REVIEWER.name}, {REVIEWER.role.toLowerCase()}
            {post.reviewedAt ? ` · ${formatDate(post.reviewedAt)}` : ""}
          </p>
        </header>

        <figure className="post-hero container-x">
          <img
            src={imageUrl(post.mainImage, 1400, 788)}
            srcSet={`${imageUrl(post.mainImage, 720, 405)} 720w, ${imageUrl(post.mainImage, 1400, 788)} 1400w`}
            sizes="(max-width: 767px) 100vw, 1100px"
            alt={post.mainImage?.alt ?? ""}
            width={1400}
            height={788}
            fetchPriority="high"
          />
        </figure>

        <div className="post-layout container-x">
          {toc.length > 2 && (
            <nav className="post-toc" aria-label="En este artículo">
              <p>En este artículo</p>
              <ol>
                {toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`}>{item.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="post-body">
            <PortableText
              value={post.body as unknown as PortableTextBlock[]}
              components={components}
            />

            <BookingBlock title="¿Te identificas con esto? Agenda una valoración." />

            {post.faqs?.length ? (
              <section className="post-faqs" aria-labelledby="post-faqs-title">
                <h2 id="post-faqs-title">Preguntas frecuentes</h2>
                {post.faqs.map((f) => (
                  <details key={f.q}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </section>
            ) : null}

            {post.references?.length ? (
              <section className="post-refs" aria-labelledby="post-refs-title">
                <h2 id="post-refs-title">Fuentes</h2>
                <ol>
                  {post.references.map((r) => (
                    <li key={r.label}>
                      {r.url ? (
                        <a href={r.url} target="_blank" rel="noopener noreferrer">
                          {r.label}
                        </a>
                      ) : (
                        r.label
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            <section className="post-author" aria-label="Sobre el autor">
              {post.author?.photo && (
                <img
                  src={imageUrl(post.author.photo, 160, 160)}
                  alt=""
                  width={80}
                  height={80}
                  loading="lazy"
                />
              )}
              <div>
                <p className="post-author-name">{post.author?.name}</p>
                <p className="post-author-role">
                  {post.author?.role}
                  {post.author?.university ? ` · ${post.author.university}` : ""}
                </p>
                {post.author?.bio && <p className="post-author-bio">{post.author.bio}</p>}
              </div>
            </section>

            <p className="post-disclaimer">
              Este contenido es informativo y no reemplaza una valoración profesional. Si el dolor
              es intenso, aparece tras un golpe o se acompaña de fiebre, adormecimiento o pérdida de
              fuerza, consulta a un médico.
            </p>
          </div>
        </div>

        {post.related.length > 0 && (
          <section className="container-x post-related" aria-labelledby="related-title">
            <h2 id="related-title">Sigue leyendo</h2>
            <div className="blog-grid">
              {post.related.map((r) => (
                <PostCardView key={r.slug} post={r} />
              ))}
            </div>
          </section>
        )}
      </article>
    </BlogShell>
  );
}
