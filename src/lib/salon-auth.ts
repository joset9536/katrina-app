import { bajaMozo, crearMozo, entrarSalon, listarEmpleados, resetearClaveMozo } from "./salon-bus";

export type SalonRol = "gerente" | "mozo";

export type SalonUsuario = {
  id: string;
  nombre: string;
  rol: SalonRol;
  activo: boolean;
  tiene_clave: boolean;
};

export type SalonSesion = {
  id: string;
  nombre: string;
  rol: SalonRol;
};

const SESSION_KEY = "katrina_salon_sesion";
const STORAGE_NOMBRE = "katrina_staff_nombre";
const STORAGE_TURNO = "katrina_staff_turno_id";

export const GERENTE_NOMBRE = "Brenda";

export function readSesion(): SalonSesion | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SalonSesion;
    if (!parsed?.id || !parsed?.nombre || !parsed?.rol) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeSesion(s: SalonSesion) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  localStorage.setItem(STORAGE_NOMBRE, s.nombre);
}

export function clearSesion() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(STORAGE_NOMBRE);
  localStorage.removeItem(STORAGE_TURNO);
}

export async function listUsuarios(): Promise<{ items: SalonUsuario[]; error: string | null }> {
  return listarEmpleados();
}

export async function crearEmpleado(nombre: string, clave: string): Promise<{ error: string | null }> {
  return crearMozo({ data: { nombre, clave } });
}

export async function resetearClave(id: string, clave: string): Promise<{ error: string | null }> {
  return resetearClaveMozo({ data: { id, clave } });
}

export async function borrarEmpleado(id: string): Promise<{ error: string | null }> {
  return bajaMozo({ data: { id } });
}

export async function entrarConClave(
  nombre: string,
  clave: string,
): Promise<{ sesion: SalonSesion | null; error: string | null }> {
  return entrarSalon({ data: { nombre, clave } });
}
