import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ColaLlamados } from "@/components/katrina/staff/ColaLlamados";
import { MisLlamados } from "@/components/katrina/staff/MisLlamados";
import { MapaMesasRef } from "@/components/katrina/staff/MapaMesasRef";
import { PinGate } from "@/components/katrina/PinGate";

const STAFF_PIN = import.meta.env.VITE_STAFF_PIN || process.env.STAFF_PIN || "katrina-mozos";

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

function StaffPage() {
  const [nombre, setNombre] = useState("");
  const [input, setInput] = useState("");

  useEffect(() => {
    const n = localStorage.getItem(STORAGE) || "";
    setNombre(n);
  }, []);

  if (!nombre) {
    return (
      <div className="min-h-screen bg-[#0E0A1A] text-white flex items-center justify-center p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = input.trim();
            if (!v) return;
            localStorage.setItem(STORAGE, v);
            setNombre(v);
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
        <button
          onClick={() => {
            localStorage.removeItem(STORAGE);
            setNombre("");
          }}
          className="text-xs text-white/60 hover:text-white"
        >
          Cerrar turno
        </button>
      </header>
      <main className="mx-auto grid max-w-6xl gap-4 p-4 md:p-6">
        <ColaLlamados staffNombre={nombre} />
        <MisLlamados staffNombre={nombre} />
        <MapaMesasRef staffNombre={nombre} />
      </main>
    </div>
  );
}
