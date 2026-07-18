import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [chatMap, setChatMap] = useState<Record<string, ChatMsg[]>>({});
  const [draft, setDraft] = useState("");

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
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "llamados" },
        () => load(),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat" },
        (payload) => {
          const msg = payload.new as ChatMsg;
          setChatMap((prev) => {
            const list = prev[msg.mesa_id] || [];
            if (list.some((m) => m.id === msg.id)) return prev;
            return { ...prev, [msg.mesa_id]: [...list, msg] };
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [staffNombre]);

  const loadChat = async (mesaId: string) => {
    const { data } = await supabase
      .from("chat")
      .select("*")
      .eq("mesa_id", mesaId)
      .order("created_at", { ascending: true })
      .limit(100);
    setChatMap((prev) => ({ ...prev, [mesaId]: (data as ChatMsg[]) || [] }));
  };

  const openChat = (mesaId: string) => {
    setOpenMesa(mesaId);
    if (!chatMap[mesaId]) loadChat(mesaId);
  };

  const enviar = async () => {
    const text = draft.trim();
    if (!text || !openMesa) return;
    await supabase.from("chat").insert({
      mesa_id: openMesa,
      usuario: staffNombre,
      tipo: "staff",
      mensaje: text,
    });
    setDraft("");
  };

  const resolver = async (l: Llamado) => {
    await supabase.from("llamados").update({ status: "resuelto" }).eq("id", l.id);
    await supabase.from("mesas").update({ estado: "libre" }).eq("id", l.mesa_id);
    if (openMesa === l.mesa_id) setOpenMesa(null);
  };

  return (
    <section className="rounded-xl border border-white/10 bg-black/40 p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#8B5CF6]">
        Mis mesas ({items.length})
      </h2>
      {items.length === 0 ? (
        <p className="text-xs text-white/40">
          Todavía no atendiste ningún llamado. Tomá uno de la cola arriba.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {items.map((l) => {
            const numero = l.mesa_id.replace("mesa-", "");
            const nuevos =
              (chatMap[l.mesa_id] || []).filter(
                (m) =>
                  m.tipo === "cliente" &&
                  new Date(m.created_at) > new Date(l.respondido_at || l.timestamp),
              ).length;
            return (
              <div
                key={l.id}
                className="rounded-lg border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">Mesa {numero}</p>
                  {nuevos > 0 && (
                    <span className="rounded-full bg-[#FF3D8A] px-2 py-0.5 text-[10px] font-bold text-[#0E0A1A]">
                      🔔 {nuevos}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/60">{l.cliente_nombre}</p>
                <div className="mt-2 flex gap-1">
                  <button
                    onClick={() => openChat(l.mesa_id)}
                    className="flex-1 rounded bg-white/10 px-2 py-1 text-[11px] hover:bg-white/20"
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => resolver(l)}
                    className="rounded bg-emerald-500/80 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500"
                  >
                    ✓
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {openMesa && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 md:items-center"
          onClick={() => setOpenMesa(null)}
        >
          <div
            className="flex h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[#8B5CF6]/50 bg-[#0E0A1A]"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="font-semibold text-[#FF3D8A]">
                Chat mesa {openMesa.replace("mesa-", "")}
              </p>
              <button onClick={() => setOpenMesa(null)} className="text-white/60">
                ✕
              </button>
            </header>
            <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
              {(chatMap[openMesa] || []).map((m) => {
                const mine = m.tipo === "staff";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
                  >
                    <span className="text-[10px] text-white/40">
                      {mine ? `Staff · ${m.usuario}` : m.usuario}
                    </span>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        mine
                          ? "bg-[#8B5CF6] text-white"
                          : "bg-white/10 text-white"
                      }`}
                    >
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
                className="flex-1 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm text-white focus:border-[#FF3D8A] focus:outline-none"
                maxLength={500}
              />
              <button
                type="submit"
                className="rounded-full bg-[#FF3D8A] px-4 text-sm font-semibold text-[#0E0A1A]"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
