import { useEffect, useMemo, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { toast } from "sonner";
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
import { enviarChat, getLlamado, listarChat, listarCola } from "@/lib/salon-live";

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
    if (!open || !ready || !mesaKey) return;
    let live = true;
    const load = async () => {
      const res = await listarChat({ data: { mesaId: mesaKey } });
      if (!live) return;
      if (res.error) setLoadError("No se pudieron cargar los mensajes.");
      else setMessages(res.items);
    };
    load();
    const poll = window.setInterval(load, 3000);
    return () => {
      live = false;
      window.clearInterval(poll);
    };
  }, [open, ready, mesaKey]);

  useEffect(() => {
    if (!ready) return;
    let live = true;
    const load = async () => {
      const cola = await listarCola();
      if (!live) return;
      if (cola.error) setLoadError("No se pudo actualizar el estado del llamado.");
      else setQueue(cola.items);
      if (llamadoId) {
        const mine = await getLlamado({ data: { id: llamadoId } });
        if (live) setLlamado(mine.llamado);
      }
    };
    load();
    const poll = window.setInterval(load, 3000);
    return () => {
      live = false;
      window.clearInterval(poll);
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

  const sendText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return false;
    if (!online) {
      toast.error("Sin internet. El mensaje no salió.");
      return false;
    }
    setSending(true);
    setLoadError(null);
    const sent = await enviarChat({
      data: { mesaId: mesaKey, usuario, tipo: "cliente", mensaje: trimmed },
    });
    if (!sent.ok) {
      setSending(false);
      toast.error(sent.error || "No se pudo enviar. Probá de nuevo.");
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
    if (sending) return;
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
    setSending(true);
    setLoadError(null);
    const created = await ensureLlamado(u, parsed.mesaId);
    setSending(false);
    if (created.error || !created.llamado) {
      setReady(false);
      toast.error(created.error || "El llamado no llegó. Tocá de nuevo.");
      return;
    }
    setReady(true);
    setLlamadoId(created.llamado.id);
    localStorage.setItem(STORAGE_LLAMADO, created.llamado.id);
    setLlamado(created.llamado);
    toast.success("Llamado enviado. El mozo ya lo ve.");
  };

  const statusLabel = () => {
    if (!llamado) return null;
    if (llamado.status === "atendido")
      return `Te está atendiendo ${llamado.staff_asignado ?? "el mozo"}`;
    if (llamado.status === "resuelto") return "Listo. Escribí si necesitás algo más.";
    if (llamado.status === "abandonado") return "Se venció. Volvé a escribir para llamar.";
    if (position) return `El mozo ya ve tu mesa · lugar #${position}`;
    return "Llamado enviado";
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Llamar al mozo"
        className="fixed bottom-6 right-6 z-50 hidden h-12 items-center gap-2 rounded-full border border-[#FF3D8A]/60 bg-[#0E0A1A]/95 px-5 text-sm font-semibold text-[#FF3D8A] shadow-[0_0_24px_rgba(255,61,138,0.45)] transition active:scale-95 md:inline-flex"
      >
        {open ? <X size={18} /> : null}
        {open ? "Cerrar" : "Llamar mozo"}
      </button>

      {open && (
        <div className="fixed bottom-28 right-4 z-50 flex h-[65vh] max-h-[560px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-[#FF3D8A]/40 bg-[#0E0A1A]/95 shadow-[0_0_40px_rgba(255,61,138,0.28)] backdrop-blur-md md:bottom-24 md:right-6 md:h-[70vh]">
          <header className="border-b border-white/10 px-4 pt-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#FF3D8A]">Llamar al mozo</p>
              <button type="button" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center text-white/60" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            {ready && (
              <p className="pb-2 text-[10px] uppercase tracking-widest text-white/50">
                Mesa {numero ?? mesaInput} · {usuario}
              </p>
            )}
          </header>

          {!ready ? (
            <form onSubmit={saveIdentity} className="flex flex-1 flex-col justify-center gap-3 px-5">
              {queryError && <p className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">{queryError}</p>}
              <p className="text-sm text-white/80">Nombre y mesa.</p>
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
                placeholder="Mesa (1-30)"
                readOnly={hasValidMesa}
                className="h-11 rounded-md border border-white/15 bg-black/40 px-3 text-sm text-white placeholder-white/40 focus:border-[#FF3D8A] focus:outline-none read-only:opacity-70"
                maxLength={3}
                inputMode="numeric"
              />
              <button type="submit" disabled={sending} className="mt-1 h-12 rounded-md bg-[#FF3D8A] px-4 text-sm font-semibold text-[#0E0A1A] active:scale-[0.99] disabled:opacity-50">
                {sending ? "Llamando…" : "Llamar al mozo"}
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
                  <p className="mt-8 text-center text-xs text-white/40">
                    Ya te están viendo. Podés escribir un mensaje o mandar el pedido desde la carta.
                  </p>
                )}
                {messages.map((m) => {
                  const mine = m.usuario === usuario && m.tipo === "cliente";
                  const isStaff = m.tipo === "staff";
                  return (
                    <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                      <span className="text-[10px] uppercase tracking-wider text-white/40">
                        {isStaff ? `Mozo${m.usuario ? ` · ${m.usuario}` : ""}` : m.usuario}
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
                  placeholder={online ? "Escribile al mozo…" : "Sin internet"}
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
