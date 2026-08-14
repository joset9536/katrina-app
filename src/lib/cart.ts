import { persistMesa, readStoredMesa } from "./mesa";

export type CartLine = {
  key: string;
  name: string;
  qty: number;
  price?: string;
  variant?: string;
};

const STORAGE_CART = "katrina_cart_v1";

export function cartLineKey(name: string, variant?: string): string {
  return variant ? `${name}::${variant}` : name;
}

export function cartLineLabel(line: CartLine): string {
  return line.variant ? `${line.name} (${line.variant})` : line.name;
}

function readRaw(): { mesa: number | null; lines: CartLine[] } {
  if (typeof window === "undefined") return { mesa: null, lines: [] };
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_CART) || "null");
    if (!parsed || !Array.isArray(parsed.lines)) return { mesa: null, lines: [] };
    return {
      mesa: typeof parsed.mesa === "number" ? parsed.mesa : null,
      lines: parsed.lines.filter((l: CartLine) => l && l.name && l.qty > 0),
    };
  } catch {
    return { mesa: null, lines: [] };
  }
}

function writeRaw(mesa: number | null, lines: CartLine[]) {
  localStorage.setItem(STORAGE_CART, JSON.stringify({ mesa, lines }));
}

export function loadCart(mesaNumero?: number | null): CartLine[] {
  const stored = readRaw();
  if (mesaNumero && stored.mesa && stored.mesa !== mesaNumero) return [];
  return stored.lines;
}

export function saveCart(lines: CartLine[], mesaNumero?: number | null) {
  const stored = readStoredMesa();
  const mesa = mesaNumero ?? (stored.ok ? stored.numero : null);
  writeRaw(mesa, lines.filter((l) => l.qty > 0));
}

export function addToCart(
  lines: CartLine[],
  item: { name: string; price?: string; variant?: string; qty?: number },
): CartLine[] {
  const key = cartLineKey(item.name, item.variant);
  const qty = item.qty ?? 1;
  const existing = lines.find((l) => l.key === key);
  if (existing) {
    return lines.map((l) => (l.key === key ? { ...l, qty: l.qty + qty, price: item.price ?? l.price } : l));
  }
  return [...lines, { key, name: item.name, qty, price: item.price, variant: item.variant }];
}

export function setCartQty(lines: CartLine[], key: string, qty: number): CartLine[] {
  if (qty <= 0) return lines.filter((l) => l.key !== key);
  return lines.map((l) => (l.key === key ? { ...l, qty } : l));
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}

export function formatPedidoText(lines: CartLine[]): string {
  const body = lines.map((l) => `• ${l.qty}x ${cartLineLabel(l)}${l.price ? ` (${l.price})` : ""}`).join("\n");
  return `[PEDIDO]\n${body}`;
}

export function bindCartToMesa(numero: number) {
  const stored = readRaw();
  persistMesa(numero);
  writeRaw(numero, stored.lines);
}
