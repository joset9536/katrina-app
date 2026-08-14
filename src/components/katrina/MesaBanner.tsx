import { WifiOff } from "lucide-react";
import { useMesa } from "@/hooks/use-mesa";
import { useOnline } from "@/hooks/use-online";

export function MesaBanner() {
  const { query, hasValidMesa, numero, queryError } = useMesa();
  const online = useOnline();

  if (online && !queryError && !hasValidMesa) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-[60] flex flex-col gap-2 px-3 md:top-20">
      {!online && (
        <div className="pointer-events-auto mx-auto w-full max-w-xl rounded-xl border border-amber-400/40 bg-[#1a1204]/95 px-4 py-3 text-sm text-amber-100 shadow-lg backdrop-blur">
          <p className="flex items-center gap-2 font-semibold">
            <WifiOff size={16} /> Sin internet
          </p>
          <p className="mt-1 text-xs text-amber-100/80">
            La carta se puede mirar. No se puede llamar al mozo ni mandar el pedido hasta que vuelva la señal.
          </p>
        </div>
      )}
      {queryError && (
        <div className="pointer-events-auto mx-auto w-full max-w-xl rounded-xl border border-red-400/50 bg-[#2a0b14]/95 px-4 py-3 text-sm text-red-100 shadow-lg backdrop-blur">
          <p className="font-semibold">QR inválido</p>
          <p className="mt-1 text-xs text-red-100/80">{queryError}</p>
        </div>
      )}
      {online && !queryError && hasValidMesa && query.ok && (
        <div className="pointer-events-auto mx-auto w-full max-w-xl rounded-xl border border-[#FF3D8A]/40 bg-[#0E0A1A]/90 px-4 py-2 text-center text-sm text-white shadow-lg backdrop-blur">
          Mesa {numero} · Egüés 502. Agregá de la carta y llamá al mozo.
        </div>
      )}
    </div>
  );
}
