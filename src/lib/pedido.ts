import { supabase } from "@/integrations/supabase/client";
import { formatPedidoText, type CartLine } from "./cart";
import { logToSheets } from "./sheets-log";

export type PedidoStatus = "pendiente" | "visto" | "entregado" | "cancelado";

export type PedidoRow = {
  id: string;
  mesa_id: string;
  cliente_nombre: string;
  items: CartLine[];
  status: PedidoStatus;
  llamado_id: string | null;
  created_at: string;
};

export type LlamadoRow = {
  id: string;
  mesa_id: string;
  cliente_nombre: string;
  timestamp: string;
  prioridad: number;
  staff_asignado: string | null;
  respondido_at: string | null;
  status: string;
};

export function isPedidoMessage(text: string): boolean {
  return text.startsWith("[PEDIDO]") || text.startsWith("Quiero pedir:");
}

export async function ensureLlamado(cliente: string, mesaId: string): Promise<{
  llamado: LlamadoRow | null;
  error: string | null;
}> {
  const { data: existing, error: findError } = await supabase
    .from("llamados")
    .select("*")
    .eq("mesa_id", mesaId)
    .in("status", ["en_espera", "atendido"])
    .order("timestamp", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findError) return { llamado: null, error: findError.message };
  if (existing) return { llamado: existing as LlamadoRow, error: null };

  const { data, error } = await supabase
    .from("llamados")
    .insert({ mesa_id: mesaId, cliente_nombre: cliente, status: "en_espera", prioridad: 0 })
    .select()
    .single();

  if (error) return { llamado: null, error: error.message };

  await supabase.from("mesas").update({ estado: "ocupada" }).eq("id", mesaId);
  logToSheets({
    data: {
      timestamp: new Date().toISOString(),
      mesa: mesaId,
      cliente,
      mensaje: "Llamó al mozo",
    },
  }).catch(() => {});

  return { llamado: data as LlamadoRow, error: null };
}

export async function submitPedido(opts: {
  cliente: string;
  mesaId: string;
  lines: CartLine[];
}): Promise<{ ok: boolean; llamadoId: string | null; error: string | null }> {
  if (!opts.lines.length) return { ok: false, llamadoId: null, error: "El pedido está vacío." };

  const { llamado, error } = await ensureLlamado(opts.cliente, opts.mesaId);
  if (error || !llamado) return { ok: false, llamadoId: null, error: error || "No se pudo registrar el llamado." };

  const mensaje = formatPedidoText(opts.lines);
  const { error: chatError } = await supabase.from("chat").insert({
    mensaje,
    usuario: opts.cliente,
    mesa_id: opts.mesaId,
    tipo: "cliente",
  });
  if (chatError) return { ok: false, llamadoId: llamado.id, error: chatError.message };

  const { error: pedidoError } = await supabase.from("pedidos").insert({
    mesa_id: opts.mesaId,
    cliente_nombre: opts.cliente,
    items: opts.lines,
    status: "pendiente",
    llamado_id: llamado.id,
  });
  // La tabla pedidos puede no existir todavía en un Supabase viejo.
  // El chat ya tiene el pedido, así que no bloqueamos.
  if (pedidoError && !/schema cache|does not exist|relation/i.test(pedidoError.message)) {
    console.warn("[pedido] no se pudo guardar en pedidos:", pedidoError.message);
  }

  logToSheets({
    data: {
      timestamp: new Date().toISOString(),
      mesa: opts.mesaId,
      cliente: opts.cliente,
      mensaje,
    },
  }).catch(() => {});

  return { ok: true, llamadoId: llamado.id, error: null };
}

export async function fetchPedidosMesa(mesaId: string): Promise<PedidoRow[]> {
  const { data, error } = await supabase
    .from("pedidos")
    .select("*")
    .eq("mesa_id", mesaId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data as PedidoRow[];
}

export function parsePedidoFromChat(mensaje: string): CartLine[] {
  if (mensaje.startsWith("Quiero pedir:")) {
    const rest = mensaje.replace("Quiero pedir:", "").trim();
    const match = rest.match(/^(.*?)(?:\s+\((.+)\))?$/);
    return [
      {
        key: rest,
        name: match?.[1] || rest,
        qty: 1,
        price: match?.[2],
      },
    ];
  }
  if (!mensaje.startsWith("[PEDIDO]")) return [];
  return mensaje
    .split("\n")
    .slice(1)
    .map((line) => {
      const m = line.match(/^•\s+(\d+)x\s+(.+?)(?:\s+\((.+)\))?$/);
      if (!m) return null;
      return { key: m[2], name: m[2], qty: Number(m[1]), price: m[3] };
    })
    .filter((x): x is CartLine => Boolean(x));
}
