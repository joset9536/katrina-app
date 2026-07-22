// Puente chico entre "Pedir este" (en la carta) y el ChatPanel flotante.
// Antes "Pedir este" mandaba directo a WhatsApp para cada item — el mozo
// terminaba con el celular pegado a WhatsApp todo el turno. Ahora manda el
// pedido al sistema interno de "Llamar mozo" (mismo que ve /staff en vivo).
const EVENT = "katrina:pedir-item";

export function requestOrder(text: string) {
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: text }));
}

export function onOrderRequested(handler: (text: string) => void): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<string>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
