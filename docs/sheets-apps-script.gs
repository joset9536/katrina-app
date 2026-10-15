/**
 * Katrina — Google Apps Script Web App: auditoría de pedidos/llamados en Sheets.
 *
 * QUÉ HACE: recibe un POST con { timestamp, mesa, cliente, mensaje } y lo agrega
 * como una fila nueva a la pestaña "Katrina - Llamados". Sirve como respaldo de
 * auditoría fuera de Supabase — no reemplaza el sistema en vivo de /staff.
 *
 * OJO: si ya tenés una planilla vieja de Katrina (del sistema de Grok/Hostinger,
 * pestaña "Katrina - Pedidos", 8 columnas: Fecha/Hora, Mesa, Pedido, Cant.
 * Items, Página, Estado, Precio, Notas) — NO la toques ni la reuses. Este
 * script es de un sistema distinto (llamados al mozo, no carrito de compras)
 * y usa su PROPIA pestaña nueva, "Katrina - Llamados", con 4 columnas. Podés
 * pegar este script en la MISMA planilla/archivo de siempre sin problema —
 * solo va a agregar una pestaña nueva al lado de la vieja, no la va a mezclar.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * INSTRUCCIONES PARA JOSÉ (hacer esto con tu cuenta de Google — Claude no
 * puede autorizar Apps Script por vos):
 *
 * 1. Abrí tu planilla de Katrina que ya tenés:
 *    https://docs.google.com/spreadsheets/d/1gGpifOPZ4EemZC6wOAP5pvo0uMu5JTyd0K09KQc3WqU/edit
 *    (si preferís una planilla nueva en blanco también funciona, no es obligatorio
 *    reusar esta). Este script crea/usa una PESTAÑA (tab) nueva llamada
 *    exactamente "Katrina - Llamados" adentro de ese archivo — no hace falta
 *    que la crees vos, el script la crea sola la primera vez que corre. NO
 *    toca la pestaña vieja "Katrina - Pedidos" para nada.
 *
 * 2. Extensiones → Apps Script (te abre un editor de código en otra pestaña).
 *
 * 3. Borrá todo el código de ejemplo (Code.gs) que aparece por defecto y
 *    pegá TODO este archivo entero en su lugar.
 *
 * 4. Arriba a la derecha, botón "Implementar" (Deploy) → "Nueva implementación"
 *    (New deployment).
 *    - Tipo: "Aplicación web" (Web app).
 *    - Descripción: la que quieras, ej "Katrina webhook v1".
 *    - Ejecutar como: "Yo" (tu cuenta).
 *    - Quién tiene acceso: "Cualquier usuario" (Anyone) — así el servidor de
 *      Katrina puede mandarle datos sin loguearse con tu cuenta de Google.
 *    - Clic en "Implementar". Te va a pedir autorizar permisos la primera
 *      vez (una pantalla de "Google no verificó esta app" — es normal para
 *      scripts personales, hacé clic en "Avanzado" → "Ir a [nombre] (no
 *      seguro)" → "Permitir").
 *
 * 5. Te va a dar una URL que termina en "/exec" — ESA es la URL que hay que
 *    copiar. Ejemplo: https://script.google.com/macros/s/AKfycb.../exec
 *
 * 6. Esa URL se la pasás a Claude (o la cargás vos) como variable de entorno
 *    SHEETS_WEBHOOK_URL en Vercel → el proyecto katrina-app → Settings →
 *    Environment Variables. Sin esa variable cargada, el sitio sigue
 *    funcionando exactamente igual que ahora, solo que no escribe en la
 *    planilla (falla en silencio, no rompe nada — mismo patrón que ya usa
 *    GROQ_API_KEY).
 *
 * 7. Si en el futuro cambiás el código de este script, tenés que volver a
 *    "Implementar" → "Gestionar implementaciones" → ícono de lápiz → subir
 *    versión "Nueva versión" → Implementar. Publicar código nuevo sin crear
 *    una "nueva versión" NO actualiza la URL /exec que ya está en uso.
 * ─────────────────────────────────────────────────────────────────────────
 */

const SHEET_NAME = "Katrina - Llamados";
const HEADERS = ["timestamp", "mesa", "cliente", "mensaje"];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet_();
    sheet.appendRow([
      body.timestamp || new Date().toISOString(),
      body.mesa || "",
      body.cliente || "",
      body.mensaje || "",
    ]);
    return ContentService.createTextOutput(
      JSON.stringify({ ok: true }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
  }
  return sheet;
}
