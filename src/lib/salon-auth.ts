import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { logToSheets } from "./sheets-log";

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

async function hashClave(nombre: string, clave: string): Promise<string> {
  const text = `${nombre.trim().toLowerCase()}::${clave}`;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

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

function rowToUser(row: {
  id: string;
  nombre: string;
  rol: SalonRol;
  activo: boolean;
  clave_hash: string | null;
}): SalonUsuario {
  return {
    id: row.id,
    nombre: row.nombre,
    rol: row.rol,
    activo: row.activo,
    tiene_clave: Boolean(row.clave_hash),
  };
}

export async function countUsuarios(): Promise<{ n: number; error: string | null }> {
  if (!isSupabaseConfigured()) return { n: 0, error: "NETWORK" };
  try {
    const { count, error } = await supabase
      .from("salon_usuarios")
      .select("id", { count: "exact", head: true });
    if (error) {
      if (/schema cache|does not exist|relation/i.test(error.message)) return { n: 0, error: "NO_TABLE" };
      return { n: 0, error: error.message };
    }
    return { n: count ?? 0, error: null };
  } catch {
    return { n: 0, error: "NETWORK" };
  }
}

export async function listUsuarios(): Promise<SalonUsuario[]> {
  const { data, error } = await supabase
    .from("salon_usuarios")
    .select("id,nombre,rol,activo,clave_hash")
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return (data as { id: string; nombre: string; rol: SalonRol; activo: boolean; clave_hash: string | null }[]).map(rowToUser);
}

export async function crearGerente(nombre: string, clave: string): Promise<{ sesion: SalonSesion | null; error: string | null }> {
  const n = nombre.trim();
  if (!n || clave.trim().length < 4) return { sesion: null, error: "La clave tiene que tener al menos 4 caracteres." };
  const clave_hash = await hashClave(n, clave);
  const { data, error } = await supabase
    .from("salon_usuarios")
    .insert({ nombre: n, clave_hash, rol: "gerente", activo: true })
    .select("id,nombre,rol")
    .single();
  if (error || !data) return { sesion: null, error: error?.message || "No se pudo crear el gerente." };
  const sesion: SalonSesion = { id: data.id, nombre: data.nombre, rol: "gerente" };
  logToSheets({
    data: { timestamp: new Date().toISOString(), mesa: "salon", cliente: n, mensaje: "Gerente creado" },
  }).catch(() => {});
  return { sesion, error: null };
}

export async function invitarEmpleado(nombre: string): Promise<{ error: string | null }> {
  const n = nombre.trim();
  if (!n) return { error: "Escribí el nombre." };
  const { error } = await supabase.from("salon_usuarios").insert({
    nombre: n,
    clave_hash: null,
    rol: "mozo",
    activo: true,
  });
  if (error) {
    if (/unique|duplicate/i.test(error.message)) return { error: "Ese nombre ya está." };
    return { error: error.message };
  }
  logToSheets({
    data: { timestamp: new Date().toISOString(), mesa: "salon", cliente: n, mensaje: "Empleado invitado" },
  }).catch(() => {});
  return { error: null };
}

export async function borrarEmpleado(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("salon_usuarios").update({ activo: false }).eq("id", id).eq("rol", "mozo");
  return { error: error?.message ?? null };
}

export async function loginNombre(nombre: string): Promise<{
  usuario: SalonUsuario | null;
  error: string | null;
}> {
  const n = nombre.trim();
  if (!n) return { usuario: null, error: "Escribí tu nombre." };
  const { data, error } = await supabase
    .from("salon_usuarios")
    .select("id,nombre,rol,activo,clave_hash")
    .ilike("nombre", n)
    .maybeSingle();
  if (error) return { usuario: null, error: /does not exist|schema cache/i.test(error.message) ? "NO_TABLE" : error.message };
  if (!data) return { usuario: null, error: "Ese nombre no está. Pedile al gerente que te cargue." };
  if (!data.activo) return { usuario: null, error: "Esa cuenta está dada de baja." };
  return { usuario: rowToUser(data as { id: string; nombre: string; rol: SalonRol; activo: boolean; clave_hash: string | null }), error: null };
}

export async function entrarConClave(nombre: string, clave: string): Promise<{ sesion: SalonSesion | null; error: string | null }> {
  const n = nombre.trim();
  const { data, error } = await supabase
    .from("salon_usuarios")
    .select("id,nombre,rol,activo,clave_hash")
    .ilike("nombre", n)
    .maybeSingle();
  if (error || !data) return { sesion: null, error: "No se pudo entrar." };
  if (!data.activo) return { sesion: null, error: "Esa cuenta está dada de baja." };
  const hash = await hashClave(data.nombre, clave);
  if (data.clave_hash !== hash) return { sesion: null, error: "Clave incorrecta." };
  return { sesion: { id: data.id, nombre: data.nombre, rol: data.rol as SalonRol }, error: null };
}

export async function elegirClave(nombre: string, clave: string): Promise<{ sesion: SalonSesion | null; error: string | null }> {
  if (clave.trim().length < 4) return { sesion: null, error: "La clave tiene que tener al menos 4 caracteres." };
  const n = nombre.trim();
  const { data, error } = await supabase
    .from("salon_usuarios")
    .select("id,nombre,rol,activo,clave_hash")
    .ilike("nombre", n)
    .maybeSingle();
  if (error || !data) return { sesion: null, error: "No se encontró el usuario." };
  if (data.clave_hash) return { sesion: null, error: "Esa cuenta ya tiene clave. Entrá con ella." };
  const clave_hash = await hashClave(data.nombre, clave);
  const { error: up } = await supabase.from("salon_usuarios").update({ clave_hash }).eq("id", data.id);
  if (up) return { sesion: null, error: up.message };
  return { sesion: { id: data.id, nombre: data.nombre, rol: data.rol as SalonRol }, error: null };
}
