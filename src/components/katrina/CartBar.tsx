import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { useMesa } from "@/hooks/use-mesa";
import { useOnline } from "@/hooks/use-online";
import { cartLineLabel, formatPedidoText } from "@/lib/cart";
import { persistUser, readStoredUser, STORAGE_LLAMADO } from "@/lib/mesa";
import { submitPedido } from "@/lib/pedido";
import { openWhatsApp, whatsappPedidoUrl } from "@/lib/whatsapp";

export function CartBar() {
  const { numero, mesaId, hasValidMesa } = useMesa();
  const { lines, count, setQty, clear } = useCart(numero);
  const online = useOnline();
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState(() => readStoredUser());
  const [sending, setSending] = useState(false);

  if (!hasValidMesa || count === 0) return null;

  const enviar = async () => {
    if (!mesaId || sending) return;
    if (!online) {
      toast.error("Sin internet. El pedido queda en el celular hasta que vuelva la señal.");
      return;
    }
    const cliente = nombre.trim();
    if (!cliente) {
      toast.error("Poné tu nombre para que el mozo sepa quién pide.");
      return;
    }
    setSending(true);
    persistUser(cliente);
    const res = await submitPedido({ cliente, mesaId, lines });
    setSending(false);
    if (!res.ok) {
      toast.error("El salón no respondió. Te abro WhatsApp con el pedido.");
      openWhatsApp(
        whatsappPedidoUrl({
          mesa: numero,
          nombre: cliente,
          pedido: formatPedidoText(lines),
        }),
      );
      return;
    }
    if (res.llamadoId) localStorage.setItem(STORAGE_LLAMADO, res.llamadoId);
    toast.success("Pedido enviado. El mozo ya lo ve en la cola.");
    clear();
    setOpen(false);
    window.dispatchEvent(new CustomEvent("katrina:open-chat"));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-[5.5rem] right-4 z-50 flex h-14 min-w-14 items-center gap-2 rounded-full bg-[#FF3D8A] px-4 text-sm font-semibold text-[#0E0A1A] shadow-[0_0_24px_rgba(255,61,138,0.5)] active:scale-95 md:bottom-6"
      >
        <ShoppingBag size={18} />
        {count}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-3 md:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-[#FF3D8A]/40 bg-[#0E0A1A] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="border-b border-white/10 px-4 py-3">
              <p className="text-sm font-semibold text-[#FF3D8A]">Tu pedido · Mesa {numero}</p>
              <p className="text-[11px] text-white/50">Revisá cantidades y llamá al mozo.</p>
            </header>
            <ul className="max-h-[45vh] space-y-2 overflow-y-auto px-4 py-3">
              {lines.map((line) => (
                <li key={line.key} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{cartLineLabel(line)}</p>
                    {line.price && <p className="text-[11px] text-white/50">{line.price}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Quitar uno"
                      onClick={() => setQty(line.key, line.qty - 1)}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 active:scale-95"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-6 text-center font-semibold">{line.qty}</span>
                    <button
                      type="button"
                      aria-label="Agregar uno"
                      onClick={() => setQty(line.key, line.qty + 1)}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 active:scale-95"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t border-white/10 px-4 py-3">
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                maxLength={40}
                className="h-11 w-full rounded-md border border-white/15 bg-black/40 px-3 text-sm text-white placeholder-white/40 focus:border-[#FF3D8A] focus:outline-none"
              />
              <button
                type="button"
                disabled={sending || !online}
                onClick={enviar}
                className="flex h-12 w-full items-center justify-center rounded-md bg-[#FF3D8A] text-sm font-semibold text-[#0E0A1A] active:scale-[0.99] disabled:opacity-50"
              >
                {sending ? "Enviando…" : "Llamar al mozo con este pedido"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
