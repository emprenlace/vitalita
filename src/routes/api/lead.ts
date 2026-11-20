import { createFileRoute } from "@tanstack/react-router";

/** POST /api/lead: guarda el lead en la hoja de la clínica y envía `Contact` a Meta (A y B). */
export const Route = createFileRoute("/api/lead")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleLead } = await import("@/server/lead");
        let body: unknown = null;
        try {
          body = await request.json();
        } catch {
          body = null;
        }
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          undefined;
        const result = await handleLead(
          body,
          { ip, userAgent: request.headers.get("user-agent") ?? undefined },
          process.env,
        );
        return new Response(JSON.stringify(result.json), {
          status: result.status,
          headers: { "content-type": "application/json", "cache-control": "no-store" },
        });
      },
    },
  },
});
