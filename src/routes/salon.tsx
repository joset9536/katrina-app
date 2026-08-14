import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ColaLlamados } from "@/components/katrina/staff/ColaLlamados";
import { MisLlamados } from "@/components/katrina/staff/MisLlamados";
import { MapaMesasRef } from "@/components/katrina/staff/MapaMesasRef";
import { Comandas } from "@/components/katrina/staff/Comandas";
import { MesasActivas } from "@/components/katrina/owner/MesasActivas";
import { MenuEditor } from "@/components/katrina/owner/MenuEditor";
import { SalonResumen } from "@/components/katrina/SalonResumen";
import { KatrinaMark } from "@/components/katrina/KatrinaMark";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/salon")({
  head: () => ({
    meta: [
      { title: "Salón · Katrina" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SalonPage,
});

const STORAGE = "katrina_staff_nombre";
const STORAGE_TURNO = "katrina_staff_turno_id";

async function abrirTurno(nombre: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("staff_turnos")
      .insert({ staff_nombre: nombre, estado: "activo" })
      .select()
      .single();
    return data?.id ?? null;
  } catch {
    return null;
  }
}

async function cerrarTurno(turnoId: string | null) {
  if (!turnoId) return;
  await supabase.from("staff_turnos").update({ estado: "offline" }).eq("id", turnoId);
}

function SalonPage() {
  const [nombre, setNombre] = useState("");
  const [input, setInput] = useState("");
  const [turnoId, setTurnoId] = useState<string | null>(null);
  const [tab, setTab] = useState<"llamados" | "caja">("llamados");

  useEffect(() => {
    setNombre(localStorage.getItem(STORAGE) || "");
    setTurnoId(localStorage.getItem(STORAGE_TURNO));
  }, []);

  useEffect(() => {
    if (!turnoId) return;
    const tick = () =>
      supabase.from("staff_turnos").update({ estado: "activo" }).eq("id", turnoId);
    tick();
    const t = setInterval(tick, 2 * 60 * 1000);
    return () => clearInterval(t);
  }, [turnoId]);

  const start = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = input.trim();
    if (!v) return;
    localStorage.setItem(STORAGE, v);
    setNombre(v);
    const id = await abrirTurno(v);
    if (id) {
      localStorage.setItem(STORAGE_TURNO, id);
      setTurnoId(id);
    }
  };

  const stop = async () => {
    await cerrarTurno(turnoId);
    localStorage.removeItem(STORAGE);
    localStorage.removeItem(STORAGE_TURNO);
    setNombre("");
    setTurnoId(null);
  };

  if (!nombre) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0E0A1A] p-6 text-white">
        <form onSubmit={start} className="w-full max-w-sm space-y-4 rounded-2xl border border-[#FF3D8A]/40 bg-black/50 p-6">
          <KatrinaMark size={72} className="mx-auto" />
          <h1 className="text-center text-xl font-semibold text-[#FF3D8A]">Empezar turno</h1>
          <p className="text-center text-xs text-white/60">Tu nombre. Sin cuentas.</p>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ej: Romy"
            className="h-12 w-full rounded-md border border-white/15 bg-black/40 px-3 text-sm focus:border-[#FF3D8A] focus:outline-none"
            autoFocus
          />
          <button type="submit" className="h-12 w-full rounded-md bg-[#FF3D8A] text-sm font-semibold text-[#0E0A1A]">
            Entrar al salón
          </button>
          <Link to="/" className="block text-center text-xs text-white/40">
            Volver a la carta
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0A1A] text-white">
      <header className="border-b border-white/10 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <KatrinaMark size={40} />
            <div>
              <h1 className="text-lg font-semibold text-[#FF3D8A]">Salón Katrina</h1>
              <p className="text-[11px] text-white/50">Turno de {nombre}</p>
            </div>
          </div>
          <button type="button" onClick={stop} className="h-11 rounded-md px-3 text-xs text-white/60">
            Cerrar turno
          </button>
        </div>
        <div className="mx-auto mt-3 flex max-w-6xl gap-2">
          <button
            type="button"
            onClick={() => setTab("llamados")}
            className={`h-11 flex-1 rounded-full text-sm font-semibold ${
              tab === "llamados" ? "bg-[#FF3D8A] text-[#0E0A1A]" : "bg-white/10"
            }`}
          >
            Llamados
          </button>
          <button
            type="button"
            onClick={() => setTab("caja")}
            className={`h-11 flex-1 rounded-full text-sm font-semibold ${
              tab === "caja" ? "bg-[#E8B923] text-[#0E0A1A]" : "bg-white/10"
            }`}
          >
            Caja
          </button>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-4 p-4 md:p-6">
        {tab === "llamados" ? (
          <>
            <p className="text-sm text-white/70">Rosa = te llaman. Atendé.</p>
            <ColaLlamados staffNombre={nombre} />
            <Comandas />
            <MisLlamados staffNombre={nombre} />
            <MapaMesasRef staffNombre={nombre} />
          </>
        ) : (
          <>
            <p className="text-sm text-white/70">Cerrar mesa cuando se van.</p>
            <SalonResumen />
            <MesasActivas />
            <MenuEditor />
          </>
        )}
      </main>
      <Toaster />
    </div>
  );
}
