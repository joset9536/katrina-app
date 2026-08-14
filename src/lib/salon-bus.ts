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

const GERENTE_NOMBRE = "Brenda";
const GERENTE_HASH = "da73b6e585f866f07537376670f87435d3ab7a1a34a29e61633a914977419b66";
const CUENTAS_MESA = "salon-cuentas";

export type SalonRol = "gerente" | "mozo";
export type SalonCuenta = {
  id: string;
  nombre: string;
  rol: SalonRol;
  activo: boolean;
  clave_hash: string | null;
};

function missingTable(err: string | null) {
  return !!err && /schema cache|does not exist|relation|PGRST205|Could not find the table/i.test(err);
}

async function hashClave(nombre: string, clave: string): Promise<string> {
  const text = `${nombre.trim().toLowerCase()}::${clave}`;
  if (globalThis.crypto?.subtle) {
    const buf = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(text).digest("hex");
}

function parseCuentaChat(row: ChatRow): SalonCuenta | null {
  try {
    const parsed = JSON.parse(row.mensaje) as SalonCuenta;
    if (!parsed?.nombre || !parsed?.rol) return null;
    return {
      id: parsed.id || row.id,
      nombre: parsed.nombre,
      rol: parsed.rol,
      activo: parsed.activo !== false,
      clave_hash: parsed.clave_hash ?? null,
    };
  } catch {
    return null;
  }
}

async function leerCuentas(): Promise<{ rows: SalonCuenta[]; via: "table" | "chat"; error: string | null }> {
  const table = await rest<SalonCuenta[]>("salon_usuarios", {
    query: "select=id,nombre,rol,activo,clave_hash&order=created_at.asc",
  });
  if (!table.error && table.data) return { rows: table.data, via: "table", error: null };
  if (table.error && !missingTable(table.error)) return { rows: [], via: "table", error: table.error };

  const chat = await rest<ChatRow[]>("chat", {
    query: `mesa_id=eq.${CUENTAS_MESA}&tipo=eq.sistema&order=created_at.asc`,
  });
  if (chat.error) return { rows: [], via: "chat", error: chat.error };
  return {
    rows: (chat.data || []).map(parseCuentaChat).filter((x): x is SalonCuenta => Boolean(x)),
    via: "chat",
    error: null,
  };
}

async function escribirCuenta(
  cuenta: SalonCuenta,
  via: "table" | "chat",
): Promise<{ error: string | null; id: string }> {
  if (via === "table") {
    const existing = await rest<SalonCuenta[]>("salon_usuarios", {
      query: `nombre=ilike.${encodeURIComponent(cuenta.nombre)}&limit=1`,
    });
    if (existing.data?.[0]) {
      const id = existing.data[0].id;
      const patched = await rest<SalonCuenta[]>("salon_usuarios", {
        method: "PATCH",
        query: `id=eq.${encodeURIComponent(id)}`,
        body: {
          nombre: cuenta.nombre,
          rol: cuenta.rol,
          activo: cuenta.activo,
          clave_hash: cuenta.clave_hash,
        },
      });
      return { error: patched.error, id };
    }
    const created = await rest<SalonCuenta[]>("salon_usuarios", {
      method: "POST",
      body: {
        nombre: cuenta.nombre,
        rol: cuenta.rol,
        activo: cuenta.activo,
        clave_hash: cuenta.clave_hash,
      },
    });
    return { error: created.error, id: created.data?.[0]?.id || cuenta.id };
  }

  const existing = await rest<ChatRow[]>("chat", {
    query: `mesa_id=eq.${CUENTAS_MESA}&tipo=eq.sistema&usuario=eq.${encodeURIComponent(cuenta.nombre)}&limit=1`,
  });
  const payload = {
    mesa_id: CUENTAS_MESA,
    usuario: cuenta.nombre,
    tipo: "sistema",
    mensaje: JSON.stringify(cuenta),
  };
  if (existing.data?.[0]) {
    const patched = await rest("chat", {
      method: "PATCH",
      query: `id=eq.${encodeURIComponent(existing.data[0].id)}`,
      prefer: "return=minimal",
      body: payload,
    });
    return { error: patched.error, id: existing.data[0].id };
  }
  const created = await rest<ChatRow[]>("chat", { method: "POST", body: payload });
  return { error: created.error, id: created.data?.[0]?.id || cuenta.id };
}

async function ensureBrenda(viaHint?: "table" | "chat"): Promise<{ via: "table" | "chat"; error: string | null; rows: SalonCuenta[] }> {
  const loaded = await leerCuentas();
  if (loaded.error) return { via: loaded.via, error: loaded.error, rows: [] };
  const via = viaHint || loaded.via;
  const brenda = loaded.rows.find((r) => r.nombre.toLowerCase() === GERENTE_NOMBRE.toLowerCase());
  const others = loaded.rows.filter((r) => r.nombre.toLowerCase() !== GERENTE_NOMBRE.toLowerCase());
  if (brenda && brenda.rol === "gerente" && brenda.activo && brenda.clave_hash === GERENTE_HASH) {
    return { via, error: null, rows: loaded.rows };
  }
  const cuenta: SalonCuenta = {
    id: brenda?.id || "gerente-brenda",
    nombre: GERENTE_NOMBRE,
    rol: "gerente",
    activo: true,
    clave_hash: GERENTE_HASH,
  };
  const saved = await escribirCuenta(cuenta, via);
  if (saved.error) return { via, error: saved.error, rows: loaded.rows };
  return { via, error: null, rows: [{ ...cuenta, id: saved.id }, ...others.map((u) => (u.rol === "gerente" ? { ...u, rol: "mozo" as const } : u))] };
}

export const entrarSalon = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { nombre: string; clave: string })
  .handler(async ({ data }) => {
    const n = data.nombre.trim();
    const clave = data.clave;
    if (!n || !clave) return { sesion: null, error: "Nombre y clave." };
    const ready = await ensureBrenda();
    if (ready.error) return { sesion: null, error: ready.error };
    const user = ready.rows.find((r) => r.nombre.toLowerCase() === n.toLowerCase());
    if (!user || !user.activo) return { sesion: null, error: "Ese nombre no está. Pedile a Brenda que te cargue." };
    if (!user.clave_hash) return { sesion: null, error: "Esa cuenta no tiene clave. Brenda tiene que asignarla." };
    const hash = await hashClave(user.nombre, clave);
    if (hash !== user.clave_hash) return { sesion: null, error: "Clave incorrecta." };
    return { sesion: { id: user.id, nombre: user.nombre, rol: user.rol }, error: null };
  });

