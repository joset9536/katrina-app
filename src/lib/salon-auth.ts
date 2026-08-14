import { escribirFila, hashClave, leerFilas, parsePayload } from "./salon-sheet";

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
const MOZOS_KEY = "katrina_salon_mozos";

export const GERENTE_NOMBRE = "Brenda";
const GERENTE_CLAVE = "3878273447";

type LocalMozo = { id: string; nombre: string; clave_hash: string; activo: boolean };

function readMozos(): LocalMozo[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(MOZOS_KEY) || "[]") as LocalMozo[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMozos(rows: LocalMozo[]) {
  localStorage.setItem(MOZOS_KEY, JSON.stringify(rows));
}

function upsertMozo(row: LocalMozo) {
  writeMozos([...readMozos().filter((m) => m.nombre.toLowerCase() !== row.nombre.toLowerCase()), row]);
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

export async function entrarConClave(
  nombre: string,
  clave: string,
): Promise<{ sesion: SalonSesion | null; error: string | null }> {
  const n = nombre.trim();
  const c = clave.replace(/\s/g, "");
  if (!n || !c) return { sesion: null, error: "Nombre y clave." };

  if (n.toLowerCase() === GERENTE_NOMBRE.toLowerCase()) {
    if (c !== GERENTE_CLAVE) return { sesion: null, error: "Clave incorrecta." };
    return { sesion: { id: "gerente-brenda", nombre: GERENTE_NOMBRE, rol: "gerente" }, error: null };
  }

  const hash = await hashClave(n, c);
  const local = readMozos().find((m) => m.nombre.toLowerCase() === n.toLowerCase());
  if (local) {
    if (!local.activo) return { sesion: null, error: "Esa cuenta está dada de baja." };
    if (local.clave_hash !== hash) return { sesion: null, error: "Clave incorrecta." };
    return { sesion: { id: local.id, nombre: local.nombre, rol: "mozo" }, error: null };
  }

  try {
    const fromSheet = mozosDesdeFilas(await leerFilas());
    const remote = fromSheet.find((m) => m.nombre.toLowerCase() === n.toLowerCase());
    if (remote) {
      upsertMozo(remote);
      if (!remote.activo) return { sesion: null, error: "Esa cuenta está dada de baja." };
      if (remote.clave_hash !== hash) return { sesion: null, error: "Clave incorrecta." };
      return { sesion: { id: remote.id, nombre: remote.nombre, rol: "mozo" }, error: null };
    }
  } catch {
    /* la hoja no contestó: si no está en este celular, no entra */
  }

  return { sesion: null, error: "Ese nombre no está. Pedile a Brenda que te cargue." };
}

function mozosDesdeFilas(rows: { timestamp: string; mesa: string; pedido: string }[]): LocalMozo[] {
  const map = new Map<string, LocalMozo>();
  for (const r of rows) {
    if (r.mesa !== "usuario") continue;
    const p = parsePayload(r.pedido);
    if (!p?.nombre) continue;
    const key = p.nombre.toLowerCase();
    if (p.op === "baja") {
      const prev = map.get(key);
      if (prev) prev.activo = false;
      continue;
    }
    if (p.op === "mozo" && p.hash) {
      map.set(key, {
        id: `mozo-${key}`,
        nombre: p.nombre,
        clave_hash: p.hash,
        activo: true,
      });
    }
  }
  return Array.from(map.values());
}

export async function listUsuarios(): Promise<{ items: SalonUsuario[]; error: string | null }> {
  const local = readMozos();
  let remote: LocalMozo[] = [];
  let error: string | null = null;
  try {
    remote = mozosDesdeFilas(await leerFilas());
    for (const m of remote) upsertMozo(m);
  } catch (e) {
    error = e instanceof Error ? e.message : "No se pudo leer la hoja.";
  }
  const merged = new Map<string, LocalMozo>();
  for (const m of [...local, ...remote]) merged.set(m.nombre.toLowerCase(), m);
  const items: SalonUsuario[] = [
    { id: "gerente-brenda", nombre: GERENTE_NOMBRE, rol: "gerente", activo: true, tiene_clave: true },
    ...Array.from(merged.values()).map((m) => ({
      id: m.id,
      nombre: m.nombre,
      rol: "mozo" as const,
      activo: m.activo,
      tiene_clave: true,
    })),
  ];
  return { items, error };
}

export async function crearEmpleado(nombre: string, clave: string): Promise<{ error: string | null }> {
  const n = nombre.trim();
  const c = clave.replace(/\s/g, "");
  if (!n) return { error: "Escribí el nombre." };
  if (c.length < 4) return { error: "La clave tiene que tener al menos 4 caracteres." };
  if (n.toLowerCase() === GERENTE_NOMBRE.toLowerCase()) return { error: "Ese nombre es de la gerente." };
  const hash = await hashClave(n, c);
  upsertMozo({ id: `mozo-${n.toLowerCase()}`, nombre: n, clave_hash: hash, activo: true });
  try {
    await escribirFila("usuario", { op: "mozo", nombre: n, hash }, "U");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Se guardó en este celular, no en la hoja." };
  }
  return { error: null };
}

export async function resetearClave(id: string, clave: string): Promise<{ error: string | null }> {
  const c = clave.replace(/\s/g, "");
  if (c.length < 4) return { error: "La clave tiene que tener al menos 4 caracteres." };
  const mozo = readMozos().find((m) => m.id === id);
  if (!mozo) return { error: "No se encontró al mozo." };
  return crearEmpleado(mozo.nombre, c);
}

export async function borrarEmpleado(id: string): Promise<{ error: string | null }> {
  const mozo = readMozos().find((m) => m.id === id);
  if (!mozo) return { error: "No se encontró al mozo." };
  upsertMozo({ ...mozo, activo: false });
  try {
    await escribirFila("usuario", { op: "baja", nombre: mozo.nombre }, "U");
  } catch {
    /* queda baja en este celular */
  }
  return { error: null };
}
