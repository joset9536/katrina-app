import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addToCart,
  cartCount,
  loadCart,
  saveCart,
  setCartQty,
  type CartLine,
} from "@/lib/cart";

const EVENT = "katrina:cart-changed";

export function useCart(mesaNumero?: number | null) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    setLines(loadCart(mesaNumero));
    const onChange = () => setLines(loadCart(mesaNumero));
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [mesaNumero]);

  const commit = useCallback(
    (next: CartLine[]) => {
      setLines(next);
      saveCart(next, mesaNumero);
      window.dispatchEvent(new Event(EVENT));
    },
    [mesaNumero],
  );

  const add = useCallback(
    (item: { name: string; price?: string; variant?: string; qty?: number }) => {
      commit(addToCart(lines, item));
    },
    [commit, lines],
  );

  const setQty = useCallback(
    (key: string, qty: number) => {
      commit(setCartQty(lines, key, qty));
    },
    [commit, lines],
  );

  const clear = useCallback(() => commit([]), [commit]);

  return {
    lines,
    count: useMemo(() => cartCount(lines), [lines]),
    add,
    setQty,
    clear,
  };
}
