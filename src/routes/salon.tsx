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
import {
  clearSesion,
  countLocalUsuarios,
  crearGerente,
  elegirClave,
  entrarConClave,
  loginNombre,
  readSesion,
  writeSesion,
  type SalonSesion,
  type SalonUsuario,
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
  const [boot, setBoot] = useState<"vacio" | "login">("vacio");
  const [tab, setTab] = useState<"mozo" | "gerencia">("mozo");
  const [turnoId, setTurnoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [clave, setClave] = useState("");
  const [pendiente, setPendiente] = useState<SalonUsuario | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const existing = readSesion();
    if (existing) {
      setSesion(existing);
      setTurnoId(localStorage.getItem(STORAGE_TURNO));
      setBoot("login");
      return;
    }
    setBoot(countLocalUsuarios() > 0 ? "login" : "vacio");
  }, []);

  useEffect(() => {
    if (!turnoId) return;
    const tick = () => supabase.from("staff_turnos").update({ estado: "activo" }).eq("id", turnoId);
    tick();
    const t = setInterval(tick, 2 * 60 * 1000);
    return () => clearInterval(t);
  }, [turnoId]);

  const afterLogin = async (s: SalonSesion) => {
    writeSesion(s);
    setSesion(s);
    const id = await abrirTurno(s.nombre);
    if (id) {
      localStorage.setItem(STORAGE_TURNO, id);
      setTurnoId(id);
    }
    setTab(s.rol === "gerente" ? "gerencia" : "mozo");
  };

  const crearPrimero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const res = await crearGerente(nombre, clave);
    setBusy(false);
    if (res.error || !res.sesion) {
      toast.error(res.error || "No se pudo crear.");
      return;
    }
    toast.success("Listo. Este es el usuario del gerente.");
    afterLogin(res.sesion);
  };

  const seguirNombre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const res = await loginNombre(nombre);
    setBusy(false);
    if (res.error || !res.usuario) {
      toast.error(
        res.error === "NO_TABLE"
          ? "Falta crear la tabla de usuarios en Supabase."
          : res.error || "No se pudo entrar.",
      );
      return;
    }
    if (!res.usuario.tiene_clave) {
      setPendiente(res.usuario);
      setClave("");
      return;
    }
    setPendiente(res.usuario);
    setClave("");
  };

  const confirmarClave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendiente || busy) return;
    setBusy(true);
    const res = pendiente.tiene_clave
      ? await entrarConClave(pendiente.nombre, clave)
      : await elegirClave(pendiente.nombre, clave);
    setBusy(false);
    if (res.error || !res.sesion) {
      toast.error(res.error || "No se pudo entrar.");
      return;
    }
    afterLogin(res.sesion);
  };

  const salir = async () => {
    await cerrarTurno(turnoId);
    clearSesion();
    setSesion(null);
    setPendiente(null);
    setNombre("");
    setClave("");
    setTurnoId(null);
    setBoot("login");
  };

  if (!sesion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#12080e] p-6 text-white">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-[#C4A35A]/30 bg-black/50 p-6">
          <KatrinaMark size={72} className="mx-auto" />
          <h1 className="text-center text-xl font-semibold text-[#C4A35A]">Iniciar sesión</h1>

          {boot === "vacio" ? (
            <form onSubmit={crearPrimero} className="space-y-3">
              <p className="text-center text-xs text-white/60">
                Primera vez. Este usuario es el gerente. Después él da de alta a los mozos.
              </p>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre (ej: José)"
                className="h-12 w-full rounded-md border border-white/15 bg-black/40 px-3 text-sm"
                autoFocus
              />
              <input
                type="password"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                placeholder="Elegí tu clave"
                className="h-12 w-full rounded-md border border-white/15 bg-black/40 px-3 text-sm"
              />
              <button type="submit" disabled={busy} className="h-12 w-full rounded-md bg-[#C4A35A] text-sm font-semibold text-[#12080e] disabled:opacity-50">
                {busy ? "Creando…" : "Crear gerente"}
              </button>
            </form>
          ) : pendiente ? (
            <form onSubmit={confirmarClave} className="space-y-3">
              <p className="text-center text-xs text-white/60">
                {pendiente.tiene_clave
                  ? `Hola ${pendiente.nombre}. Tu clave.`
                  : `Hola ${pendiente.nombre}. Primera vez: elegí la clave que quieras.`}
              </p>
              <input
                type="password"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                placeholder="Clave"
                className="h-12 w-full rounded-md border border-white/15 bg-black/40 px-3 text-sm"
                autoFocus
              />
              <button type="submit" disabled={busy} className="h-12 w-full rounded-md bg-[#FF3D8A] text-sm font-semibold text-[#12080e] disabled:opacity-50">
                {busy ? "Entrando…" : "Entrar"}
              </button>
              <button type="button" onClick={() => setPendiente(null)} className="block w-full text-center text-xs text-white/40">
                Otro nombre
              </button>
            </form>
          ) : (
            <form onSubmit={seguirNombre} className="space-y-3">
              <p className="text-center text-xs text-white/60">Tu nombre. El gerente te tiene que haber cargado.</p>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Romy"
                className="h-12 w-full rounded-md border border-white/15 bg-black/40 px-3 text-sm"
                autoFocus
              />
              <button type="submit" disabled={busy} className="h-12 w-full rounded-md bg-[#FF3D8A] text-sm font-semibold text-[#12080e] disabled:opacity-50">
                {busy ? "…" : "Continuar"}
              </button>
            </form>
          )}

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
    <div className="min-h-screen bg-[#12080e] text-white">
      <header className="border-b border-white/10 px-4 py-4 sm:px-6">
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
      <main className="mx-auto grid max-w-6xl gap-4 p-4 md:p-6">
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
