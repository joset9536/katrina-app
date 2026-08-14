import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cartLineLabel, type CartLine } from "@/lib/cart";
import { isPedidoMessage, parsePedidoFromChat } from "@/lib/pedido";

type Pedido = {
  id: string;
  mesa_id: string;
  cliente_nombre: string;
  items: CartLine[];
  status: string;
  created_at: string;
};

function elapsed(ts: string) {
  const m = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (m < 1) return "recién";
  return `${m} min`;
}

export function Comandas() {
  const [items, setItems] = useState<Pedido[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .in("status", ["pendiente", "visto"])
      .order("created_at", { ascending: true });
    if (!error && data) {
      setItems(data as Pedido[]);
      return;
    }
    const { data: chats } = await supabase
      .from("chat")
      .select("id, mesa_id, usuario, mensaje, created_at")
      .order("created_at", { ascending: false })
      .limit(80);
    const parsed: Pedido[] = [];
    for (const row of chats || []) {
      if (!isPedidoMessage(row.mensaje)) continue;
      parsed.push({
        id: row.id,
        mesa_id: row.mesa_id,
        cliente_nombre: row.usuario,
        items: parsePedidoFromChat(row.mensaje),
        status: "pendiente",
        created_at: row.created_at,
      });
    }
    setItems(parsed.reverse());
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("comandas-cocina")
      .on("postgres_changes", { event: "*", schema: "public", table: "pedidos" }, () => load())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat" }, () => load())
      .subscribe();
    const poll = setInterval(load, 6000);
    return () => {
      supabase.removeChannel(ch);
      clearInterval(poll);
    };
  }, []);

  const marcar = async (p: Pedido, status: "visto" | "entregado") => {
    setBusy(p.id);
    const { error } = await supabase.from("pedidos").update({ status }).eq("id", p.id);
    setBusy(null);
    if (error) {
      toast.error("No se pudo actualizar la comanda.");
      return;
    }
    toast.success(status === "visto" ? "Cocina ya la vio" : "Pedido entregado");
    load();
  };

  return (
    <section className="rounded-xl border border-[#E8B923]/30 bg-black/40 p-4">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-widest text-[#E8B923]">
        Comandas ({items.length})
      </h2>
      <p className="mb-3 text-[11px] text-white/50">
        Lo que pidió cada mesa. Como un monitor de cocina, sin impresora.
      </p>
      {items.length === 0 ? (
        <p className="text-xs text-white/40">No hay pedidos abiertos.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((p) => (
            <li key={p.id} className="rounded-lg border border-[#E8B923]/25 bg-[#E8B923]/5 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-2xl font-bold text-[#E8B923]">Mesa {p.mesa_id.replace("mesa-", "")}</p>
                <span className="text-[11px] text-white/50">{elapsed(p.created_at)}</span>
              </div>
              <p className="text-[11px] text-white/50">{p.cliente_nombre}</p>
              <ul className="mt-2 space-y-1 text-sm text-white">
                {(p.items || []).map((line, i) => (
                  <li key={`${p.id}-${i}`}>
                    {line.qty}× {cartLineLabel(line)}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={busy === p.id}
                  onClick={() => marcar(p, "visto")}
                  className="h-11 flex-1 rounded-md bg-white/10 text-xs font-semibold active:scale-95"
                >
                  Visto
                </button>
                <button
                  type="button"
                  disabled={busy === p.id}
                  onClick={() => marcar(p, "entregado")}
                  className="h-11 flex-1 rounded-md bg-[#E8B923] text-xs font-semibold text-[#0E0A1A] active:scale-95"
                >
                  Entregado
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
