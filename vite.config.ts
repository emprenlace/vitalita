import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

const LONG_CACHE = "public, max-age=2592000, stale-while-revalidate=86400";
const VERCEL_HEADER_ROUTES = [
  {
    src: "/(.*)",
    headers: {
      "x-content-type-options": "nosniff",
      "referrer-policy": "strict-origin-when-cross-origin",
      "x-frame-options": "SAMEORIGIN",
      "permissions-policy": "camera=(), microphone=(), geolocation=()",
    },
    continue: true,
  },
  { src: "/images/(.*)", headers: { "cache-control": LONG_CACHE }, continue: true },
  { src: "/videos/(.*)", headers: { "cache-control": LONG_CACHE }, continue: true },
  // The *.vercel.app address duplicates www.vitalita.com.co; keep it out of search results.
  {
    src: "/(.*)",
    has: [{ type: "host", value: "vitalita-murex.vercel.app" }],
    headers: { "x-robots-tag": "noindex" },
    continue: true,
  },
];

export default defineConfig(({ command, isPreview }) => ({
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Use src/server.ts (our SSR error wrapper) as the server entry.
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    // Production build (and `vite preview`) targets Vercel when built there, Cloudflare Workers otherwise.
    ...(command === "build" || isPreview
      ? [
          nitro({
            preset: process.env["VERCEL"] ? "vercel" : "cloudflare-module",
            // Vercel ignores public/_headers (Cloudflare-only), so the same rules go in its
            // route config. `continue` keeps routing on to the static files and SSR function.
            vercel: { config: { version: 3, routes: VERCEL_HEADER_ROUTES } },
          }),
        ]
      : []),
    viteReact(),
  ],
  // Same address as before: http://localhost:8080 (also reachable from the phone on the LAN).
  server: { host: "::", port: 8080 },
  css: { transformer: "lightningcss" },
  resolve: {
    alias: { "@": `${process.cwd()}/src` },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  // Pre-bundle framer-motion with React so it never gets a second React copy.
  optimizeDeps: {
    include: [
      "framer-motion",
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },
}));
