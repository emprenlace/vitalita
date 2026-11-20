# Capa de datos de Vitalita (versión 2)

Todos los eventos salen de `track()` en `src/lib/analytics.ts`. Ningún componente escribe en `window.dataLayer` por su cuenta.

## Reglas

- **Nombre del evento:** `vitalita_<evento>`, en snake_case.
- **Campos fijos en cada push:** `event_name`, `event_id`, `event_source` ("website"), `event_version` (2) y `event_time` (segundos Unix).
- **Lista de permitidos:** solo pasan los parámetros de esta página. Cualquier otro se descarta, aunque un componente lo envíe.
- **Sin datos de salud:** las zonas del cuerpo y las molestias nunca llegan a la capa de datos ni a Meta. Solo viajan dentro del mensaje de WhatsApp.
- **Contacto solo cifrado:** el nombre, el celular y el correo nunca van en texto. Solo salen en `user_data`, cifrados en SHA-256, y solo en `vitalita_lead_calificado`. Cualquier valor de `user_data` que no sea un hash se descarta.
- **Cada push vacía los parámetros del evento anterior**, para que GTM no los arrastre. El contexto de página (`page_name`, `page_path`, `segment`) se conserva.
- **Deduplicación con Meta:** el `event_id` de `vitalita_lead_calificado` es la referencia del lead (`VT-XXXXX-N`). La API de Conversiones envía el mismo `event_id`, así que Meta cuenta el evento una sola vez.

## Eventos

| Evento (`event`)                | Cuándo se dispara                  | Parámetros                                     | ¿Conversión?                                       |
| ------------------------------- | ---------------------------------- | ---------------------------------------------- | -------------------------------------------------- |
| `vitalita_page_view`            | Cada página vista                  | `page_name`, `page_path`, `segment`            | No                                                 |
| `vitalita_view_content`         | Al llegar al 50 % de la página     | `page_name`, `page_path`, `segment`            | No                                                 |
| `vitalita_form_abierto`  | Se abre "Arma tu sesión"           | `cta_location`, `service_id`, `session_preset` | No                                                 |
| `vitalita_form_paso`            | Cada respuesta del formulario      | `step`, `answer`, `cta_location`, `service_id` | No                                                 |
| `vitalita_form_fuera_de_zona`  | Toca "¿Estás en otra ciudad?"      | `city_status`, `cta_location`                  | No                                                 |
| `vitalita_lead`          | Envía el formulario (A, B o C)     | Ver "Parámetros del lead"                      | No (embudo de GA4)                                 |
| `vitalita_lead_calificado`       | Envía el formulario y es **A o B** | Parámetros del lead + `user_data`              | **Sí: `Contact` en Meta y `generate_lead` en GA4** |
| `vitalita_form_cerrado` | Cierra el formulario sin enviar    | `step` (dónde lo dejó), `cta_location`         | No                                                 |
| `vitalita_agency_click`         | Clic en el crédito de Emprenlace   | `cta_location`                                 | No                                                 |

**Qué cambia frente a la versión 1:** antes, la conversión era `vitalita_whatsapp_click` y se disparaba en el primer toque, sin datos. Ahora se llama `vitalita_lead_calificado` y se dispara solo cuando la persona termina el formulario y viene esta semana o la próxima. Hacia Meta sigue saliendo el estándar `Contact`, así que la optimización de las campañas no cambia; en GTM hay que cambiar el activador al nombre nuevo el día que se publique. Cambia el volumen: menos eventos, pero de mejor calidad.

### Valores de `step` y `answer` (`vitalita_form_paso`)

| `step`          | `answer`                                             |
| --------------- | ---------------------------------------------------- |
| `session`       | `descarga_una_zona` · `descarga_cuerpo_completo`     |
| `timing`        | `esta_semana` · `proxima_semana` · `averiguando`     |
| `outside`       | `can_travel` (está en otra ciudad y puede viajar)    |
| `contact_error` | Campos con error, por ejemplo `phone` o `name_email` |

`service_id` es el producto, nunca la zona: las dos sesiones de una zona comparten `descarga_una_zona`.

### Parámetros del lead (`vitalita_lead` y `vitalita_lead_calificado`)

