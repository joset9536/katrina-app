import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const STORAGE = "katrina_staff_nombre";

export function TurnoChip() {
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    setNombre(localStorage.getItem(STORAGE) || "");
  }, []);

  if (!nombre) return null;

  return (
    <Link
      to="/salon"
      className="fixed bottom-28 left-3 z-40 inline-flex h-11 items-center rounded-full border border-[#E8B923]/50 bg-[#0E0A1A]/95 px-3 text-xs font-semibold text-[#E8B923] shadow-lg md:bottom-6 md:left-6"
    >
      Sesión de {nombre}
    </Link>
  );
}
