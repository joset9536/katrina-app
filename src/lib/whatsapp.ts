const WHATSAPP_NUMBER = "5493878631310";

function getMesa(): string | null {
  return typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("mesa")
    : null;
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
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
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
