import { useEffect, useState } from "react";
import { toast } from "sonner";
import { borrarEmpleado, crearEmpleado, listUsuarios, resetearClave, type SalonUsuario } from "@/lib/salon-auth";

export function EmpleadosPanel() {
  const [rows, setRows] = useState<SalonUsuario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [clave, setClave] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetId, setResetId] = useState<string | null>(null);
  const [resetClaveVal, setResetClaveVal] = useState("");

  const load = async () => {
    const res = await listUsuarios();
    setRows(res.items);
    setError(res.error);
  };

  useEffect(() => {
    load();
  }, []);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const res = await crearEmpleado(nombre, clave);
    setBusy(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success(`${nombre.trim()} ya puede entrar con esa clave, en cualquier celular.`);
    setNombre("");
    setClave("");
    load();
  };

  const baja = async (u: SalonUsuario) => {
    if (u.rol === "gerente") return;
    if (!window.confirm(`¿Dar de baja a ${u.nombre}?`)) return;
    const res = await borrarEmpleado(u.id);
    if (res.error) toast.error(res.error);
    else {
      toast.success(`${u.nombre} ya no entra.`);
      load();
    }
  };

  const reset = async (u: SalonUsuario) => {
    if (!resetClaveVal.trim()) {
      toast.error("Escribí la clave nueva.");
      return;
    }
    const res = await resetearClave(u.id, resetClaveVal);
    if (res.error) toast.error(res.error);
    else {
      toast.success(`Clave nueva para ${u.nombre}.`);
      setResetId(null);
      setResetClaveVal("");
      load();
    }
  };

  return (
    <section className="katrina-frame rounded-xl border border-[#C4A35A]/25 bg-black/45 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-[#E8B923]">Empleados</h2>
      <p className="mt-1 text-xs text-white/50">
        Brenda crea el nombre y la clave. Queda en la hoja Katrina. El mozo entra en /salon desde su celular.
      </p>
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
      <form onSubmit={crear} className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del mozo"
          className="h-11 rounded-md border border-white/15 bg-black/40 px-3 text-sm"
          maxLength={40}
        />
        <input
          type="password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          placeholder="Clave que le das"
          className="h-11 rounded-md border border-white/15 bg-black/40 px-3 text-sm"
        />
        <button type="submit" disabled={busy} className="h-11 rounded-md bg-[#E8B923] px-4 text-sm font-semibold text-[#0E0A1A] disabled:opacity-50">
          Crear mozo
        </button>
      </form>
      <ul className="mt-4 space-y-2">
        {rows.map((u) => (
          <li key={u.id} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{u.nombre}</p>
                <p className="text-[11px] text-white/45">
                  {u.rol === "gerente" ? "Gerente" : "Mozo"}
                  {u.activo ? "" : " · baja"}
                </p>
              </div>
              {u.rol === "mozo" && u.activo && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setResetId(resetId === u.id ? null : u.id);
                      setResetClaveVal("");
                    }}
                    className="h-10 rounded-md px-3 text-xs text-white/60"
                  >
                    Nueva clave
                  </button>
                  <button type="button" onClick={() => baja(u)} className="h-10 rounded-md px-3 text-xs text-white/50">
                    Dar de baja
                  </button>
                </div>
              )}
            </div>
            {resetId === u.id && (
              <form
                className="mt-2 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  reset(u);
                }}
              >
                <input
                  type="password"
                  value={resetClaveVal}
                  onChange={(e) => setResetClaveVal(e.target.value)}
                  placeholder="Clave nueva"
                  className="h-10 flex-1 rounded-md border border-white/15 bg-black/40 px-3 text-sm"
                />
                <button type="submit" className="h-10 rounded-md bg-[#E8B923] px-3 text-xs font-semibold text-[#0E0A1A]">
                  Guardar
                </button>
              </form>
            )}
          </li>
        ))}
        {rows.length === 0 && <p className="text-xs text-white/40">Todavía no hay nadie.</p>}
      </ul>
    </section>
  );
}
