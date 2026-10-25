# Vitalita · Landing de fisioterapia en Barranquilla

Landing page de la Sesión de Descarga Muscular de Vitalita. Construida con TanStack Start (React 19, SSR), Tailwind CSS 4 y framer-motion; se publica como Cloudflare Worker.

## Desarrollo

Requiere Node.js 22 o superior.

```sh
npm install
npm run dev      # servidor local
npm test         # pruebas
npm run lint     # ESLint + Prettier
npm run build    # build de producción en .output/
```

Para publicar en Cloudflare: `npx wrangler deploy --config .output/server/wrangler.json` después de `npm run build`.

## Contenido

Todos los datos editables (precio, dirección, horarios, preguntas frecuentes, testimonios, IDs de analítica) viven en `src/config/site.ts`. Los contenidos con `confirmed: false` no se publican.

## Medición

Configura `GTM_ID` o `META_PIXEL_ID` en `src/config/site.ts`. Si se configura GTM, el Pixel debe administrarse desde GTM para evitar duplicar eventos.

Los eventos de la landing se envían al `dataLayer` con el prefijo `vitalita_`. Cada evento incluye `event_name`, `event_id`, `event_source`, `event_version` y `event_time`. Usa `vitalita_whatsapp_click` como evento personalizado para medir la intención de contacto; el campo `city_status` permite separar a quienes están en Barranquilla de quienes consultan desde otra ciudad. `cta_location`, `service_name`, `value`, `currency` y los UTM permitidos dan contexto a la conversión.

Las zonas del cuerpo elegidas en el selector y otros datos sobre la salud no se envían al `dataLayer` ni a Meta: solo viajan dentro del mensaje de WhatsApp. Los parámetros se filtran con una lista permitida en `src/lib/analytics.ts`.
