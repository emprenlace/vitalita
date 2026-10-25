import { createServerFn } from "@tanstack/react-start";

/** Sanity project that holds the blog (studio: https://vitalita.sanity.studio). */
export const SANITY = { projectId: "815xxsit", dataset: "production", apiVersion: "2025-01-01" };

/** JSON-safe value (server functions only return serializable data). */
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type SanityImage = {
  asset?: { _ref: string };
  alt?: string;
  caption?: string;
  hotspot?: { x: number; y: number };
};

export type PostCard = {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  mainImage: SanityImage;
  category?: { title: string; slug: string };
  author?: { name: string; role?: string };
  readingMinutes: number;
};

export type Post = PostCard & {
  seoTitle?: string;
  seoDescription: string;
  keyword?: string;
  /** Portable Text blocks; cast to PortableTextBlock[] when rendering. */
  body: { [key: string]: Json }[];
  faqs?: { q: string; a: string }[];
  references?: { label: string; url?: string }[];
  reviewedAt?: string;
  reviewer?: { name: string; role?: string };
  _updatedAt: string;
  author?: {
    name: string;
    role?: string;
    university?: string;
    bio?: string;
    photo?: SanityImage;
    links?: string[];
  };
  related: PostCard[];
};

/** Only posts approved by Néstor Mullet are ever shown. */
const PUBLISHED = `_type == "post" && reviewStatus == "aprobado" && defined(slug.current) && publishedAt <= now()`;

const CARD = `{
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  mainImage,
  "category": category->{ title, "slug": slug.current },
  "author": author->{ name, role },
  "readingMinutes": round(length(pt::text(body)) / 1100) + 1
}`;

async function groq<T>(query: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(
    `https://${SANITY.projectId}.apicdn.sanity.io/v${SANITY.apiVersion}/data/query/${SANITY.dataset}`,
  );
  url.searchParams.set("query", query);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(`$${key}`, JSON.stringify(value));
  }
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Sanity ${res.status}`);
  const json = (await res.json()) as { result: T };
  return json.result;
}

/** Runs on the server only, so the browser never calls Sanity directly (no CORS setup). */
export const getPosts = createServerFn({ method: "GET" }).handler(async () =>
  groq<PostCard[]>(`*[${PUBLISHED}] | order(publishedAt desc) ${CARD}`),
);

export const getPost = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) =>
    groq<Post | null>(
      `*[${PUBLISHED} && slug.current == $slug][0]{
        ...${CARD},
        seoTitle, seoDescription, keyword, body, faqs, references, reviewedAt, _updatedAt,
        "reviewer": reviewer->{ name, role },
        "author": author->{ name, role, university, bio, photo, links },
        "related": *[${PUBLISHED} && slug.current != $slug && category._ref == ^.category._ref]
          | order(publishedAt desc)[0...3] ${CARD}
      }`,
      { slug },
    ),
  );

export const getPostSlugs = createServerFn({ method: "GET" }).handler(async () =>
  groq<{ slug: string; updatedAt: string }[]>(
    `*[${PUBLISHED}]{ "slug": slug.current, "updatedAt": _updatedAt }`,
  ),
);

/** Sanity image CDN URL with width, format negotiation and hotspot-aware crop. */
export function imageUrl(image: SanityImage | undefined, width: number, height?: number): string {
  const ref = image?.asset?._ref;
  if (!ref) return "";
  // image-<id>-<w>x<h>-<ext>
  const [, id, dims, ext] = ref.split("-");
  const params = new URLSearchParams({ w: String(width), auto: "format", q: "75", fit: "crop" });
  if (height) params.set("h", String(height));
  if (image?.hotspot) {
    params.set("crop", "focalpoint");
    params.set("fp-x", String(image.hotspot.x));
    params.set("fp-y", String(image.hotspot.y));
  }
  return `https://cdn.sanity.io/images/${SANITY.projectId}/${SANITY.dataset}/${id}-${dims}.${ext}?${params}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  });
}
