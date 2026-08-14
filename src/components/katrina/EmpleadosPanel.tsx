import { useEffect, useState } from "react";
import { toast } from "sonner";
import { borrarEmpleado, invitarEmpleado, listUsuarios, type SalonUsuario } from "@/lib/salon-auth";

export function EmpleadosPanel() {
  const [rows, setRows] = useState<SalonUsuario[]>([]);
  const [nombre, setNombre] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => setRows(await listUsuarios());

  useEffect(() => {
    load();
  }, []);

  const invitar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const res = await invitarEmpleado(nombre);
    setBusy(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success(`${nombre.trim()} ya puede entrar. Que elija su clave la primera vez.`);
    setNombre("");
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

  return (
    <section className="rounded-xl border border-white/10 bg-black/40 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-[#E8B923]">Empleados</h2>
      <p className="mt-1 text-xs text-white/50">
        Cargá el nombre. La primera vez que entre, ella elige la clave. Vos no se la inventás.
      </p>
      <form onSubmit={invitar} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Romy"
          className="h-11 flex-1 rounded-md border border-white/15 bg-black/40 px-3 text-sm"
          maxLength={40}
        />
        <button type="submit" disabled={busy} className="h-11 rounded-md bg-[#E8B923] px-4 text-sm font-semibold text-[#0E0A1A] disabled:opacity-50">
          Dar de alta
        </button>
      </form>
      <ul className="mt-4 space-y-2">
        {rows.map((u) => (
          <li key={u.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
            <div>
              <p className="font-semibold">{u.nombre}</p>
              <p className="text-[11px] text-white/45">
                {u.rol === "gerente" ? "Gerente" : "Mozo"}
                {u.activo ? "" : " · baja"}
                {u.tiene_clave ? "" : " · todavía no eligió clave"}
              </p>
            </div>
            {u.rol === "mozo" && u.activo && (
              <button type="button" onClick={() => baja(u)} className="h-10 rounded-md px-3 text-xs text-white/50">
                Dar de baja
              </button>
            )}
          </li>
        ))}
        {rows.length === 0 && <p className="text-xs text-white/40">Todavía no hay nadie.</p>}
      </ul>
    </section>
  );
}
