import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchPedidosMesa, parsePedidoFromChat, isPedidoMessage } from "@/lib/pedido";
import { cartLineLabel, type CartLine } from "@/lib/cart";

type Mesa = { id: string; numero: number; estado: string };
type Llamado = { mesa_id: string; staff_asignado: string | null; status: string };

export function MapaMesasRef({ staffNombre }: { staffNombre: string }) {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [llamados, setLlamados] = useState<Llamado[]>([]);
  const [filter, setFilter] = useState<"todas" | "ocupadas" | "llamadas" | "mias">("todas");
  const [open, setOpen] = useState<Mesa | null>(null);
  const [pedido, setPedido] = useState<CartLine[]>([]);
  const [loadingPedido, setLoadingPedido] = useState(false);

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
    const poll = setInterval(load, 8000);
    return () => {
      supabase.removeChannel(ch);
      clearInterval(poll);
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

  const visible = useMemo(() => {
    return mesas.filter((mesa) => {
      const ll = llamados.find((x) => x.mesa_id === mesa.id);
      if (filter === "ocupadas") return mesa.estado === "ocupada" || Boolean(ll);
      if (filter === "llamadas") return ll?.status === "en_espera";
      if (filter === "mias") return ll?.staff_asignado === staffNombre && ll.status === "atendido";
      return true;
    });
  }, [mesas, llamados, filter, staffNombre]);

  const openMesa = async (mesa: Mesa) => {
    setOpen(mesa);
    setLoadingPedido(true);
    const rows = await fetchPedidosMesa(mesa.id);
    if (rows.length) {
      setPedido(rows.filter((r) => r.status !== "cancelado").flatMap((r) => r.items));
      setLoadingPedido(false);
      return;
    }
    const { data } = await supabase
      .from("chat")
      .select("mensaje")
      .eq("mesa_id", mesa.id)
      .order("created_at", { ascending: true })
      .limit(100);
    const lines = ((data || []) as { mensaje: string }[])
      .filter((m) => isPedidoMessage(m.mensaje))
      .flatMap((m) => parsePedidoFromChat(m.mensaje));
    setPedido(lines);
    setLoadingPedido(false);
  };

  return (
    <section className="rounded-xl border border-white/10 bg-black/40 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/80">Mapa de mesas</h2>
        <div className="flex flex-wrap gap-1">
          {([
            ["todas", "Todas"],
            ["ocupadas", "Ocupadas"],
            ["llamadas", "Llamadas"],
            ["mias", "Mías"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`h-11 rounded-full px-3 text-[11px] font-semibold active:scale-95 ${
                filter === id ? "bg-white text-[#0E0A1A]" : "bg-white/10 text-white/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
        {visible.map((m) => (
          <button
            key={m.id}
            type="button"
            title={m.estado}
            onClick={() => openMesa(m)}
            className={`aspect-square min-h-11 rounded-md border text-center text-xs font-bold active:scale-95 ${color(m)}`}
          >
            {m.numero}
          </button>
        ))}
      </div>
      {visible.length === 0 && <p className="mt-3 text-xs text-white/40">Ninguna mesa en este filtro.</p>}
      <p className="mt-3 flex flex-wrap gap-3 text-[10px] text-white/50">
        <span>Verde libre</span>
        <span>Rojo ocupada</span>
        <span>Rosa llamado</span>
        <span>Violeta asignada a mí</span>
      </p>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 md:items-center" onClick={() => setOpen(null)}>
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0E0A1A] p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-[#FF3D8A]">Mesa {open.numero}</p>
              <button type="button" onClick={() => setOpen(null)} className="h-11 px-3 text-white/60">Cerrar</button>
            </div>
            <p className="mt-1 text-xs text-white/50">Estado: {open.estado}</p>
            <div className="mt-3 space-y-2 text-sm">
              {loadingPedido ? (
                <p className="text-white/40">Cargando pedido…</p>
              ) : pedido.length === 0 ? (
                <p className="text-white/40">Sin pedido cargado todavía.</p>
              ) : (
                pedido.map((line, i) => (
                  <p key={`${line.key}-${i}`} className="rounded-lg bg-white/5 px-3 py-2">
                    {line.qty}× {cartLineLabel(line)} {line.price ? `· ${line.price}` : ""}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
