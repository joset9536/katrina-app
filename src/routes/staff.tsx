import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ColaLlamados } from "@/components/katrina/staff/ColaLlamados";
import { MisLlamados } from "@/components/katrina/staff/MisLlamados";
import { MapaMesasRef } from "@/components/katrina/staff/MapaMesasRef";
import { Comandas } from "@/components/katrina/staff/Comandas";
import { PinGate } from "@/components/katrina/PinGate";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

const STAFF_PIN = import.meta.env.VITE_STAFF_PIN || process.env.STAFF_PIN || "1234";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Staff · Katrina" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <PinGate title="Acceso staff" pin={STAFF_PIN} storageKey="katrina_staff_pin_ok">
      <StaffPage />
    </PinGate>
  ),
});

const STORAGE = "katrina_staff_nombre";
const STORAGE_TURNO = "katrina_staff_turno_id";

async function abrirTurno(nombre: string): Promise<string | null> {
  const { data } = await supabase
    .from("staff_turnos")
    .insert({ staff_nombre: nombre, estado: "activo" })
    .select()
    .single();
  return data?.id ?? null;
}

async function cerrarTurno(turnoId: string | null) {
  if (!turnoId) return;
  await supabase.from("staff_turnos").update({ estado: "offline" }).eq("id", turnoId);
}

function StaffPage() {
  const [nombre, setNombre] = useState("");
  const [input, setInput] = useState("");
  const [turnoId, setTurnoId] = useState<string | null>(null);

  useEffect(() => {
    const n = localStorage.getItem(STORAGE) || "";
    setNombre(n);
    setTurnoId(localStorage.getItem(STORAGE_TURNO));
  }, []);

  // Heartbeat: mientras el panel esta abierto, marcar el turno como activo
  // cada 2 min. Asi el dashboard de la dueña no cuenta staff "fantasma" que
  // cerro el navegador sin apretar "Cerrar turno".
  useEffect(() => {
    if (!turnoId) return;
    const tick = () =>
      supabase.from("staff_turnos").update({ estado: "activo" }).eq("id", turnoId);
    tick();
    const t = setInterval(tick, 2 * 60 * 1000);
    return () => clearInterval(t);
  }, [turnoId]);

  if (!nombre) {
    return (
      <div className="min-h-screen bg-[#0E0A1A] text-white flex items-center justify-center p-6">
        <form
          onSubmit={async (e) => {
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
          }}
          className="w-full max-w-sm space-y-3 rounded-2xl border border-[#FF3D8A]/40 bg-black/50 p-6"
        >
          <h1 className="text-xl font-semibold text-[#FF3D8A]">Ingresar como staff</h1>
          <p className="text-xs text-white/60">Escribí tu nombre para empezar tu turno.</p>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tu nombre"
            className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm focus:border-[#FF3D8A] focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-[#FF3D8A] py-2 text-sm font-semibold text-[#0E0A1A]"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0A1A] text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-[#FF3D8A]">Panel Staff</h1>
          <p className="text-[11px] text-white/50">Turno de {nombre}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              await cerrarTurno(turnoId);
              localStorage.removeItem(STORAGE);
              localStorage.removeItem(STORAGE_TURNO);
              setNombre("");
              setTurnoId(null);
            }}
            className="h-11 rounded-md px-3 text-xs text-white/60 hover:text-white"
          >
            Cerrar turno
          </button>
          <button
            type="button"
            onClick={async () => {
              await cerrarTurno(turnoId);
              localStorage.removeItem(STORAGE);
              localStorage.removeItem(STORAGE_TURNO);
              localStorage.removeItem("katrina_staff_pin_ok");
              window.location.reload();
            }}
            className="h-11 rounded-md px-3 text-xs text-white/60 hover:text-white"
          >
            Salir
          </button>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-4 p-4 md:p-6">
        <section className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
          <p className="font-semibold text-white">Cómo usarlo (tipo Fudo, simple)</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-relaxed">
            <li>Cuando suena o aparece rosa, alguien llamó. Tocá <strong>Atender</strong>.</li>
            <li>Mirá la <strong>comanda</strong> (qué pidieron) y llevá eso a la mesa.</li>
            <li>Si te escriben, respondé en <strong>Mis mesas</strong>.</li>
            <li><strong>Listo</strong> cierra el llamado. La mesa sigue ocupada hasta que caja la cierre.</li>
          </ol>
        </section>
        <ColaLlamados staffNombre={nombre} />
        <Comandas />
        <MisLlamados staffNombre={nombre} />
        <MapaMesasRef staffNombre={nombre} />
      </main>
      <Toaster />
    </div>
  );
}
