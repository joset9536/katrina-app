import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { formatPedidoText, type CartLine } from "./cart";
import { logToSheets } from "./sheets-log";
import { llamarMozo, enviarChat } from "./salon-bus";

export function isNetworkFailure(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /failed to fetch|networkerror|load failed|network request failed|err_name_not_resolved|timeout/i.test(msg);
}

async function withTimeout<T>(p: Promise<T>, ms = 5000): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), ms)),
  ]);
}

function asErrorMessage(err: unknown): string {
  if (isNetworkFailure(err)) return "NETWORK";
  if (err instanceof Error && err.message) return err.message;
  return "No se pudo llamar al mozo.";
}

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
  try {
    const res = await withTimeout(llamarMozo({ data: { cliente, mesaId } }), 12000);
    if (res.error || !res.llamado) return { llamado: null, error: res.error || "No se pudo llamar." };
    logToSheets({
      data: {
        timestamp: new Date().toISOString(),
        mesa: mesaId,
        cliente,
        mensaje: "Llamó al mozo",
      },
    }).catch(() => {});
    return { llamado: res.llamado, error: null };
  } catch (err) {
    return { llamado: null, error: asErrorMessage(err) };
  }
}

export async function submitPedido(opts: {
  cliente: string;
  mesaId: string;
  lines: CartLine[];
}): Promise<{ ok: boolean; llamadoId: string | null; error: string | null }> {
  if (!opts.lines.length) return { ok: false, llamadoId: null, error: "El pedido está vacío." };

  try {
  const { llamado, error } = await ensureLlamado(opts.cliente, opts.mesaId);
  if (error || !llamado) return { ok: false, llamadoId: null, error: error || "No se pudo registrar el llamado." };

  const mensaje = formatPedidoText(opts.lines);
  const chatRes = await enviarChat({
    data: { mesaId: opts.mesaId, usuario: opts.cliente, tipo: "cliente", mensaje },
  });
  if (!chatRes.ok) return { ok: false, llamadoId: llamado.id, error: chatRes.error || "No se pudo enviar el pedido." };

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
  } catch (err) {
    return { ok: false, llamadoId: null, error: asErrorMessage(err) };
  }
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
