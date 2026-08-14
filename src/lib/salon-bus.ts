import { createServerFn } from "@tanstack/react-start";
import type { LlamadoRow } from "./pedido";

export type ChatRow = {
  id: string;
  mesa_id: string;
  usuario: string;
  tipo: string;
  mensaje: string;
  created_at: string;
};

function restEnv() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    (typeof import.meta !== "undefined" ? import.meta.env.VITE_SUPABASE_URL : undefined);
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    (typeof import.meta !== "undefined" ? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY : undefined);
  return { url: url as string | undefined, key: key as string | undefined };
}

async function rest<T>(
  table: string,
  opts: { method?: string; query?: string; body?: unknown; prefer?: string } = {},
): Promise<{ data: T | null; error: string | null; status: number }> {
  const { url, key } = restEnv();
  if (!url || !key) return { data: null, error: "Faltan las claves de la base en Vercel.", status: 0 };
  const method = opts.method || "GET";
  const qs = opts.query ? `?${opts.query}` : "";
  try {
    const res = await fetch(`${url}/rest/v1/${table}${qs}`, {
      method,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: opts.prefer || "return=representation",
      },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });
    const text = await res.text();
    if (!res.ok) return { data: null, error: text.slice(0, 280) || `HTTP ${res.status}`, status: res.status };
    if (!text) return { data: null, error: null, status: res.status };
    return { data: JSON.parse(text) as T, error: null, status: res.status };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "fetch failed", status: 0 };
  }
}

async function ensureMesa(mesaId: string) {
  const numero = Number(String(mesaId).replace(/^mesa-/, ""));
  if (!Number.isInteger(numero) || numero < 1 || numero > 30) return;
  await rest("mesas", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: { id: mesaId, numero, estado: "ocupada" },
  });
  await rest("mesas", {
    method: "PATCH",
    query: `id=eq.${encodeURIComponent(mesaId)}`,
    prefer: "return=minimal",
    body: { estado: "ocupada" },
  });
}

export const llamarMozo = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { cliente: string; mesaId: string; mensaje?: string })
  .handler(async ({ data }) => {
    await ensureMesa(data.mesaId);
    const existing = await rest<LlamadoRow[]>("llamados", {
      query: `mesa_id=eq.${encodeURIComponent(data.mesaId)}&status=in.(en_espera,atendido)&order=timestamp.desc&limit=1`,
    });
    if (existing.error) return { llamado: null as LlamadoRow | null, error: existing.error };
    let llamado = existing.data?.[0] ?? null;
    if (!llamado) {
      const created = await rest<LlamadoRow[]>("llamados", {
        method: "POST",
        body: {
          mesa_id: data.mesaId,
          cliente_nombre: data.cliente,
          status: "en_espera",
          prioridad: 0,
        },
      });
      if (created.error || !created.data?.[0]) return { llamado: null, error: created.error || "No se pudo crear el llamado." };
      llamado = created.data[0];
    }
    if (data.mensaje?.trim()) {
      await rest("chat", {
        method: "POST",
        prefer: "return=minimal",
        body: { mesa_id: data.mesaId, usuario: data.cliente, tipo: "cliente", mensaje: data.mensaje.trim() },
      });
    }
    return { llamado, error: null as string | null };
  });

export const listarCola = createServerFn({ method: "POST" }).handler(async () => {
  const res = await rest<LlamadoRow[]>("llamados", {
    query: "status=eq.en_espera&order=prioridad.desc,timestamp.asc",
  });
  return { items: res.data || [], error: res.error };
});

export const listarMisLlamados = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { staff: string })
  .handler(async ({ data }) => {
    const res = await rest<LlamadoRow[]>("llamados", {
      query: `staff_asignado=eq.${encodeURIComponent(data.staff)}&status=eq.atendido&order=respondido_at.desc`,
    });
    return { items: res.data || [], error: res.error };
  });

export const atenderLlamado = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string; staff: string; cliente: string; mesaId: string })
  .handler(async ({ data }) => {
    const updated = await rest<LlamadoRow[]>("llamados", {
      method: "PATCH",
      query: `id=eq.${encodeURIComponent(data.id)}&status=eq.en_espera`,
      body: {
        status: "atendido",
        staff_asignado: data.staff,
        respondido_at: new Date().toISOString(),
      },
    });
    if (updated.error) return { ok: false, taken: false, error: updated.error };
    if (!updated.data?.length) return { ok: false, taken: true, error: null };
    await rest("chat", {
      method: "POST",
      prefer: "return=minimal",
      body: {
        mesa_id: data.mesaId,
        usuario: data.staff,
        tipo: "staff",
        mensaje: `Hola ${data.cliente}, soy ${data.staff}. Ya te atiendo.`,
      },
    });
    return { ok: true, taken: false, error: null };
  });

export const resolverLlamado = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    const res = await rest("llamados", {
      method: "PATCH",
      query: `id=eq.${encodeURIComponent(data.id)}`,
      prefer: "return=minimal",
      body: { status: "resuelto" },
    });
    return { ok: !res.error, error: res.error };
  });

export const listarChat = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { mesaId: string })
  .handler(async ({ data }) => {
    const res = await rest<ChatRow[]>("chat", {
      query: `mesa_id=eq.${encodeURIComponent(data.mesaId)}&order=created_at.asc&limit=120`,
    });
    return { items: res.data || [], error: res.error };
  });

export const enviarChat = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { mesaId: string; usuario: string; tipo: "cliente" | "staff"; mensaje: string })
  .handler(async ({ data }) => {
    if (!data.mensaje.trim()) return { ok: false, error: "Vacío." };
    await ensureMesa(data.mesaId);
    const res = await rest<ChatRow[]>("chat", {
      method: "POST",
      body: {
        mesa_id: data.mesaId,
        usuario: data.usuario,
        tipo: data.tipo,
        mensaje: data.mensaje.trim(),
      },
    });
    return { ok: !res.error, error: res.error, row: res.data?.[0] ?? null };
  });

export const getLlamado = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    const res = await rest<LlamadoRow[]>("llamados", {
      query: `id=eq.${encodeURIComponent(data.id)}&limit=1`,
    });
    return { llamado: res.data?.[0] ?? null, error: res.error };
  });
