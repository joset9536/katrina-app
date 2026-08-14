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
const USERS_KEY = "katrina_salon_usuarios";

export const GERENTE_NOMBRE = "Brenda";
const GERENTE_ID = "gerente-brenda";
const GERENTE_HASH = "da73b6e585f866f07537376670f87435d3ab7a1a34a29e61633a914977419b66";

type StoredUser = {
  id: string;
  nombre: string;
  rol: SalonRol;
  activo: boolean;
  clave_hash: string | null;
};

function uid() {
  return crypto.randomUUID?.() ?? `u-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readLocal(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const parsed = raw ? (JSON.parse(raw) as StoredUser[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(rows: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(rows));
}

function findLocal(nombre: string): StoredUser | undefined {
  const n = nombre.trim().toLowerCase();
  return readLocal().find((u) => u.nombre.toLowerCase() === n);
}

function toPublic(u: StoredUser): SalonUsuario {
  return {
    id: u.id,
    nombre: u.nombre,
    rol: u.rol,
    activo: u.activo,
    tiene_clave: Boolean(u.clave_hash),
  };
}

async function hashClave(nombre: string, clave: string): Promise<string> {
  const text = `${nombre.trim().toLowerCase()}::${clave}`;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function withTimeout<T>(p: Promise<T>, ms = 4000): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), ms)),
  ]);
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

export function countLocalUsuarios(): number {
  return readLocal().filter((u) => u.activo).length;
}

/** Deja a Brenda como única gerente, con la clave que pidió José. */
export function ensureBrendaGerente() {
  if (typeof window === "undefined") return;
  const others = readLocal().filter((u) => u.nombre.toLowerCase() !== "brenda");
  writeLocal([
    {
      id: GERENTE_ID,
      nombre: GERENTE_NOMBRE,
      rol: "gerente",
      activo: true,
      clave_hash: GERENTE_HASH,
    },
    ...others.map((u) => (u.rol === "gerente" ? { ...u, rol: "mozo" as const } : u)),
  ]);
}

export async function countUsuarios(): Promise<{ n: number; error: string | null }> {
  const local = countLocalUsuarios();
  if (local > 0) return { n: local, error: null };
  if (!isSupabaseConfigured()) return { n: 0, error: null };
  try {
    const { count, error } = await withTimeout(
      supabase.from("salon_usuarios").select("id", { count: "exact", head: true }),
    );
    if (error) {
      if (/schema cache|does not exist|relation/i.test(error.message)) return { n: 0, error: null };
      return { n: 0, error: null };
    }
    return { n: count ?? 0, error: null };
  } catch {
    return { n: 0, error: null };
  }
}

export async function listUsuarios(): Promise<SalonUsuario[]> {
  const local = readLocal().map(toPublic);
  if (!isSupabaseConfigured()) return local;
  try {
    const { data, error } = await withTimeout(
      supabase.from("salon_usuarios").select("id,nombre,rol,activo,clave_hash").order("created_at", { ascending: true }),
    );
    if (error || !data) return local;
    const remote = (
      data as { id: string; nombre: string; rol: SalonRol; activo: boolean; clave_hash: string | null }[]
    ).map((row) => ({
      id: row.id,
      nombre: row.nombre,
      rol: row.rol,
      activo: row.activo,
      tiene_clave: Boolean(row.clave_hash),
    }));
    const names = new Set(remote.map((r) => r.nombre.toLowerCase()));
    return [...remote, ...local.filter((l) => !names.has(l.nombre.toLowerCase()))];
  } catch {
    return local;
  }
}

export async function crearGerente(nombre: string, clave: string): Promise<{ sesion: SalonSesion | null; error: string | null }> {
  const n = nombre.trim();
  if (!n || clave.trim().length < 4) return { sesion: null, error: "La clave tiene que tener al menos 4 caracteres." };
  const clave_hash = await hashClave(n, clave);
  const localRow: StoredUser = { id: uid(), nombre: n, rol: "gerente", activo: true, clave_hash };
  writeLocal([...readLocal().filter((u) => u.nombre.toLowerCase() !== n.toLowerCase()), localRow]);

  if (isSupabaseConfigured()) {
    try {
      await withTimeout(
        supabase.from("salon_usuarios").insert({ nombre: n, clave_hash, rol: "gerente", activo: true }),
      );
    } catch {
      /* el celular ya tiene el usuario */
    }
  }
  logToSheets({
    data: { timestamp: new Date().toISOString(), mesa: "salon", cliente: n, mensaje: "Gerente creado" },
  }).catch(() => {});
  return { sesion: { id: localRow.id, nombre: n, rol: "gerente" }, error: null };
}

export async function invitarEmpleado(nombre: string): Promise<{ error: string | null }> {
  const n = nombre.trim();
  if (!n) return { error: "Escribí el nombre." };
  if (findLocal(n)?.activo) return { error: "Ese nombre ya está." };
  const row: StoredUser = { id: uid(), nombre: n, rol: "mozo", activo: true, clave_hash: null };
  writeLocal([...readLocal(), row]);
  if (isSupabaseConfigured()) {
    try {
      await withTimeout(
        supabase.from("salon_usuarios").insert({ nombre: n, clave_hash: null, rol: "mozo", activo: true }),
      );
    } catch {
      /* ok local */
    }
  }
  logToSheets({
    data: { timestamp: new Date().toISOString(), mesa: "salon", cliente: n, mensaje: "Empleado invitado" },
  }).catch(() => {});
  return { error: null };
}

export async function borrarEmpleado(id: string): Promise<{ error: string | null }> {
  writeLocal(readLocal().map((u) => (u.id === id && u.rol === "mozo" ? { ...u, activo: false } : u)));
  if (isSupabaseConfigured()) {
    try {
      await withTimeout(supabase.from("salon_usuarios").update({ activo: false }).eq("id", id).eq("rol", "mozo"));
    } catch {
      /* ok local */
    }
  }
  return { error: null };
}

export async function loginNombre(nombre: string): Promise<{
  usuario: SalonUsuario | null;
  error: string | null;
}> {
  const n = nombre.trim();
  if (!n) return { usuario: null, error: "Escribí tu nombre." };
  const local = findLocal(n);
  if (local) {
    if (!local.activo) return { usuario: null, error: "Esa cuenta está dada de baja." };
    return { usuario: toPublic(local), error: null };
  }
  if (!isSupabaseConfigured()) return { usuario: null, error: "Ese nombre no está. Pedile al gerente que te cargue en este celular." };
  try {
    const { data, error } = await withTimeout(
      supabase.from("salon_usuarios").select("id,nombre,rol,activo,clave_hash").ilike("nombre", n).maybeSingle(),
    );
    if (error || !data) return { usuario: null, error: "Ese nombre no está. Pedile al gerente que te cargue." };
    if (!data.activo) return { usuario: null, error: "Esa cuenta está dada de baja." };
    const stored: StoredUser = {
      id: data.id,
      nombre: data.nombre,
      rol: data.rol as SalonRol,
      activo: data.activo,
      clave_hash: data.clave_hash,
    };
    writeLocal([...readLocal().filter((u) => u.nombre.toLowerCase() !== n.toLowerCase()), stored]);
    return { usuario: toPublic(stored), error: null };
  } catch {
    return { usuario: null, error: "Ese nombre no está. Pedile al gerente que te cargue en este celular." };
  }
}

export async function entrarConClave(nombre: string, clave: string): Promise<{ sesion: SalonSesion | null; error: string | null }> {
  const local = findLocal(nombre);
  if (local) {
    if (!local.activo) return { sesion: null, error: "Esa cuenta está dada de baja." };
    if (!local.clave_hash) return { sesion: null, error: "Todavía no eligió clave." };
    const hash = await hashClave(local.nombre, clave);
    if (local.clave_hash !== hash) return { sesion: null, error: "Clave incorrecta." };
    return { sesion: { id: local.id, nombre: local.nombre, rol: local.rol }, error: null };
  }
  const looked = await loginNombre(nombre);
  if (!looked.usuario) return { sesion: null, error: looked.error };
  const again = findLocal(nombre);
  if (!again?.clave_hash) return { sesion: null, error: "Clave incorrecta." };
  const hash = await hashClave(again.nombre, clave);
  if (again.clave_hash !== hash) return { sesion: null, error: "Clave incorrecta." };
  return { sesion: { id: again.id, nombre: again.nombre, rol: again.rol }, error: null };
}

export async function elegirClave(nombre: string, clave: string): Promise<{ sesion: SalonSesion | null; error: string | null }> {
  if (clave.trim().length < 4) return { sesion: null, error: "La clave tiene que tener al menos 4 caracteres." };
  const local = findLocal(nombre);
  if (!local) return { sesion: null, error: "No se encontró el usuario." };
  if (local.clave_hash) return { sesion: null, error: "Esa cuenta ya tiene clave. Entrá con ella." };
  const clave_hash = await hashClave(local.nombre, clave);
  writeLocal(readLocal().map((u) => (u.id === local.id ? { ...u, clave_hash } : u)));
  if (isSupabaseConfigured()) {
    try {
      await withTimeout(supabase.from("salon_usuarios").update({ clave_hash }).eq("id", local.id));
    } catch {
      /* ok local */
    }
  }
  return { sesion: { id: local.id, nombre: local.nombre, rol: local.rol }, error: null };
}
