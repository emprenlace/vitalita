/**
 * Vitalita · Recibe los leads de "Arma tu sesión" y los guarda en esta hoja de Google.
 *
 * Instalación (una sola vez):
 * 1. Crea una hoja de Google para la clínica → Extensiones → Apps Script → pega este archivo.
 * 2. Implementar → Nueva implementación → Aplicación web.
 *    Ejecutar como: tú. Quién tiene acceso: cualquier usuario.
 * 3. Copia la URL que termina en /exec y guárdala en Vercel como LEADS_SHEET_URL.
 *
 * - Una fila por lead. La columna "estado_cita" la llena la clínica
 *   (Agendó, Asistió, Canceló, No respondió): con ella sabemos qué campañas traen pacientes.
 * - AVISAR_A: correo que recibe cada lead nuevo (vacío para no avisar).
 */
const HOJA = 'Leads';
const AVISAR_A = '';
const ESTADOS = ['Agendó', 'Asistió', 'Canceló', 'No respondió'];
const COLUMNAS = [
  'fecha', 'ref', 'calidad', 'estado_cita', 'servicio', 'precio', 'cuando', 'ciudad',
  'nombre', 'whatsapp', 'correo', 'boton', 'pagina',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'fbclid', 'gclid', 'landing_page', 'fbp', 'fbc',
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse((e.postData && e.postData.contents) || '{}');
    if (!data.ref || !data.whatsapp) return salida({ ok: false, error: 'faltan datos' });

    const libro = SpreadsheetApp.getActiveSpreadsheet();
    const hoja = libro.getSheetByName(HOJA) || libro.insertSheet(HOJA);
    if (hoja.getLastRow() === 0) {
      hoja.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS]).setFontWeight('bold');
      hoja.setFrozenRows(1);
      const regla = SpreadsheetApp.newDataValidation().requireValueInList(ESTADOS, true).build();
      hoja.getRange(2, COLUMNAS.indexOf('estado_cita') + 1, 1000, 1).setDataValidation(regla);
    }

    // Como texto: un valor que empieza por + = - @ (p. ej. "+57300…") Sheets lo tomaría como fórmula.
    const texto = (v) => {
      const s = String(v).slice(0, 500);
      return /^[=+\-@]/.test(s) ? "'" + s : s;
    };
    const fila = COLUMNAS.map((c) => (data[c] === undefined ? '' : texto(data[c])));
    fila[0] = new Date();
    fila[COLUMNAS.indexOf('estado_cita')] = '';

    const refs = hoja.getLastRow() > 1
      ? hoja.getRange(2, 2, hoja.getLastRow() - 1, 1).getValues().flat()
      : [];
    if (refs.indexOf(data.ref) === -1) hoja.appendRow(fila);

    if (AVISAR_A) {
      MailApp.sendEmail({
        to: AVISAR_A,
        subject: `Lead ${data.calidad} · ${data.servicio} · ${data.nombre}`,
        body:
          `${data.nombre} · ${data.whatsapp} · ${data.correo}\n` +
          `${data.servicio} · ${data.cuando} · ${data.ciudad}\n` +
          `Ref: ${data.ref} · Origen: ${data.utm_source || '(directo)'} ${data.utm_campaign || ''}\n` +
          `WhatsApp: https://wa.me/${String(data.whatsapp).replace(/\D/g, '')}`,
      });
    }
    return salida({ ok: true });
  } catch (err) {
    return salida({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function salida(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
