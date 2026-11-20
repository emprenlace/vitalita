import { createFileRoute } from "@tanstack/react-router";
import { BlogShell } from "@/components/vitalita/BlogShell";
import { DIRECCION, RESPONSABLE_DATOS, SITE_URL } from "@/config/site";

const TITLE = "Política de privacidad y tratamiento de datos | Vitalita";
const DESC =
  "Cómo Vitalita Centro de Fisioterapia recoge, usa y protege los datos que compartes al agendar tu sesión.";
const URL = `${SITE_URL}/politica-de-privacidad`;

export const Route = createFileRoute("/politica-de-privacidad")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const r = RESPONSABLE_DATOS;
  const id = [r.razonSocial, r.nit && `NIT ${r.nit}`].filter(Boolean).join(", ");
  return (
    <BlogShell>
      <article className="legal-page container-x">
        <header className="post-head">
          <h1 className="post-title legal-title">Política de privacidad y tratamiento de datos</h1>
          <p className="post-excerpt">Última actualización: {r.actualizada}.</p>
        </header>

        <div className="post-body legal-body">
          <h2>Quién trata tus datos</h2>
          <p>
            {r.nombre}
            {id ? ` (${id})` : ""}, con sede en {DIRECCION.linea}, {DIRECCION.ciudad}, es la
            responsable del tratamiento de los datos personales que compartes en este sitio, en
            cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013.
          </p>

          <h2>Qué datos recogemos</h2>
          <p>
            Cuando agendas tu sesión nos das tu nombre, tu número de WhatsApp, tu correo y la sesión
            que te interesa. Lo que elijas sobre las zonas que sientes cargadas solo se incluye en
            el mensaje que tú envías por WhatsApp.
          </p>
          <p>
            También usamos cookies y herramientas de medición (Google Analytics, Google Tag Manager
            y el píxel de Meta) para saber cómo se usa el sitio y qué anuncios funcionan.
          </p>

          <h2>Para qué los usamos</h2>
          <p>
            Usamos tus datos para coordinar y confirmar tu cita, enviarte recordatorios y responder
            tus preguntas. Con tu autorización, podemos escribirte sobre nuestros servicios; puedes
            pedir que dejemos de hacerlo en cualquier momento.
          </p>
          <p>
            Para medir nuestros anuncios, enviamos a Meta tu nombre, tu número y tu correo cifrados
            (convertidos en un código que no se puede leer). Nunca enviamos información sobre tu
            salud ni sobre las zonas que quieres tratar.
          </p>

          <h2>Con quién los compartimos</h2>
          <p>
            Solo con los proveedores que nos ayudan a operar: Google, donde guardamos las
            solicitudes de cita; WhatsApp, por donde conversamos contigo, y Meta, en la forma
            cifrada que explicamos arriba. No vendemos tus datos.
          </p>

          <h2>Tus derechos</h2>
          <p>
            Puedes conocer, actualizar y corregir tus datos, pedir que los eliminemos, revocar tu
            autorización y presentar quejas ante la Superintendencia de Industria y Comercio. Para
            ejercerlos, escríbenos por WhatsApp al {r.telefono}
            {r.correo ? ` o al correo ${r.correo}` : ""}. Te respondemos en los plazos que fija la
            ley: diez días hábiles para consultas y quince para reclamos.
          </p>

          <h2>Cuánto tiempo los guardamos</h2>
          <p>
            Mientras sean necesarios para atenderte y por el tiempo que exijan las normas que
            aplican a la clínica. Después los eliminamos.
          </p>
        </div>
      </article>
    </BlogShell>
  );
}
