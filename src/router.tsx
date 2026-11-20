import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    // Al recargar, la página vuelve a donde estaba de inmediato. Sin esto, el
    // `scroll-behavior: smooth` del CSS anima el regreso desde arriba y todo "salta".
    scrollRestorationBehavior: "instant",
    defaultPreloadStaleTime: 0,
  });

  return router;
};
