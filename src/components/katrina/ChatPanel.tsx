import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { toast } from "sonner";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { whatsappOrderUrl } from "@/lib/whatsapp";
import { askKatrinaAi } from "@/lib/katrina-ai";
import { useMesa } from "@/hooks/use-mesa";
import { useOnline } from "@/hooks/use-online";
import {
  persistMesa,
  persistUser,
  parseMesaValue,
  readStoredUser,
  STORAGE_LLAMADO,
} from "@/lib/mesa";
import { ensureLlamado, type LlamadoRow } from "@/lib/pedido";

type AiTurn = { role: "user" | "assistant"; content: string };

type ChatMsg = {
  id: string;
  mensaje: string;
  usuario: string;
  tipo: string;
  mesa_id: string;
  created_at: string;
};

export function ChatPanel() {
  const { active, numero, mesaId, queryError, hasValidMesa } = useMesa();
  const online = useOnline();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"ai" | "mozo">("mozo");
  const [aiMessages, setAiMessages] = useState<AiTurn[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiSending, setAiSending] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [usuario, setUsuario] = useState("");
  const [mesaInput, setMesaInput] = useState("");
  const [ready, setReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [llamadoId, setLlamadoId] = useState<string | null>(null);
  const [llamado, setLlamado] = useState<LlamadoRow | null>(null);
  const [queue, setQueue] = useState<LlamadoRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const parsedInput = parseMesaValue(mesaInput);
  const resolvedMesaId = hasValidMesa ? mesaId || "" : parsedInput.ok ? parsedInput.mesaId : "";

  useEffect(() => {
    const u = readStoredUser();
    const l = localStorage.getItem(STORAGE_LLAMADO);
    setUsuario(u);
    if (hasValidMesa) setMesaInput(String(numero));
    setLlamadoId(l);
    setReady(Boolean(u && hasValidMesa));
  }, [hasValidMesa, numero]);

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("katrina:open-chat", openChat);
    return () => window.removeEventListener("katrina:open-chat", openChat);
  }, []);

  const mesaKey = resolvedMesaId || (hasValidMesa ? mesaId : "") || "";

  useEffect(() => {
    if (!open || !ready || !mesaKey || !isSupabaseConfigured()) return;
    let activeSub = true;
    const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

    supabase
      .from("chat")
      .select("*")
      .eq("mesa_id", mesaKey)
      .gte("created_at", cutoff)
      .order("created_at", { ascending: true })
      .limit(100)
      .then(({ data, error }) => {
        if (!activeSub) return;
        if (error) setLoadError("No se pudieron cargar los mensajes.");
        else setMessages((data as ChatMsg[]) || []);
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
      activeSub = false;
      supabase.removeChannel(channel);
    };
  }, [open, ready, mesaKey]);

  useEffect(() => {
    if (!ready || !isSupabaseConfigured()) return;
    let activeSub = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("llamados")
        .select("*")
        .eq("status", "en_espera")
        .order("prioridad", { ascending: false })
        .order("timestamp", { ascending: true });
      if (!activeSub) return;
      if (error) setLoadError("No se pudo actualizar el estado del llamado.");
      if (data) setQueue(data as LlamadoRow[]);

      if (llamadoId) {
        const { data: mine } = await supabase.from("llamados").select("*").eq("id", llamadoId).maybeSingle();
        if (activeSub) setLlamado((mine as LlamadoRow) || null);
      }
    };
    load();
    const poll = window.setInterval(load, 8000);
    const ch = supabase
      .channel("llamados-client")
      .on("postgres_changes", { event: "*", schema: "public", table: "llamados" }, () => load())
      .subscribe();
    return () => {
      activeSub = false;
      window.clearInterval(poll);
      supabase.removeChannel(ch);
    };
  }, [ready, llamadoId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiMessages, open]);

  const position = useMemo(() => {
    if (!llamadoId || !llamado || llamado.status !== "en_espera") return null;
    const idx = queue.findIndex((q) => q.id === llamadoId);
    return idx >= 0 ? idx + 1 : null;
  }, [queue, llamadoId, llamado]);

  const sendText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return false;
    if (!online) {
      toast.error("Sin internet. El mensaje no salió.");
      return false;
    }
    if (!isSupabaseConfigured()) {
      toast.error("El sistema de mesas no está conectado.");
      return false;
    }
    setSending(true);
    setLoadError(null);
    const isUrgente = /urgente/i.test(trimmed);
    const { error } = await supabase.from("chat").insert({
      mensaje: trimmed,
      usuario,
      mesa_id: mesaKey,
      tipo: "cliente",
    });
    if (error) {
      setSending(false);
      toast.error("No se pudo enviar. Probá de nuevo.");
      return false;
    }

    if (llamado && (llamado.status === "resuelto" || llamado.status === "abandonado")) {
      const created = await ensureLlamado(usuario, mesaKey);
      if (created.llamado) {
        setLlamadoId(created.llamado.id);
        localStorage.setItem(STORAGE_LLAMADO, created.llamado.id);
        setLlamado(created.llamado);
      }
    } else if (!llamadoId) {
      const created = await ensureLlamado(usuario, mesaKey);
      if (created.llamado) {
        setLlamadoId(created.llamado.id);
        localStorage.setItem(STORAGE_LLAMADO, created.llamado.id);
        setLlamado(created.llamado);
      }
    }
    if (isUrgente && llamadoId) {
      await supabase.from("llamados").update({ prioridad: 1 }).eq("id", llamadoId);
    }
    setSending(false);
    return true;
  };

  const send = async () => {
    if (!input.trim()) return;
    const ok = await sendText(input);
    if (ok) setInput("");
  };

  const saveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!online) {
      toast.error("Sin internet. No se puede llamar al mozo.");
      return;
    }
    const u = usuario.trim();
    const parsed = hasValidMesa ? active : parseMesaValue(mesaInput);
    if (!u) {
      toast.error("Escribí tu nombre.");
      return;
    }
    if (!parsed.ok) {
      toast.error(queryError || "Esa mesa no existe. Pedile el QR al mozo.");
      return;
    }
    persistUser(u);
    persistMesa(parsed.numero);
    setReady(true);
    const created = await ensureLlamado(u, parsed.mesaId);
    if (created.error) {
      toast.error(created.error.includes("foreign key") ? "Esa mesa no existe." : created.error);
      setReady(false);
      return;
    }
    if (created.llamado) {
      setLlamadoId(created.llamado.id);
      localStorage.setItem(STORAGE_LLAMADO, created.llamado.id);
      setLlamado(created.llamado);
      toast.success("Llamado enviado. El mozo ya lo ve.");
    }
  };

  const askAi = async () => {
    const question = aiInput.trim();
    if (!question || aiSending) return;
    setAiSending(true);
    setAiInput("");
    setAiMessages((prev) => [...prev, { role: "user", content: question }]);
    try {
      const res = await askKatrinaAi({ data: { question, mesa: numero ? String(numero) : undefined, history: aiMessages } });
      setAiMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", content: "No me pude conectar ahora. Llamá al mozo o escribinos por WhatsApp." },
      ]);
    }
    setAiSending(false);
  };

  const statusLabel = () => {
    if (!llamado) return null;
    if (llamado.status === "atendido")
      return `Te está atendiendo ${llamado.staff_asignado ?? "el staff"}`;
    if (llamado.status === "resuelto") return "Llamada resuelta. Escribí si necesitás algo más.";
    if (llamado.status === "abandonado") return "Llamada expirada. Volvé a escribir para llamar.";
    if (position) return `En cola · posición #${position}`;
    return "Llamada enviada";
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir chat con el staff"
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-[#FF3D8A]/60 bg-[#0E0A1A]/90 text-[#FF3D8A] shadow-[0_0_24px_rgba(255,61,138,0.55)] transition active:scale-95 md:bottom-6 md:right-6"
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </button>

      {open && (
        <div className="fixed bottom-44 right-4 z-50 flex h-[65vh] max-h-[560px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-[#8B5CF6]/50 bg-[#0E0A1A]/95 shadow-[0_0_40px_rgba(139,92,246,0.35)] backdrop-blur-md md:bottom-24 md:right-6 md:h-[70vh]">
          <header className="border-b border-white/10">
            <div className="flex items-center justify-between px-4 pt-3">
              <p className="text-sm font-semibold text-[#FF3D8A]">Katrina · mesa</p>
              <button type="button" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center text-white/60" aria-label="Cerrar chat">
                <X size={18} />
              </button>
            </div>
            <div className="flex gap-1 px-3 pb-2 pt-2">
              <button
                type="button"
                onClick={() => setMode("mozo")}
                className={`flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium active:scale-95 ${
                  mode === "mozo" ? "bg-[#FF3D8A] text-[#0E0A1A]" : "text-white/50"
                }`}
              >
                <MessageCircle size={14} /> Llamar mozo
              </button>
              <button
                type="button"
                onClick={() => setMode("ai")}
                className={`flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium active:scale-95 ${
                  mode === "ai" ? "bg-[#8B5CF6] text-white" : "text-white/50"
                }`}
              >
                <Bot size={14} /> Carta
              </button>
            </div>
            {ready && mode === "mozo" && (
              <p className="px-4 pb-2 text-[10px] uppercase tracking-widest text-white/50">
                Mesa {numero ?? mesaInput} · {usuario}
              </p>
            )}
          </header>

          {mode === "ai" ? (
            <>
              <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
                {aiMessages.length === 0 && (
                  <p className="mt-8 text-center text-xs text-white/40">
                    Preguntame por horarios, dirección o un plato de la carta. No invento precios que no estén cargados.
                  </p>
                )}
                {aiMessages.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                    <span className="text-[10px] uppercase tracking-wider text-white/40">
                      {m.role === "user" ? "Vos" : "Asistente"}
                    </span>
                    <div className={`max-w-[85%] break-words rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-[#FF3D8A] text-[#0E0A1A]" : "bg-[#8B5CF6]/90 text-white"}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {aiSending && <p className="text-xs text-white/40">Escribiendo…</p>}
                <div ref={bottomRef} />
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  askAi();
                }}
                className="flex items-center gap-2 border-t border-white/10 px-3 py-3"
              >
                <input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Preguntame algo…"
                  className="h-11 flex-1 rounded-full border border-white/15 bg-black/40 px-4 text-sm text-white placeholder-white/40 focus:border-[#FF3D8A] focus:outline-none"
                  maxLength={300}
                />
                <button type="submit" disabled={aiSending || !aiInput.trim()} aria-label="Preguntar" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8B5CF6] text-white disabled:opacity-40">
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : !ready ? (
            <form onSubmit={saveIdentity} className="flex flex-1 flex-col justify-center gap-3 px-5">
              {!online && <p className="rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">Sin internet. No se puede llamar al mozo.</p>}
              {queryError && <p className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">{queryError}</p>}
              <p className="text-xs text-white/70">Nombre y mesa para llamar al staff.</p>
              <p className="text-[11px] text-white/40">
                Si preferís, escribinos por{" "}
                <a href={whatsappOrderUrl()} target="_blank" rel="noopener noreferrer" className="text-[#FF3D8A] underline">
                  WhatsApp
                </a>
                .
              </p>
              <input
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Tu nombre"
                className="h-11 rounded-md border border-white/15 bg-black/40 px-3 text-sm text-white placeholder-white/40 focus:border-[#FF3D8A] focus:outline-none"
                maxLength={40}
              />
              <input
                value={hasValidMesa ? String(numero) : mesaInput}
                onChange={(e) => setMesaInput(e.target.value)}
                placeholder="Número de mesa (1-30)"
                readOnly={hasValidMesa}
                className="h-11 rounded-md border border-white/15 bg-black/40 px-3 text-sm text-white placeholder-white/40 focus:border-[#FF3D8A] focus:outline-none read-only:opacity-70"
                maxLength={3}
                inputMode="numeric"
              />
              <button type="submit" disabled={!online} className="mt-2 h-12 rounded-md bg-[#FF3D8A] px-4 text-sm font-semibold text-[#0E0A1A] active:scale-[0.99] disabled:opacity-50">
                Llamar al staff
              </button>
            </form>
          ) : (
            <>
              <div className="border-b border-white/10 px-4 py-2 text-[11px]">
                <p className="text-white/80">{statusLabel()}</p>
                {loadError && <p className="mt-1 text-red-300">{loadError}</p>}
                {llamado?.status === "en_espera" && llamado.prioridad !== 1 && (
                  <p className="mt-1 text-white/40">
                    Si es urgente escribí <span className="text-[#FF3D8A]">URGENTE</span>.
                  </p>
                )}
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
                {messages.length === 0 && (
                  <p className="mt-8 text-center text-xs text-white/40">Todavía no hay mensajes. Escribí algo o mandá el pedido desde la carta.</p>
                )}
                {messages.map((m) => {
                  const mine = m.usuario === usuario && m.tipo === "cliente";
                  const isStaff = m.tipo === "staff";
                  return (
                    <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                      <span className="text-[10px] uppercase tracking-wider text-white/40">
                        {isStaff ? `Staff${m.usuario ? ` · ${m.usuario}` : ""}` : m.usuario}
                      </span>
                      <div className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${
                        mine ? "bg-[#FF3D8A] text-[#0E0A1A]" : isStaff ? "bg-[#8B5CF6]/90 text-white" : "bg-white/10 text-white"
                      }`}>
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
                  placeholder={online ? "Escribí un mensaje…" : "Sin internet"}
                  disabled={!online}
                  className="h-11 flex-1 rounded-full border border-white/15 bg-black/40 px-4 text-sm text-white placeholder-white/40 focus:border-[#FF3D8A] focus:outline-none"
                  maxLength={500}
                />
                <button type="submit" disabled={sending || !input.trim() || !online} aria-label="Enviar" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FF3D8A] text-[#0E0A1A] disabled:opacity-40">
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
