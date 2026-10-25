import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/config/site";
import { getPostSlugs } from "@/lib/sanity";

/** Sitemap built on request: the landing, the blog and every approved article. */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const posts = await getPostSlugs().catch(() => []);
        const today = new Date().toISOString().slice(0, 10);
        const urls = [
          { loc: `${SITE_URL}/`, lastmod: today },
          { loc: `${SITE_URL}/blog`, lastmod: posts[0]?.updatedAt.slice(0, 10) ?? today },
          ...posts.map((p) => ({
            loc: `${SITE_URL}/blog/${p.slug}`,
            lastmod: p.updatedAt.slice(0, 10),
          })),
        ];
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join("\n")}
</urlset>
`;
        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
