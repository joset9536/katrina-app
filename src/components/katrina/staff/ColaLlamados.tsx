import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Llamado = {
  id: string;
  mesa_id: string;
  cliente_nombre: string;
  timestamp: string;
  prioridad: number;
  status: string;
};

function elapsed(ts: string) {
  const m = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (m < 1) return "recién";
  return `${m} min`;
}

export function ColaLlamados({ staffNombre }: { staffNombre: string }) {
  const [items, setItems] = useState<Llamado[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("llamados")
        .select("*")
        .eq("status", "en_espera")
        .order("prioridad", { ascending: false })
        .order("timestamp", { ascending: true });
      setItems((data as Llamado[]) || []);
    };
    load();
    const ch = supabase
      .channel("cola-llamados")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "llamados" },
        () => load(),
      )
      .subscribe();
    const t = setInterval(() => setTick((x) => x + 1), 30000);
    return () => {
      supabase.removeChannel(ch);
      clearInterval(t);
    };
  }, []);

  const atender = async (l: Llamado) => {
    await supabase
      .from("llamados")
      .update({
        status: "atendido",
        staff_asignado: staffNombre,
        respondido_at: new Date().toISOString(),
      })
      .eq("id", l.id);
    await supabase.from("chat").insert({
      mesa_id: l.mesa_id,
      usuario: staffNombre,
      tipo: "staff",
      mensaje: `Hola ${l.cliente_nombre}, soy ${staffNombre}. ¿Qué necesitás?`,
    });
  };

  return (
    <section
      key={tick}
      className="rounded-xl border border-white/10 bg-black/40 p-4"
    >
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#FF3D8A]">
        Cola de llamadas ({items.length})
      </h2>
      {items.length === 0 ? (
        <p className="text-xs text-white/40">Sin llamados en espera.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((l) => {
            const urgente = l.prioridad === 1;
            const numero = l.mesa_id.replace("mesa-", "");
            return (
              <li
                key={l.id}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                  urgente
                    ? "border-red-500/70 bg-red-500/15 text-white"
                    : "border-white/10 bg-white/5 text-white/90"
                }`}
              >
                <div>
                  <p className="font-semibold">
                    {urgente ? "🔴 URGENTE · " : "⚪ "}Mesa {numero} — {l.cliente_nombre}
                  </p>
                  <p className="text-[11px] text-white/50">Esperando {elapsed(l.timestamp)}</p>
                </div>
                <button
                  onClick={() => atender(l)}
                  className="rounded-md bg-[#FF3D8A] px-3 py-1 text-xs font-semibold text-[#0E0A1A] hover:bg-[#ff5c9d]"
                >
                  Atender
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
