import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Metrics = {
  mesasOcupadas: number;
  mesasTotal: number;
  colaTotal: number;
  urgentes: number;
  staffActivo: number;
  avgRespuestaMin: number | null;
  resueltosHoy: number;
};

export function SalonResumen() {
  const [m, setM] = useState<Metrics | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
      const startDay = new Date();
      startDay.setHours(0, 0, 0, 0);
      const staffCutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const [mesas, cola, staff, resueltos] = await Promise.all([
        supabase.from("mesas").select("estado"),
        supabase.from("llamados").select("prioridad,status").eq("status", "en_espera"),
        supabase.from("staff_turnos").select("estado").eq("estado", "activo").gte("updated_at", staffCutoff),
        supabase.from("llamados").select("timestamp,respondido_at,status").gte("timestamp", startDay.toISOString()),
      ]);
      const mesasArr = (mesas.data || []) as { estado: string }[];
      const colaArr = (cola.data || []) as { prioridad: number }[];
      const resArr = (resueltos.data || []) as {
        timestamp: string;
        respondido_at: string | null;
        status: string;
      }[];
      const tiempos = resArr
        .filter((r) => r.respondido_at)
        .map((r) => (new Date(r.respondido_at as string).getTime() - new Date(r.timestamp).getTime()) / 60000);
      setM({
        mesasOcupadas: mesasArr.filter((x) => x.estado === "ocupada").length,
        mesasTotal: mesasArr.length,
        colaTotal: colaArr.length,
        urgentes: colaArr.filter((x) => x.prioridad === 1).length,
        staffActivo: (staff.data || []).length,
        avgRespuestaMin: tiempos.length
          ? Math.round((tiempos.reduce((a, b) => a + b, 0) / tiempos.length) * 10) / 10
          : null,
        resueltosHoy: resArr.filter((r) => r.status === "resuelto").length,
      });
      } catch {
        setM({
          mesasOcupadas: 0,
          mesasTotal: 0,
          colaTotal: 0,
          urgentes: 0,
          staffActivo: 0,
          avgRespuestaMin: null,
          resueltosHoy: 0,
        });
      }
    };
    load();
    const ch = supabase
      .channel("salon-metrics")
      .on("postgres_changes", { event: "*", schema: "public", table: "llamados" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "mesas" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "staff_turnos" }, () => load())
      .subscribe();
    const t = setInterval(load, 60000);
    return () => {
      supabase.removeChannel(ch);
      clearInterval(t);
    };
  }, []);

  const cards: { label: string; value: string; accent: string }[] = m
    ? [
        { label: "Mesas ocupadas", value: `${m.mesasOcupadas}/${m.mesasTotal}`, accent: "text-[#FF3D8A]" },
        {
          label: "Llamados en cola",
          value: `${m.colaTotal}${m.urgentes ? ` (${m.urgentes} urgente${m.urgentes > 1 ? "s" : ""})` : ""}`,
          accent: m.urgentes ? "text-red-400" : "text-white",
        },
        { label: "En el salón ahora", value: `${m.staffActivo}`, accent: "text-[#8B5CF6]" },
        {
          label: "Respuesta promedio",
          value: m.avgRespuestaMin != null ? `${m.avgRespuestaMin} min` : "—",
          accent: "text-[#E8B923]",
        },
        { label: "Atendidos hoy", value: `${m.resueltosHoy}`, accent: "text-emerald-400" },
      ]
    : [];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {!m ? (
        <p className="text-sm text-white/50">Cargando el salón…</p>
      ) : (
        cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-white/10 bg-black/40 p-5">
            <p className="text-[10px] uppercase tracking-widest text-white/50">{c.label}</p>
            <p className={`mt-2 text-3xl font-bold ${c.accent}`}>{c.value}</p>
          </div>
        ))
      )}
    </div>
  );
}
