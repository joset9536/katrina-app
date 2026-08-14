import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchPedidosMesa, isPedidoMessage, parsePedidoFromChat, type PedidoRow } from "@/lib/pedido";
import { cartLineLabel, type CartLine } from "@/lib/cart";

type Llamado = {
  id: string;
  mesa_id: string;
  cliente_nombre: string;
  timestamp: string;
  respondido_at: string | null;
  staff_asignado: string | null;
  status: string;
};

type ChatMsg = {
  id: string;
  mesa_id: string;
  usuario: string;
  tipo: string;
  mensaje: string;
  created_at: string;
};

export function MisLlamados({ staffNombre }: { staffNombre: string }) {
  const [items, setItems] = useState<Llamado[]>([]);
  const [openMesa, setOpenMesa] = useState<string | null>(null);
  const [tab, setTab] = useState<"chat" | "pedido">("pedido");
  const [chatMap, setChatMap] = useState<Record<string, ChatMsg[]>>({});
  const [pedidoMap, setPedidoMap] = useState<Record<string, CartLine[]>>({});
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("llamados")
        .select("*")
        .eq("staff_asignado", staffNombre)
        .eq("status", "atendido")
        .order("respondido_at", { ascending: false });
      setItems((data as Llamado[]) || []);
    };
    load();
    const ch = supabase
      .channel(`mis-llamados-${staffNombre}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "llamados" }, () => load())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat" }, (payload) => {
        const msg = payload.new as ChatMsg;
        setChatMap((prev) => {
          const list = prev[msg.mesa_id] || [];
          if (list.some((m) => m.id === msg.id)) return prev;
          return { ...prev, [msg.mesa_id]: [...list, msg] };
        });
        if (isPedidoMessage(msg.mensaje)) {
          setPedidoMap((prev) => ({
            ...prev,
            [msg.mesa_id]: [...(prev[msg.mesa_id] || []), ...parsePedidoFromChat(msg.mensaje)],
          }));
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "pedidos" }, () => {
        if (openMesa) void loadPedido(openMesa);
      })
      .subscribe();
    const poll = setInterval(load, 5000);
    return () => {
      supabase.removeChannel(ch);
      clearInterval(poll);
    };
  }, [staffNombre, openMesa]);

  const loadChat = async (mesaId: string) => {
    const { data } = await supabase
      .from("chat")
      .select("*")
      .eq("mesa_id", mesaId)
      .order("created_at", { ascending: true })
      .limit(100);
    const msgs = (data as ChatMsg[]) || [];
    setChatMap((prev) => ({ ...prev, [mesaId]: msgs }));
    const fromChat = msgs.filter((m) => isPedidoMessage(m.mensaje)).flatMap((m) => parsePedidoFromChat(m.mensaje));
    setPedidoMap((prev) => ({ ...prev, [mesaId]: fromChat }));
  };

  const loadPedido = async (mesaId: string) => {
    const rows: PedidoRow[] = await fetchPedidosMesa(mesaId);
    const openRows = rows.filter((r) => r.status === "pendiente" || r.status === "visto");
    if (openRows.length) {
      setPedidoMap((prev) => ({ ...prev, [mesaId]: openRows.flatMap((r) => r.items) }));
    }
  };

  const openChat = async (mesaId: string) => {
    setOpenMesa(mesaId);
    setTab("pedido");
    await Promise.all([loadChat(mesaId), loadPedido(mesaId)]);
  };

  const enviar = async () => {
    const text = draft.trim();
    if (!text || !openMesa || sending) return;
    setSending(true);
    const { error } = await supabase.from("chat").insert({
      mesa_id: openMesa,
      usuario: staffNombre,
      tipo: "staff",
      mensaje: text,
    });
    setSending(false);
    if (error) {
      toast.error("No se pudo enviar.");
      return;
    }
    setDraft("");
  };

  const resolver = async (l: Llamado) => {
    if (busyId) return;
    setBusyId(l.id);
    const { error } = await supabase.from("llamados").update({ status: "resuelto" }).eq("id", l.id);
    setBusyId(null);
    if (error) {
      toast.error("No se pudo marcar como atendido.");
      return;
    }
    toast.success(`Mesa ${l.mesa_id.replace("mesa-", "")}: llamado cerrado. La mesa sigue ocupada.`);
    if (openMesa === l.mesa_id) setOpenMesa(null);
  };

  return (
    <section className="rounded-xl border border-white/10 bg-black/40 p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#8B5CF6]">
        Mis mesas ({items.length})
      </h2>
      {items.length === 0 ? (
        <p className="text-xs text-white/40">Todavía no atendiste ningún llamado. Tomá uno de la cola arriba.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {items.map((l) => {
            const numero = l.mesa_id.replace("mesa-", "");
            const nuevos = (chatMap[l.mesa_id] || []).filter(
              (m) => m.tipo === "cliente" && new Date(m.created_at) > new Date(l.respondido_at || l.timestamp),
            ).length;
            return (
              <div key={l.id} className="rounded-lg border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">Mesa {numero}</p>
                  {nuevos > 0 && (
                    <span className="rounded-full bg-[#FF3D8A] px-2 py-0.5 text-[10px] font-bold text-[#0E0A1A]">
                      {nuevos}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/60">{l.cliente_nombre}</p>
                <div className="mt-2 flex gap-1">
                  <button type="button" onClick={() => openChat(l.mesa_id)} className="h-11 flex-1 rounded bg-white/10 px-2 text-[11px] active:scale-95">
                    Ver pedido
                  </button>
                  <button
                    type="button"
                    disabled={busyId === l.id}
                    onClick={() => resolver(l)}
                    className="h-11 rounded bg-emerald-500/80 px-3 text-[11px] font-semibold text-white active:scale-95 disabled:opacity-50"
                  >
                    Listo
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {openMesa && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 md:items-center" onClick={() => setOpenMesa(null)}>
          <div className="flex h-[75vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[#8B5CF6]/50 bg-[#0E0A1A]" onClick={(e) => e.stopPropagation()}>
            <header className="border-b border-white/10 px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-[#FF3D8A]">Mesa {openMesa.replace("mesa-", "")}</p>
                <button type="button" onClick={() => setOpenMesa(null)} className="flex h-11 w-11 items-center justify-center text-white/60">
                  ✕
                </button>
              </div>
              <div className="mt-2 flex gap-1">
                <button type="button" onClick={() => setTab("pedido")} className={`h-11 flex-1 rounded-full text-xs font-semibold ${tab === "pedido" ? "bg-[#FF3D8A] text-[#0E0A1A]" : "bg-white/10 text-white/60"}`}>
                  Pedido
                </button>
                <button type="button" onClick={() => setTab("chat")} className={`h-11 flex-1 rounded-full text-xs font-semibold ${tab === "chat" ? "bg-[#8B5CF6] text-white" : "bg-white/10 text-white/60"}`}>
                  Chat
                </button>
              </div>
            </header>

            {tab === "pedido" ? (
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {(pedidoMap[openMesa] || []).length === 0 ? (
                  <p className="mt-8 text-center text-xs text-white/40">Esta mesa todavía no mandó un pedido por la carta.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {(pedidoMap[openMesa] || []).map((line, i) => (
                      <li key={`${line.key}-${i}`} className="rounded-lg bg-white/5 px-3 py-2">
                        {line.qty}× {cartLineLabel(line)} {line.price ? `· ${line.price}` : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
                  {(chatMap[openMesa] || []).map((m) => {
                    const mine = m.tipo === "staff";
                    return (
                      <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                        <span className="text-[10px] text-white/40">{mine ? `Staff · ${m.usuario}` : m.usuario}</span>
                        <div className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${mine ? "bg-[#8B5CF6] text-white" : "bg-white/10 text-white"}`}>
                          {m.mensaje}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    enviar();
                  }}
                  className="flex gap-2 border-t border-white/10 px-3 py-3"
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Responder al cliente…"
                    className="h-11 flex-1 rounded-full border border-white/15 bg-black/40 px-4 text-sm text-white focus:border-[#FF3D8A] focus:outline-none"
                    maxLength={500}
                  />
                  <button type="submit" disabled={sending} className="h-11 rounded-full bg-[#FF3D8A] px-4 text-sm font-semibold text-[#0E0A1A] disabled:opacity-50">
                    Enviar
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
