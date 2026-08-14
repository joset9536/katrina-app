import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { playCallBeep } from "@/lib/notify";
import { atenderLlamado, listarCola } from "@/lib/salon-bus";

type Llamado = {
  id: string;
  mesa_id: string;
  cliente_nombre: string;
  timestamp: string;
  prioridad: number;
  status: string;
  staff_asignado: string | null;
};

function elapsed(ts: string) {
  const m = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (m < 1) return "recién";
  return `${m} min`;
}

export function ColaLlamados({ staffNombre }: { staffNombre: string }) {
  const [items, setItems] = useState<Llamado[]>([]);
  const [tick, setTick] = useState(0);
  const [filter, setFilter] = useState<"todos" | "urgentes">("todos");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const seenRef = useRef<Set<string>>(new Set());
  const primed = useRef(false);

  useEffect(() => {
    const load = async () => {
      const res = await listarCola();
      const next = (res.items as Llamado[]) || [];
      if (!res.error) {
        if (primed.current) {
          const newcomers = next.filter((l) => !seenRef.current.has(l.id));
          if (newcomers.length) playCallBeep();
        }
        primed.current = true;
        seenRef.current = new Set(next.map((l) => l.id));
        setItems(next);
      }
      setLoading(false);
    };
    load();
    const poll = setInterval(load, 3000);
    const t = setInterval(() => setTick((x) => x + 1), 30000);
    return () => {
      clearInterval(poll);
      clearInterval(t);
    };
  }, []);

  const atender = async (l: Llamado) => {
    if (busyId) return;
    setBusyId(l.id);
    const res = await atenderLlamado({
      data: { id: l.id, staff: staffNombre, cliente: l.cliente_nombre, mesaId: l.mesa_id },
    });
    setBusyId(null);
    if (res.taken) {
      toast.error("Otro mozo ya tomó esa mesa.");
      return;
    }
    if (!res.ok) {
      toast.error(res.error || "No se pudo tomar el llamado. Probá de nuevo.");
      return;
    }
    toast.success(`Tomaste la mesa ${l.mesa_id.replace("mesa-", "")}`);
  };

  const visible = filter === "urgentes" ? items.filter((i) => i.prioridad === 1) : items;

  return (
    <section key={tick} className="rounded-xl border border-white/10 bg-black/40 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[#FF3D8A]">
          Cola de llamadas ({items.length})
        </h2>
        <div className="flex gap-1">
          {(["todos", "urgentes"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`h-11 rounded-full px-3 text-xs font-semibold active:scale-95 ${
                filter === f ? "bg-[#FF3D8A] text-[#0E0A1A]" : "bg-white/10 text-white/60"
              }`}
            >
              {f === "todos" ? "Todas" : "Urgentes"}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <p className="text-xs text-white/40">Cargando llamados…</p>
      ) : visible.length === 0 ? (
        <p className="text-xs text-white/40">
          {filter === "urgentes" ? "No hay urgentes." : "Sin llamados en espera."}
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((l) => {
            const urgente = l.prioridad === 1;
            const numero = l.mesa_id.replace("mesa-", "");
            return (
              <li
                key={l.id}
                className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-3 text-sm ${
                  urgente ? "border-red-500/70 bg-red-500/15 text-white" : "border-white/10 bg-white/5 text-white/90"
                }`}
              >
                <div className="min-w-0">
                  <p className="font-semibold">
                    {urgente ? "URGENTE · " : ""}Mesa {numero} — {l.cliente_nombre}
                  </p>
                  <p className="text-[11px] text-white/50">Esperando {elapsed(l.timestamp)}</p>
                </div>
                <button
                  type="button"
                  disabled={busyId === l.id}
                  onClick={() => atender(l)}
                  className="h-11 shrink-0 rounded-md bg-[#FF3D8A] px-4 text-xs font-semibold text-[#0E0A1A] active:scale-95 disabled:opacity-50"
                >
                  {busyId === l.id ? "Tomando…" : "Atender"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
