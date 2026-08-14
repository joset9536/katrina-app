import { useEffect, useMemo, useState } from "react";
import {
  describeMesaError,
  persistMesa,
  readQueryMesa,
  readStoredMesa,
  STORAGE_LLAMADO,
  type MesaParse,
} from "@/lib/mesa";

export function useMesa() {
  const [query, setQuery] = useState<MesaParse>({ ok: false, reason: "missing", raw: "" });
  const [stored, setStored] = useState<MesaParse>({ ok: false, reason: "missing", raw: "" });

  useEffect(() => {
    const q = readQueryMesa();
    const s = readStoredMesa();
    setQuery(q);
    if (q.ok) {
      const changed = s.ok && s.numero !== q.numero;
      if (changed) localStorage.removeItem(STORAGE_LLAMADO);
      persistMesa(q.numero);
      setStored(q);
    } else {
      setStored(s);
    }
  }, []);

  const active: MesaParse = query.ok ? query : stored;
  const queryError = useMemo(() => describeMesaError(query), [query]);

  return {
    query,
    stored,
    active,
    numero: active.ok ? active.numero : null,
    mesaId: active.ok ? active.mesaId : null,
    queryError,
    hasValidMesa: active.ok,
  };
}
