export const MESA_MIN = 1;
export const MESA_MAX = 30;

export const STORAGE_MESA = "katrina_chat_mesa";
export const STORAGE_USER = "katrina_chat_user";
export const STORAGE_LLAMADO = "katrina_chat_llamado";

export type MesaParse =
  | { ok: true; numero: number; mesaId: string }
  | { ok: false; reason: "missing" | "invalid" | "out_of_range"; raw: string };

export function mesaIdFromNumero(numero: number): string {
  return `mesa-${numero}`;
}

export function numeroFromMesaId(mesaId: string): number | null {
  const n = Number(mesaId.replace(/^mesa-/, ""));
  return Number.isInteger(n) && n >= MESA_MIN && n <= MESA_MAX ? n : null;
}

export function parseMesaValue(raw: string | null | undefined): MesaParse {
  const value = (raw ?? "").trim();
  if (!value) return { ok: false, reason: "missing", raw: "" };
  const digits = value.replace(/^mesa-/i, "").trim();
  if (!/^\d+$/.test(digits)) return { ok: false, reason: "invalid", raw: value };
  const numero = Number(digits);
  if (!Number.isInteger(numero) || numero < MESA_MIN || numero > MESA_MAX) {
    return { ok: false, reason: "out_of_range", raw: value };
  }
  return { ok: true, numero, mesaId: mesaIdFromNumero(numero) };
}

export function readQueryMesa(): MesaParse {
  if (typeof window === "undefined") return { ok: false, reason: "missing", raw: "" };
  return parseMesaValue(new URLSearchParams(window.location.search).get("mesa"));
}

export function readStoredMesa(): MesaParse {
  if (typeof window === "undefined") return { ok: false, reason: "missing", raw: "" };
  return parseMesaValue(localStorage.getItem(STORAGE_MESA));
}

export function persistMesa(numero: number) {
  localStorage.setItem(STORAGE_MESA, String(numero));
}

export function persistUser(nombre: string) {
  localStorage.setItem(STORAGE_USER, nombre.trim());
}

export function readStoredUser(): string {
  if (typeof window === "undefined") return "";
  return (localStorage.getItem(STORAGE_USER) || "").trim();
}

export function describeMesaError(parse: MesaParse): string | null {
  if (parse.ok) return null;
  if (parse.reason === "missing") return null;
  if (parse.reason === "invalid") {
    return `El código QR no es válido (“${parse.raw}”). Pedile al mozo el QR de tu mesa.`;
  }
  return `La mesa ${parse.raw} no existe. En Katrina hay mesas ${MESA_MIN} a ${MESA_MAX}. Pedile al mozo el QR correcto.`;
}
