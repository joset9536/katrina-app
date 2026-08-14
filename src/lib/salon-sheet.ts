import { createServerFn } from "@tanstack/react-start";

/** Hoja real "Katrina Resto Bar". Write = webhook que ya responde 200. Read = CSV público. */

export const SHEETS_WEBHOOK =
  "https://script.google.com/macros/s/AKfycbx25Fsf4BXEtFcKx2djNmTxuLGWiu0ZpPA6y_JlT15ArinqK9wGxmUOGNZnFUbFjzNb/exec";
export const SHEETS_CSV =
  "https://docs.google.com/spreadsheets/d/1gGpifOPZ4EemZC6wOAP5pvo0uMu5JTyd0K09KQc3WqU/gviz/tq?tqx=out:csv&sheet=Katrina%20-%20Pedidos";

export type SheetRow = {
  timestamp: string;
  mesa: string;
  pedido: string;
  notas: string;
};

type Payload = Record<string, string>;

async function withTimeout<T>(p: Promise<T>, ms = 6000): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), ms)),
  ]);
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else q = !q;
    } else if (ch === "," && !q) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function parseCsv(text: string): SheetRow[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim());
  const rows: SheetRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const c = splitCsvLine(lines[i]);
    rows.push({
      timestamp: (c[0] || "").trim(),
      mesa: (c[1] || "").trim(),
      pedido: (c[2] || "").trim(),
      notas: (c[7] || c[5] || "").trim(),
    });
  }
  return rows;
}

let csvCache: { at: number; rows: SheetRow[] } | null = null;

const hojaLeer = createServerFn({ method: "POST" }).handler(async () => {
  const res = await fetch(SHEETS_CSV, { cache: "no-store" });
  if (!res.ok) return { text: "", error: `Hoja HTTP ${res.status}` };
  return { text: await res.text(), error: null as string | null };
});

const hojaEscribir = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { mesa: string; items: string; notas: string; timestamp: string })
  .handler(async ({ data }) => {
    const res = await fetch(SHEETS_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp: data.timestamp,
        mesa: data.mesa,
        items: data.items,
        total_items: 1,
        page: "salon",
        notas: data.notas,
      }),
    });
    return { ok: res.ok, error: res.ok ? null : `HTTP ${res.status}` };
  });

export async function leerFilas(force = false): Promise<SheetRow[]> {
  if (!force && csvCache && Date.now() - csvCache.at < 2000) return csvCache.rows;
  let text = "";
  try {
    const res = await withTimeout(fetch(SHEETS_CSV, { cache: "no-store" }));
    if (res.ok) text = await res.text();
  } catch {
    /* CORS en el celular: pasa por Vercel */
  }
  if (!text) {
    const viaServer = await withTimeout(hojaLeer());
    if (viaServer.error || !viaServer.text) throw new Error(viaServer.error || "No se pudo leer la hoja.");
    text = viaServer.text;
  }
  const rows = parseCsv(text);
  csvCache = { at: Date.now(), rows };
  return rows;
}

export async function escribirFila(
  mesa: string,
  payload: Payload,
  notas: string,
  timestamp = new Date().toISOString(),
): Promise<string> {
  csvCache = null;
  const items = JSON.stringify(payload);
  try {
    const res = await withTimeout(
      fetch(SHEETS_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp,
          mesa,
          items,
          total_items: 1,
          page: "salon",
          notas,
        }),
      }),
    );
    if (res.ok) return timestamp;
  } catch {
    /* CORS: Vercel */
  }
  const viaServer = await withTimeout(hojaEscribir({ data: { mesa, items, notas, timestamp } }));
  if (!viaServer.ok) throw new Error(viaServer.error || "No se pudo escribir en la hoja.");
  return timestamp;
}

export function parsePayload(pedido: string): Payload | null {
  const t = pedido.trim();
  if (!t.startsWith("{")) return null;
  try {
    const o = JSON.parse(t) as Payload;
    return o && typeof o === "object" ? o : null;
  } catch {
    return null;
  }
}

export async function hashClave(nombre: string, clave: string): Promise<string> {
  const text = `${nombre.trim().toLowerCase()}::${clave.replace(/\s/g, "")}`;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
