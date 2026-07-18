import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Mesa = { id: string; numero: number; estado: string };
type Llamado = { mesa_id: string; staff_asignado: string | null; status: string };

export function MapaMesasRef({ staffNombre }: { staffNombre: string }) {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [llamados, setLlamados] = useState<Llamado[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ data: m }, { data: l }] = await Promise.all([
        supabase.from("mesas").select("*").order("numero"),
        supabase.from("llamados").select("mesa_id,staff_asignado,status").in("status", ["en_espera", "atendido"]),
      ]);
      if (m) setMesas(m as Mesa[]);
      if (l) setLlamados(l as Llamado[]);
    };
    load();
    const ch = supabase
      .channel("mapa-mesas")
      .on("postgres_changes", { event: "*", schema: "public", table: "mesas" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "llamados" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const color = (mesa: Mesa) => {
    const ll = llamados.find((x) => x.mesa_id === mesa.id);
    if (ll?.status === "atendido") {
      if (ll.staff_asignado === staffNombre) return "bg-[#8B5CF6] text-white border-[#8B5CF6]";
      return "bg-white/10 text-white/50 border-white/10";
    }
    if (ll?.status === "en_espera") return "bg-[#FF3D8A] text-[#0E0A1A] border-[#FF3D8A]";
    if (mesa.estado === "ocupada") return "bg-red-500/70 text-white border-red-400";
    return "bg-emerald-500/70 text-white border-emerald-400";
  };

  return (
    <section className="rounded-xl border border-white/10 bg-black/40 p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/80">
        Mapa de mesas
      </h2>
      <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
        {mesas.map((m) => (
          <div
            key={m.id}
            title={m.estado}
            className={`aspect-square rounded-md border text-center text-xs font-bold flex items-center justify-center ${color(m)}`}
          >
            {m.numero}
          </div>
        ))}
      </div>
      <p className="mt-3 flex flex-wrap gap-3 text-[10px] text-white/50">
        <span>🟢 libre</span>
        <span>🔴 ocupada</span>
        <span>🩷 llamado en espera</span>
        <span>🟣 asignada a mí</span>
      </p>
    </section>
  );
}
