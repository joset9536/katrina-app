import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ColaLlamados } from "@/components/katrina/staff/ColaLlamados";
import { MisLlamados } from "@/components/katrina/staff/MisLlamados";
import { MapaMesasRef } from "@/components/katrina/staff/MapaMesasRef";
import { Comandas } from "@/components/katrina/staff/Comandas";
import { MesasActivas } from "@/components/katrina/owner/MesasActivas";
import { MenuEditor } from "@/components/katrina/owner/MenuEditor";
import { SalonResumen } from "@/components/katrina/SalonResumen";
import { EmpleadosPanel } from "@/components/katrina/EmpleadosPanel";
import { ConversacionesPanel } from "@/components/katrina/ConversacionesPanel";
import { KatrinaMark } from "@/components/katrina/KatrinaMark";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Wallpaper } from "@/components/katrina/Wallpaper";
import {
  clearSesion,
  GERENTE_NOMBRE,
  entrarConClave,
  readSesion,
  writeSesion,
  type SalonSesion,
} from "@/lib/salon-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/salon")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión · Katrina" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SalonPage,
});

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
  try {
    await supabase.from("staff_turnos").update({ estado: "offline" }).eq("id", turnoId);
  } catch {
    /* ignore */
  }
}

function SalonPage() {
  const [sesion, setSesion] = useState<SalonSesion | null>(null);
  const [tab, setTab] = useState<"mozo" | "gerencia">("mozo");
  const [turnoId, setTurnoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState(GERENTE_NOMBRE);
  const [clave, setClave] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const existing = readSesion();
    if (existing && existing.rol === "gerente" && existing.nombre.toLowerCase() !== GERENTE_NOMBRE.toLowerCase()) {
      clearSesion();
      setNombre(GERENTE_NOMBRE);
      return;
    }
    if (existing) {
      const still =
        existing.nombre.toLowerCase() === GERENTE_NOMBRE.toLowerCase()
          ? { ...existing, nombre: GERENTE_NOMBRE, rol: "gerente" as const }
          : existing;
      writeSesion(still);
      setSesion(still);
      setTurnoId(localStorage.getItem(STORAGE_TURNO));
    }
  }, []);

  useEffect(() => {
    if (!turnoId) return;
    const tick = () => supabase.from("staff_turnos").update({ estado: "activo" }).eq("id", turnoId);
    tick();
    const t = setInterval(tick, 2 * 60 * 1000);
    return () => clearInterval(t);
  }, [turnoId]);

  const afterLogin = (s: SalonSesion) => {
    writeSesion(s);
    setSesion(s);
    setTab(s.rol === "gerente" ? "gerencia" : "mozo");
    void abrirTurno(s.nombre).then((id) => {
      if (!id) return;
      localStorage.setItem(STORAGE_TURNO, id);
      setTurnoId(id);
    });
  };

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await entrarConClave(nombre, clave);
      if (res.error || !res.sesion) {
        toast.error(res.error || "Clave incorrecta.");
        return;
      }
      afterLogin(res.sesion);
    } catch {
      toast.error("No se pudo entrar. Tocá de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  const salir = async () => {
    await cerrarTurno(turnoId);
    clearSesion();
    setSesion(null);
    setNombre(GERENTE_NOMBRE);
    setClave("");
    setTurnoId(null);
  };

  if (!sesion) {
    return (
      <div className="relative flex min-h-screen items-center justify-center p-6 text-white">
        <Wallpaper />
        <div className="katrina-frame relative z-10 w-full max-w-sm space-y-4 rounded-2xl border border-[#C4A35A]/35 bg-[#12080e]/80 p-6 backdrop-blur-sm">
          <KatrinaMark size={72} className="mx-auto" />
          <h1 className="text-center text-xl font-semibold text-[#C4A35A]">Iniciar sesión</h1>
          <form onSubmit={entrar} className="space-y-3">
            <p className="text-center text-xs text-white/60">
              Gerente: Brenda. Los mozos, el nombre y la clave que les cargó ella.
            </p>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Brenda"
              className="h-12 w-full rounded-md border border-white/15 bg-black/40 px-3 text-sm"
              autoFocus
            />
            <input
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="Clave"
              className="h-12 w-full rounded-md border border-white/15 bg-black/40 px-3 text-sm"
            />
            <button type="submit" disabled={busy} className="h-12 w-full rounded-md bg-[#FF3D8A] text-sm font-semibold text-[#12080e] disabled:opacity-50">
              {busy ? "Entrando…" : "Entrar"}
            </button>
          </form>
          <Link to="/" className="block text-center text-xs text-white/40">
            Volver a la carta
          </Link>
        </div>
        <Toaster />
      </div>
    );
  }

  const esGerente = sesion.rol === "gerente";

  return (
    <div className="relative min-h-screen text-white">
      <Wallpaper />
      <header className="relative z-10 border-b border-[#C4A35A]/20 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <KatrinaMark size={40} />
            <div>
              <h1 className="text-lg font-semibold text-[#C4A35A]">Salón Katrina</h1>
              <p className="text-[11px] text-white/50">
                {sesion.nombre} · {esGerente ? "gerente" : "mozo"}
              </p>
            </div>
          </div>
          <button type="button" onClick={salir} className="h-11 rounded-md bg-white/10 px-4 text-sm font-semibold">
            Salir
          </button>
        </div>
        <div className="mx-auto mt-3 flex max-w-6xl gap-2">
          <button
            type="button"
            onClick={() => setTab("mozo")}
            className={`h-11 flex-1 rounded-full text-sm font-semibold ${
              tab === "mozo" ? "bg-[#FF3D8A] text-[#12080e]" : "bg-white/10"
            }`}
          >
            Mozo
          </button>
          {esGerente && (
            <button
              type="button"
              onClick={() => setTab("gerencia")}
              className={`h-11 flex-1 rounded-full text-sm font-semibold ${
                tab === "gerencia" ? "bg-[#C4A35A] text-[#12080e]" : "bg-white/10"
              }`}
            >
              Gerencia
            </button>
          )}
        </div>
      </header>
      <main className="relative z-10 mx-auto grid max-w-6xl gap-4 p-4 md:p-6">
        {tab === "mozo" ? (
          <>
            <p className="text-sm text-white/70">
              El cliente escanea el QR, llama, aparece en rosa. Atendé. Abajo está lo que pidieron.
            </p>
            <ColaLlamados staffNombre={sesion.nombre} />
            <Comandas />
            <MisLlamados staffNombre={sesion.nombre} />
            <MapaMesasRef staffNombre={sesion.nombre} />
          </>
        ) : (
          <>
            <p className="text-sm text-white/70">
              Empleados, lo que se habló con las mesas, cerrar mesa cuando se van. Un solo lugar.
            </p>
            <EmpleadosPanel />
            <ConversacionesPanel />
            <SalonResumen />
            <a
              href="/qr/imprimir.html"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-[#12080e]"
            >
              Imprimir QR de mesas
            </a>
            <MesasActivas />
            <MenuEditor />
          </>
        )}
      </main>
      <Toaster />
    </div>
  );
}
