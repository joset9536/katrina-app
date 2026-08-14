import type { LlamadoRow } from "./pedido";
import type { ChatRow } from "./salon-bus";
import { escribirFila, leerFilas, parsePayload } from "./salon-sheet";

function mesaKey(mesaId: string) {
  return mesaId.startsWith("mesa-") ? mesaId : `mesa-${mesaId}`;
}

function llamadoDeFilas(rows: { timestamp: string; mesa: string; pedido: string }[], mesaId?: string): LlamadoRow[] {
  const last = new Map<string, LlamadoRow>();
  for (const r of rows) {
    if (!r.mesa.startsWith("mesa-")) continue;
    if (mesaId && r.mesa !== mesaId) continue;
    const p = parsePayload(r.pedido);
    if (!p?.op) continue;
    const prev = last.get(r.mesa);
    if (p.op === "llamar") {
      last.set(r.mesa, {
        id: r.timestamp,
        mesa_id: r.mesa,
        cliente_nombre: p.cliente || "Mesa",
        timestamp: r.timestamp,
        prioridad: p.urgente === "1" ? 1 : 0,
        staff_asignado: null,
        respondido_at: null,
        status: "en_espera",
      });
    } else if (p.op === "atender" && prev) {
      last.set(r.mesa, {
        ...prev,
        status: "atendido",
        staff_asignado: p.staff || prev.staff_asignado,
        respondido_at: r.timestamp,
      });
    } else if (p.op === "listo" && prev) {
      last.set(r.mesa, { ...prev, status: "resuelto" });
    }
  }
  return Array.from(last.values());
}

export async function llamarMozo(opts: { data: { cliente: string; mesaId: string; mensaje?: string } }) {
  const mesaId = mesaKey(opts.data.mesaId);
  const ts = new Date().toISOString();
  await escribirFila(mesaId, { op: "llamar", cliente: opts.data.cliente, urgente: "0" }, "L", ts);
  if (opts.data.mensaje?.trim()) {
    await escribirFila(
      mesaId,
      { op: "chat", tipo: "cliente", usuario: opts.data.cliente, texto: opts.data.mensaje.trim() },
      "C",
    );
  }
  return {
    llamado: {
      id: ts,
      mesa_id: mesaId,
      cliente_nombre: opts.data.cliente,
      timestamp: ts,
      prioridad: 0,
      staff_asignado: null,
      respondido_at: null,
      status: "en_espera",
    } as LlamadoRow,
    error: null as string | null,
  };
}

export async function listarCola() {
  try {
    const items = llamadoDeFilas(await leerFilas()).filter((l) => l.status === "en_espera");
    return { items, error: null as string | null };
  } catch (e) {
    return { items: [] as LlamadoRow[], error: e instanceof Error ? e.message : "No se pudo leer la cola." };
  }
}

export async function listarMisLlamados(opts: { data: { staff: string } }) {
  try {
    const items = llamadoDeFilas(await leerFilas()).filter(
      (l) => l.status === "atendido" && l.staff_asignado === opts.data.staff,
    );
    return { items, error: null as string | null };
  } catch (e) {
    return { items: [] as LlamadoRow[], error: e instanceof Error ? e.message : "No se pudieron leer tus mesas." };
  }
}

export async function atenderLlamado(opts: {
  data: { id: string; staff: string; cliente: string; mesaId: string };
}) {
  try {
    await escribirFila(mesaKey(opts.data.mesaId), { op: "atender", cliente: opts.data.cliente, staff: opts.data.staff }, "L");
    await escribirFila(
      mesaKey(opts.data.mesaId),
      { op: "chat", tipo: "staff", usuario: opts.data.staff, texto: `Hola ${opts.data.cliente}, soy ${opts.data.staff}. Ya te atiendo.` },
      "C",
    );
    return { ok: true, taken: false, error: null as string | null };
  } catch (e) {
    return { ok: false, taken: false, error: e instanceof Error ? e.message : "No se pudo atender." };
  }
}

export async function resolverLlamado(opts: { data: { id: string; mesaId?: string } }) {
  try {
    const rows = llamadoDeFilas(await leerFilas());
    const l = rows.find((x) => x.id === opts.data.id) || rows.find((x) => x.mesa_id === opts.data.mesaId);
    if (!l) return { ok: false, error: "No se encontró el llamado." };
    await escribirFila(l.mesa_id, { op: "listo", cliente: l.cliente_nombre }, "L");
    return { ok: true, error: null as string | null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo cerrar." };
  }
}

export async function listarChat(opts: { data: { mesaId: string } }) {
  try {
    const mesaId = mesaKey(opts.data.mesaId);
    const items: ChatRow[] = [];
    for (const r of await leerFilas()) {
      if (r.mesa !== mesaId) continue;
      const p = parsePayload(r.pedido);
      if (p?.op !== "chat" || !p.texto) continue;
      items.push({
        id: r.timestamp + p.texto.slice(0, 8),
        mesa_id: mesaId,
        usuario: p.usuario || "",
        tipo: p.tipo || "cliente",
        mensaje: p.texto,
        created_at: r.timestamp,
      });
    }
    return { items, error: null as string | null };
  } catch (e) {
    return { items: [] as ChatRow[], error: e instanceof Error ? e.message : "No se pudieron cargar los mensajes." };
  }
}

export async function enviarChat(opts: {
  data: { mesaId: string; usuario: string; tipo: "cliente" | "staff"; mensaje: string };
}) {
  if (!opts.data.mensaje.trim()) return { ok: false, error: "Vacío.", row: null };
  try {
    const mesaId = mesaKey(opts.data.mesaId);
    const ts = new Date().toISOString();
    await escribirFila(
      mesaId,
      { op: "chat", tipo: opts.data.tipo, usuario: opts.data.usuario, texto: opts.data.mensaje.trim() },
      "C",
    );
    return {
      ok: true,
      error: null as string | null,
      row: {
        id: ts,
        mesa_id: mesaId,
        usuario: opts.data.usuario,
        tipo: opts.data.tipo,
        mensaje: opts.data.mensaje.trim(),
        created_at: ts,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo enviar.", row: null };
  }
}

export async function getLlamado(opts: { data: { id: string } }) {
  try {
    const l = llamadoDeFilas(await leerFilas()).find((x) => x.id === opts.data.id) ?? null;
    return { llamado: l, error: null as string | null };
  } catch (e) {
    return { llamado: null, error: e instanceof Error ? e.message : "No se pudo leer el llamado." };
  }
}

export async function listarConversaciones(_opts?: { data?: { mesaId?: string } }) {
  try {
    const items: ChatRow[] = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (const r of await leerFilas()) {
      if (!r.mesa.startsWith("mesa-")) continue;
      if (new Date(r.timestamp) < start) continue;
      const p = parsePayload(r.pedido);
      if (p?.op !== "chat" || !p.texto) continue;
      items.push({
        id: r.timestamp + p.texto.slice(0, 8),
        mesa_id: r.mesa,
        usuario: p.usuario || "",
        tipo: p.tipo || "cliente",
        mensaje: p.texto,
        created_at: r.timestamp,
      });
    }
    return { items, error: null as string | null };
  } catch (e) {
    return { items: [] as ChatRow[], error: e instanceof Error ? e.message : "No se pudieron cargar los chats." };
  }
}
