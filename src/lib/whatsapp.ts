const WHATSAPP_NUMBER = "5493878631310";

function getMesa(): string | null {
  return typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("mesa")
    : null;
}

export function whatsappHref(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/**
 * Arma el link de WhatsApp incluyendo la mesa (leída de ?mesa= en la URL)
 * para que el mensaje ya le llegue al mozo con el numero de mesa.
 */
export function whatsappOrderUrl(): string {
  const mesa = getMesa();
  const text = mesa
    ? `Hola! Soy de la Mesa ${mesa} y quiero hacer un pedido:`
    : "Hola! Quiero hacer un pedido:";
  return whatsappHref(text);
}

export function whatsappCallUrl(opts?: { mesa?: string | number | null; nombre?: string }): string {
  const mesa = opts?.mesa ?? getMesa();
  const nombre = opts?.nombre?.trim();
  const parts = ["Hola! Quiero llamar al mozo."];
  if (mesa) parts.push(`Mesa ${mesa}.`);
  if (nombre) parts.push(`Soy ${nombre}.`);
  return whatsappHref(parts.join(" "));
}

export function whatsappPedidoUrl(opts: {
  mesa?: string | number | null;
  nombre?: string;
  pedido: string;
}): string {
  const parts = ["Hola!"];
  if (opts.mesa) parts.push(`Mesa ${opts.mesa}.`);
  if (opts.nombre?.trim()) parts.push(`Soy ${opts.nombre.trim()}.`);
  parts.push(opts.pedido);
  return whatsappHref(parts.join(" "));
}

export function openWhatsApp(url: string) {
  if (typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Link de WhatsApp con un item puntual de la carta ya escrito en el mensaje
 * (mesa + nombre del plato/trago + precio si hay).
 */
export function whatsappItemUrl(itemName: string, price?: string): string {
  const mesa = getMesa();
  const mesaLine = mesa ? `Soy de la Mesa ${mesa}. ` : "";
  const precioLine = price ? ` (${price})` : "";
  const text = `Hola! ${mesaLine}Quiero pedir: ${itemName}${precioLine}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