export const listarEmpleados = createServerFn({ method: "POST" }).handler(async () => {
  const ready = await ensureBrenda();
  if (ready.error) return { items: [] as { id: string; nombre: string; rol: SalonRol; activo: boolean; tiene_clave: boolean }[], error: ready.error };
  return {
    items: ready.rows.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      rol: r.rol,
      activo: r.activo,
      tiene_clave: Boolean(r.clave_hash),
    })),
    error: null as string | null,
  };
});

export const crearMozo = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { nombre: string; clave: string })
  .handler(async ({ data }) => {
    const n = data.nombre.trim();
    if (!n) return { error: "Escribí el nombre." };
    if (data.clave.trim().length < 4) return { error: "La clave tiene que tener al menos 4 caracteres." };
    if (n.toLowerCase() === GERENTE_NOMBRE.toLowerCase()) return { error: "Ese nombre es de la gerente." };
    const ready = await ensureBrenda();
    if (ready.error) return { error: ready.error };
    const exists = ready.rows.find((r) => r.nombre.toLowerCase() === n.toLowerCase() && r.activo);
    if (exists) return { error: "Ese nombre ya está." };
    const cuenta: SalonCuenta = {
      id: crypto.randomUUID?.() ?? `mozo-${Date.now()}`,
      nombre: n,
      rol: "mozo",
      activo: true,
      clave_hash: await hashClave(n, data.clave),
    };
    const saved = await escribirCuenta(cuenta, ready.via);
    return { error: saved.error };
  });

export const resetearClaveMozo = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string; clave: string })
  .handler(async ({ data }) => {
    if (data.clave.trim().length < 4) return { error: "La clave tiene que tener al menos 4 caracteres." };
    const ready = await ensureBrenda();
    if (ready.error) return { error: ready.error };
    const user = ready.rows.find((r) => r.id === data.id);
    if (!user || user.rol !== "mozo") return { error: "No se encontró al mozo." };
    const saved = await escribirCuenta(
      { ...user, clave_hash: await hashClave(user.nombre, data.clave), activo: true },
      ready.via,
    );
    return { error: saved.error };
  });

export const bajaMozo = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    const ready = await ensureBrenda();
    if (ready.error) return { error: ready.error };
    const user = ready.rows.find((r) => r.id === data.id);
    if (!user || user.rol !== "mozo") return { error: "No se encontró al mozo." };
    const saved = await escribirCuenta({ ...user, activo: false }, ready.via);
    return { error: saved.error };
  });

export const listarConversaciones = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { mesaId?: string })
  .handler(async ({ data }) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const mesa = data.mesaId && data.mesaId !== "todas" ? `&mesa_id=eq.${encodeURIComponent(data.mesaId)}` : "";
    const res = await rest<ChatRow[]>("chat", {
      query: `tipo=neq.sistema&mesa_id=neq.${CUENTAS_MESA}&created_at=gte.${encodeURIComponent(start.toISOString())}${mesa}&order=created_at.asc&limit=300`,
    });
    return { items: res.data || [], error: res.error };
  });
