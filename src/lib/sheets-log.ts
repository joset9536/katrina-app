import { createServerFn } from "@tanstack/react-start";

type SheetsLogPayload = {
  timestamp: string;
  mesa: string;
  cliente: string;
  mensaje: string;
};

/**
 * Manda una fila de auditoría a la Google Sheet del local (si José ya
 * configuró SHEETS_WEBHOOK_URL en Vercel). Corre server-side para no
 * exponer la URL del webhook de Apps Script al navegador. Si la variable
 * no está seteada, no hace nada — mismo patrón que GROQ_API_KEY en
 * katrina-ai.ts.
 */
export const logToSheets = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as SheetsLogPayload)
  .handler(async ({ data }) => {
    const webhookUrl = process.env.SHEETS_WEBHOOK_URL;
    if (!webhookUrl) return { ok: false };

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return { ok: true };
    } catch (err) {
      console.error("[sheets-log] fetch failed", err);
      return { ok: false };
    }
  });