| Parámetro                                                             | Ejemplo                                 | Nota                                                   |
| --------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------ |
| `lead_ref`                                                            | `VT-7KQ2M-1`                            | Cruza GA4, Meta, la hoja y el chat de WhatsApp         |
| `lead_quality`                                                        | `A`                                     | A: esta semana · B: la próxima semana · C: averiguando |
| `lead_timing`                                                         | `esta_semana`                           |                                                        |
| `service_id`                                                          | `descarga_cuerpo_completo`              |                                                        |
| `service_name`                                                        | `sesion_descarga_muscular`              | Igual que en la versión 1                              |
| `value` / `currency`                                                  | `150000` / `COP`                        | Precio de la sesión elegida                            |
| `city_status`                                                         | `barranquilla` · `outside_barranquilla` |                                                        |
| `cta_location`                                                        | `hero`, `pricing`, `service`…           | Botón de origen                                        |
| `segment`                                                             | `general` · `deporte`                   |                                                        |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` |                                         | Si la visita los trae                                  |

### `user_data` (solo en `vitalita_lead_calificado`)

Todo cifrado en SHA-256 y normalizado como pide Meta:

| Clave         | Antes de cifrar                                          |
| ------------- | -------------------------------------------------------- |
| `em`          | Correo en minúsculas y sin espacios                      |
| `ph`          | Celular con indicativo, solo dígitos (`573001234567`)    |
| `fn` / `ln`   | Nombre y apellido en minúsculas, sin signos              |
| `ct`          | `barranquilla` (solo si la persona está en Barranquilla) |
| `country`     | Código del país en minúsculas (`co`)                     |
| `external_id` | Identificador estable derivado del celular               |

## Servidor: `POST /api/lead`

El formulario envía el lead a `src/routes/api/lead.ts` (lógica en `src/server/lead.ts`). El servidor:

1. Valida de nuevo todo: sesión, momento, referencia, contacto y que la calidad coincida con la referencia.
2. Guarda la fila en la hoja de Google de la clínica (`LEADS_SHEET_URL`). Ver `docs/leads-apps-script.gs`.
3. Si el lead es A o B, envía `Contact` a la API de Conversiones de Meta con el contacto cifrado en el servidor, la IP, el navegador, `fbp`/`fbc` y el mismo `event_id`. En `custom_data` solo van `value` y `currency`.

Variables de entorno en Vercel: `LEADS_SHEET_URL`, `META_DATASET_ID`, `META_CAPI_TOKEN`, `META_TEST_EVENT_CODE` (opcional, solo para pruebas) y `META_GRAPH_VERSION` (opcional). Sin ellas no se envía nada, que es lo que pasa en local.

## Configuración en GTM (pendiente, después de publicar)

1. **Variables de capa de datos:**
   - `DLV - lead_ref`, `DLV - lead_quality`, `DLV - lead_timing`, `DLV - service_id`, `DLV - step` y `DLV - answer`.
   - `DLV - user_data.em`, `DLV - user_data.ph`, `DLV - user_data.fn`, `DLV - user_data.ln`, `DLV - user_data.ct`, `DLV - user_data.country` y `DLV - user_data.external_id`.
2. **Etiqueta de Meta `Contact`** (ya existe):
   - En Advanced Matching, mapear los campos de `user_data`. La plantilla acepta valores ya cifrados.
   - Usar `{{DLV - event_id}}` como ID del evento, que ya debería estar configurado.
3. **Etiqueta GA4 `generate_lead`** (ya existe): agregar `lead_quality`, `lead_ref`, `lead_timing` y `service_id`.
4. **Etiqueta GA4 nueva para el embudo:**
   - Evento `{{Event}}`, con un activador de expresión regular: `^vitalita_(form_abierto|form_paso|form_fuera_de_zona|form_cerrado|lead)$`.
   - Parámetros: `step`, `answer`, `cta_location`, `service_id`, `lead_quality` y `lead_ref`.
5. **GA4:** registrar como dimensiones personalizadas de evento `lead_quality`, `lead_ref`, `lead_timing`, `service_id`, `step` y `answer`.
