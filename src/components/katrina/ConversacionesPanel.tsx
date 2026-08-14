import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type ChatRow = {
  id: string;
  mesa_id: string;
  usuario: string;
  tipo: string;
  mensaje: string;
  created_at: string;
};

export function ConversacionesPanel() {
  const [rows, setRows] = useState<ChatRow[]>([]);
  const [mesa, setMesa] = useState("todas");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const { data, error: err } = await supabase
          .from("chat")
          .select("id,mesa_id,usuario,tipo,mensaje,created_at")
          .gte("created_at", start.toISOString())
          .order("created_at", { ascending: true })
          .limit(300);
        if (err) setError("No se pudieron cargar los chats.");
        else setRows((data as ChatRow[]) || []);
      } catch {
        setError("El salón no está conectado.");
      }
    };
    load();
    const ch = supabase
      .channel("gerente-chats")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const mesas = useMemo(() => {
    const set = new Set(rows.map((r) => r.mesa_id));
    return Array.from(set);
  }, [rows]);

  const visible = mesa === "todas" ? rows : rows.filter((r) => r.mesa_id === mesa);

  return (
    <section className="rounded-xl border border-white/10 bg-black/40 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-[#FF3D8A]">Qué se habló hoy</h2>
      <p className="mt-1 text-xs text-white/50">Lo que escriben las mesas y lo que responden los mozos.</p>
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setMesa("todas")}
          className={`h-9 rounded-full px-3 text-xs ${mesa === "todas" ? "bg-[#FF3D8A] text-[#0E0A1A]" : "bg-white/10"}`}
        >
          Todas
        </button>
        {mesas.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMesa(m)}
            className={`h-9 rounded-full px-3 text-xs ${mesa === m ? "bg-[#FF3D8A] text-[#0E0A1A]" : "bg-white/10"}`}
          >
            Mesa {m.replace("mesa-", "")}
          </button>
        ))}
      </div>
      <ul className="mt-3 max-h-96 space-y-2 overflow-y-auto">
        {visible.length === 0 && <p className="text-xs text-white/40">Hoy no hay mensajes.</p>}
        {visible.map((r) => (
          <li key={r.id} className="rounded-lg bg-white/5 px-3 py-2 text-sm">
            <p className="text-[11px] uppercase tracking-wider text-white/40">
              Mesa {r.mesa_id.replace("mesa-", "")} · {r.tipo === "staff" ? `Mozo ${r.usuario}` : r.usuario}
            </p>
            <p className="whitespace-pre-wrap text-white/90">{r.mensaje}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
