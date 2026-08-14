import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Mesa = { id: string; numero: number; estado: string; updated_at: string };
type Llamado = {
  id: string;
  mesa_id: string;
  cliente_nombre: string;
  status: string;
  timestamp: string;
  staff_asignado: string | null;
};

export function MesasActivas() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [llamados, setLlamados] = useState<Llamado[]>([]);
  const [history, setHistory] = useState<Llamado[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const startDay = new Date();
    startDay.setHours(0, 0, 0, 0);
    const [m, l, h] = await Promise.all([
      supabase.from("mesas").select("*").order("numero"),
      supabase.from("llamados").select("*").in("status", ["en_espera", "atendido"]),
      supabase.from("llamados").select("*").gte("timestamp", startDay.toISOString()).order("timestamp", { ascending: false }).limit(40),
    ]);
    if (m.data) setMesas(m.data as Mesa[]);
    if (l.data) setLlamados(l.data as Llamado[]);
    if (h.data) setHistory(h.data as Llamado[]);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("owner-mesas")
      .on("postgres_changes", { event: "*", schema: "public", table: "mesas" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "llamados" }, () => load())
      .subscribe();
    const poll = setInterval(load, 10000);
    return () => {
      supabase.removeChannel(ch);
      clearInterval(poll);
    };
  }, []);

  const activas = mesas.filter((m) => m.estado === "ocupada" || llamados.some((l) => l.mesa_id === m.id));

  const cerrarMesa = async (mesa: Mesa) => {
    if (busy) return;
    const ok = window.confirm(`¿Cerrar la mesa ${mesa.numero}? Se marcan libres los llamados abiertos.`);
    if (!ok) return;
    setBusy(mesa.id);
    const abiertos = llamados.filter((l) => l.mesa_id === mesa.id);
    await Promise.all(
      abiertos.map((l) => supabase.from("llamados").update({ status: "resuelto" }).eq("id", l.id)),
    );
    await supabase.from("pedidos").update({ status: "entregado" }).eq("mesa_id", mesa.id).in("status", ["pendiente", "visto"]);
    const { error } = await supabase.from("mesas").update({ estado: "libre" }).eq("id", mesa.id);
    setBusy(null);
    if (error) {
      toast.error("No se pudo cerrar la mesa.");
      return;
    }
    toast.success(`Mesa ${mesa.numero} cerrada.`);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-black/40 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#FF3D8A]">
          Mesas activas ({activas.length})
        </h2>
        {activas.length === 0 ? (
          <p className="text-xs text-white/40">No hay mesas ocupadas ahora.</p>
        ) : (
          <ul className="space-y-2">
            {activas.map((mesa) => {
              const ll = llamados.find((l) => l.mesa_id === mesa.id);
              return (
                <li key={mesa.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-3">
                  <div>
                    <p className="font-semibold">Mesa {mesa.numero}</p>
                    <p className="text-[11px] text-white/50">
                      {ll ? `${ll.status.replace("_", " ")} · ${ll.cliente_nombre}` : "Ocupada, sin llamado abierto"}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busy === mesa.id}
                    onClick={() => cerrarMesa(mesa)}
                    className="h-11 rounded-md bg-white px-4 text-xs font-semibold text-[#0E0A1A] active:scale-95 disabled:opacity-50"
                  >
                    {busy === mesa.id ? "Cerrando…" : "Cerrar mesa"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-black/40 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/80">Historial de hoy</h2>
        {history.length === 0 ? (
          <p className="text-xs text-white/40">Todavía no hay llamados hoy.</p>
        ) : (
          <ul className="max-h-80 space-y-2 overflow-y-auto text-sm">
            {history.map((l) => (
              <li key={l.id} className="rounded-lg bg-white/5 px-3 py-2">
                <span className="text-white/90">Mesa {l.mesa_id.replace("mesa-", "")}</span>
                <span className="text-white/40"> · {l.cliente_nombre} · {l.status}</span>
                {l.staff_asignado && <span className="text-white/40"> · {l.staff_asignado}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
