import { useEffect, useState } from "react";

export function useOnline() {
  // En SSR no hay red real. Arrancamos en "online" y recién medimos en el cliente
  // para no pintar un banner falso de "Sin internet" en el HTML inicial.
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return online;
}
