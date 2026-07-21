const WHATSAPP_NUMBER = "5493878631310";

/**
 * Arma el link de WhatsApp incluyendo la mesa (leída de ?mesa= en la URL)
 * para que el mensaje ya le llegue al mozo con el numero de mesa.
 */
export function whatsappOrderUrl(): string {
  const mesa =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("mesa")
      : null;
  const text = mesa
    ? `Hola! Soy de la Mesa ${mesa} y quiero hacer un pedido:`
    : "Hola! Quiero hacer un pedido:";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
