import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ChatMsg = {
  id: string;
  mensaje: string;
  usuario: string;
  tipo: string;
  mesa_id: string;
  created_at: string;
};

type Llamado = {
  id: string;
  mesa_id: string;
  cliente_nombre: string;
  timestamp: string;
  prioridad: number;
  staff_asignado: string | null;
  status: string;
};

const STORAGE_USER = "katrina_chat_user";
const STORAGE_MESA = "katrina_chat_mesa";
const STORAGE_LLAMADO = "katrina_chat_llamado";

export function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [usuario, setUsuario] = useState("");
  const [mesa, setMesa] = useState("");
  const [ready, setReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [llamadoId, setLlamadoId] = useState<string | null>(null);
  const [llamado, setLlamado] = useState<Llamado | null>(null);
  const [queue, setQueue] = useState<Llamado[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Restore identity + mesa via ?mesa=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mesaParam = params.get("mesa") || "";
    const u = localStorage.getItem(STORAGE_USER) || "";
    const m = mesaParam || localStorage.getItem(STORAGE_MESA) || "";
    const l = localStorage.getItem(STORAGE_LLAMADO);
    setUsuario(u);
    setMesa(m);
    setLlamadoId(l);
    setReady(Boolean(u && m));
  }, []);

  const mesaKey = mesa ? `mesa-${mesa}` : "";

  // Load messages + subscribe
  useEffect(() => {
    if (!open || !ready) return;
    let active = true;

    supabase
      .from("chat")
      .select("*")
      .eq("mesa_id", mesaKey)
      .order("created_at", { ascending: true })
      .limit(100)
      .then(({ data }) => {
        if (active && data) setMessages(data as ChatMsg[]);
      });

    const channel = supabase
      .channel(`chat-mesa-${mesaKey}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat", filter: `mesa_id=eq.${mesaKey}` },
        (payload) => {
          setMessages((prev) => {
            const next = payload.new as ChatMsg;
            if (prev.some((m) => m.id === next.id)) return prev;
            return [...prev, next];
          });
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [open, ready, mesaKey]);

  // Subscribe to llamados queue (for position + own state)
  useEffect(() => {
    if (!ready) return;
    let active = true;

    const load = async () => {
      const { data } = await supabase
        .from("llamados")
        .select("*")
        .eq("status", "en_espera")
        .order("prioridad", { ascending: false })
        .order("timestamp", { ascending: true });
      if (active && data) setQueue(data as Llamado[]);

      if (llamadoId) {
        const { data: mine } = await supabase
          .from("llamados")
          .select("*")
          .eq("id", llamadoId)
          .maybeSingle();
        if (active) setLlamado((mine as Llamado) || null);
      }
    };
    load();

    const ch = supabase
      .channel("llamados-client")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "llamados" },
        () => load(),
      )
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(ch);
    };
  }, [ready, llamadoId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const position = useMemo(() => {
    if (!llamadoId || !llamado || llamado.status !== "en_espera") return null;
    const idx = queue.findIndex((q) => q.id === llamadoId);
    return idx >= 0 ? idx + 1 : null;
  }, [queue, llamadoId, llamado]);

  const createLlamado = async (cliente: string, mesaId: string) => {
    const { data } = await supabase
      .from("llamados")
      .insert({ mesa_id: mesaId, cliente_nombre: cliente, status: "en_espera", prioridad: 0 })
      .select()
      .single();
    if (data) {
      setLlamadoId(data.id);
      localStorage.setItem(STORAGE_LLAMADO, data.id);
    }
    await supabase.from("mesas").update({ estado: "ocupada" }).eq("id", mesaId);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    const isUrgente = /urgente/i.test(text);
    const { error } = await supabase.from("chat").insert({
      mensaje: text,
      usuario,
      mesa_id: mesaKey,
      tipo: "cliente",
    });
    if (!error) setInput("");

    if (isUrgente && llamadoId) {
      await supabase.from("llamados").update({ prioridad: 1 }).eq("id", llamadoId);
    }
    // Reabrir llamado si estaba resuelto/abandonado
    if (llamado && (llamado.status === "resuelto" || llamado.status === "abandonado")) {
      await createLlamado(usuario, mesaKey);
    } else if (!llamadoId) {
      await createLlamado(usuario, mesaKey);
    }
    setSending(false);
  };

  const saveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = usuario.trim();
    const m = mesa.trim();
    if (!u || !m) return;
    localStorage.setItem(STORAGE_USER, u);
    localStorage.setItem(STORAGE_MESA, m);
    setReady(true);
    await createLlamado(u, `mesa-${m}`);
  };

  const statusLabel = () => {
    if (!llamado) return null;
    if (llamado.status === "atendido")
      return `👋 Te está atendiendo ${llamado.staff_asignado ?? "el staff"}`;
    if (llamado.status === "resuelto") return "✅ Llamada resuelta. Escribí si necesitás algo más.";
    if (llamado.status === "abandonado") return "⏱️ Llamada expirada. Volvé a escribir para llamar.";
    if (position) {
      const eta = Math.max(1, position * 2);
      return `✓ En cola · posición #${position} · ~${eta} min`;
    }
    return "✓ Llamada enviada";
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir chat con el staff"
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-[#FF3D8A]/60 bg-[#0E0A1A]/90 text-[#FF3D8A] shadow-[0_0_24px_rgba(255,61,138,0.55)] transition hover:scale-105 hover:shadow-[0_0_32px_rgba(255,61,138,0.85)] md:bottom-6 md:right-6"
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </button>

      {open && (
        <div className="fixed bottom-44 right-4 z-50 flex h-[65vh] max-h-[560px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-[#8B5CF6]/50 bg-[#0E0A1A]/95 shadow-[0_0_40px_rgba(139,92,246,0.35)] backdrop-blur-md animate-fade-in md:bottom-24 md:right-6 md:h-[70vh]">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#FF3D8A]">Katrina Chat</p>
              {ready && (
                <p className="text-[10px] uppercase tracking-widest text-white/50">
                  Mesa {mesa} · {usuario}
                </p>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white"
              aria-label="Cerrar chat"
            >
              <X size={18} />
            </button>
          </header>

          {!ready ? (
            <form onSubmit={saveIdentity} className="flex flex-1 flex-col justify-center gap-3 px-5">
              <p className="text-xs text-white/70">
                Contanos tu nombre y en qué mesa estás para llamar al staff.
              </p>
              <p className="text-[11px] text-white/40">
                Para una atención más personal, también podés escribirnos directo por{" "}
                <a
                  href="https://wa.me/5493878631310"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF3D8A] underline"
                >
                  WhatsApp
                </a>
                .
              </p>
              <input
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Tu nombre"
                className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[#FF3D8A] focus:outline-none"
                maxLength={40}
              />
              <input
                value={mesa}
                onChange={(e) => setMesa(e.target.value)}
                placeholder="Número de mesa (1-30)"
                className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[#FF3D8A] focus:outline-none"
                maxLength={3}
              />
              <button
                type="submit"
                className="mt-2 rounded-md bg-[#FF3D8A] px-4 py-2 text-sm font-semibold text-[#0E0A1A] hover:bg-[#ff5c9d]"
              >
                Llamar al staff
              </button>
            </form>
          ) : (
            <>
              <div className="border-b border-white/10 px-4 py-2 text-[11px]">
                <p className="text-white/80">{statusLabel()}</p>
                {llamado?.status === "en_espera" && llamado.prioridad !== 1 && (
                  <p className="mt-1 text-white/40">
                    Si es urgente escribí <span className="text-[#FF3D8A]">URGENTE</span> en el chat.
                  </p>
                )}
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
                {messages.length === 0 && (
                  <p className="mt-8 text-center text-xs text-white/40">
                    Todavía no hay mensajes. Escribí algo 👇
                  </p>
                )}
                {messages.map((m) => {
                  const mine = m.usuario === usuario && m.tipo === "cliente";
                  const isStaff = m.tipo === "staff";
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
                    >
                      <span className="text-[10px] uppercase tracking-wider text-white/40">
                        {isStaff ? `Staff${m.usuario ? ` · ${m.usuario}` : ""}` : m.usuario}
                      </span>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                          mine
                            ? "bg-[#FF3D8A] text-[#0E0A1A]"
                            : isStaff
                              ? "bg-[#8B5CF6]/90 text-white"
                              : "bg-white/10 text-white"
                        }`}
                      >
                        {m.mensaje}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex items-center gap-2 border-t border-white/10 px-3 py-3"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribí un mensaje…"
                  className="flex-1 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm text-white placeholder-white/40 focus:border-[#FF3D8A] focus:outline-none"
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  aria-label="Enviar"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF3D8A] text-[#0E0A1A] transition hover:bg-[#ff5c9d] disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
