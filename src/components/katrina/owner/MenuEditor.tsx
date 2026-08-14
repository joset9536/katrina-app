import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MENU_CATEGORIES, buildSeedRows, type MenuItemRow } from "@/data/menu";

const LABEL_BY_CATEGORY: Record<string, string> = Object.fromEntries(
  MENU_CATEGORIES.map((c) => [c.id, c.label]),
);
const PIZZA_CATEGORIES = new Set(MENU_CATEGORIES.filter((c) => c.priceMode === "pizza").map((c) => c.id));
const CATEGORY_ORDER = MENU_CATEGORIES.map((c) => c.id);

export function MenuEditor() {
  const [rows, setRows] = useState<MenuItemRow[] | null>(null);
  const [tableMissing, setTableMissing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("category_id")
      .order("sort_order");
    if (error) {
      setTableMissing(true);
      setRows([]);
      return;
    }
    setTableMissing(false);
    setRows((data as MenuItemRow[]) || []);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("owner-menu-editor")
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const seed = async () => {
    setSeeding(true);
    setSeedError(null);
    const { error } = await supabase.from("menu_items").insert(buildSeedRows());
    setSeeding(false);
    if (error) {
      setSeedError(error.message);
      return;
    }
    load();
  };

  const updateRow = (id: string, patch: Partial<MenuItemRow>) => {
    setRows((prev) => (prev ? prev.map((r) => (r.id === id ? { ...r, ...patch } : r)) : prev));
  };

  const save = async (row: MenuItemRow) => {
    setSavingId(row.id);
    await supabase
      .from("menu_items")
      .update({
        name: row.name,
        description: row.description,
        price: row.price,
        price_whole: row.price_whole,
        price_half: row.price_half,
      })
      .eq("id", row.id);
    setSavingId(null);
    setSavedId(row.id);
    setTimeout(() => setSavedId((v) => (v === row.id ? null : v)), 1500);
  };

  if (rows === null) {
    return (
      <section className="rounded-xl border border-white/10 bg-black/40 p-4">
        <p className="text-sm text-white/50">Cargando carta…</p>
      </section>
    );
  }

  if (tableMissing) return null;

  if (rows.length === 0) {
    return (
      <section className="rounded-xl border border-white/10 bg-black/40 p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#E8B923]">
          Editor de carta
        </h2>
        <p className="mb-3 text-xs text-white/60">
          Todavía no hay una carta cargada acá. Apretá el botón para traer la carta actual del sitio y
          empezar a editarla — no se pierde nada, solo la copia por primera vez.
        </p>
        {seedError && <p className="mb-2 text-xs text-red-400">Error: {seedError}</p>}
        <button
          onClick={seed}
          disabled={seeding}
          className="rounded-md bg-[#E8B923] px-4 py-2 text-sm font-semibold text-[#0E0A1A] disabled:opacity-50"
        >
          {seeding ? "Cargando…" : "Cargar carta actual"}
        </button>
      </section>
    );
  }

  const byCategory = new Map<string, MenuItemRow[]>();
  for (const r of rows) {
    const list = byCategory.get(r.category_id) ?? [];
    list.push(r);
    byCategory.set(r.category_id, list);
  }
  const orderedCategoryIds = [
    ...CATEGORY_ORDER.filter((id) => byCategory.has(id)),
    ...[...byCategory.keys()].filter((id) => !CATEGORY_ORDER.includes(id)),
  ];

  return (
    <section className="rounded-xl border border-white/10 bg-black/40 p-4">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-widest text-[#E8B923]">
        Editor de carta
      </h2>
      <p className="mb-4 text-xs text-white/50">
        Cambiá nombre, precio o descripción y apretá "Guardar" — se actualiza en el sitio al toque.
      </p>
      <div className="space-y-6">
        {orderedCategoryIds.map((catId) => (
          <div key={catId}>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-white/70">
              {LABEL_BY_CATEGORY[catId] ?? catId}
            </h3>
            <div className="space-y-2">
              {byCategory.get(catId)!.map((row) => {
                const isPizza = PIZZA_CATEGORIES.has(row.category_id);
                return (
                  <div
                    key={row.id}
                    className="grid grid-cols-1 gap-2 rounded-lg border border-white/10 bg-white/5 p-3 md:grid-cols-[1.5fr_1fr_2fr_auto] md:items-center"
                  >
                    <input
                      value={row.name}
                      onChange={(e) => updateRow(row.id, { name: e.target.value })}
                      placeholder="Nombre"
                      className="rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-white focus:border-[#E8B923] focus:outline-none"
                    />
                    {isPizza ? (
                      <div className="flex gap-1">
                        <input
                          value={row.price_whole ?? ""}
                          onChange={(e) => updateRow(row.id, { price_whole: e.target.value })}
                          placeholder="Entera"
                          className="w-full rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-white focus:border-[#E8B923] focus:outline-none"
                        />
                        <input
                          value={row.price_half ?? ""}
                          onChange={(e) => updateRow(row.id, { price_half: e.target.value })}
                          placeholder="Media"
                          className="w-full rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-white focus:border-[#E8B923] focus:outline-none"
                        />
                      </div>
                    ) : (
                      <input
                        value={row.price ?? ""}
                        onChange={(e) => updateRow(row.id, { price: e.target.value })}
                        placeholder="Precio"
                        className="rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-white focus:border-[#E8B923] focus:outline-none"
                      />
                    )}
                    <input
                      value={row.description ?? ""}
                      onChange={(e) => updateRow(row.id, { description: e.target.value })}
                      placeholder="Descripción"
                      className="rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-white focus:border-[#E8B923] focus:outline-none"
                    />
                    <button
                      onClick={() => save(row)}
                      disabled={savingId === row.id}
                      className="rounded-md bg-[#E8B923] px-3 py-1.5 text-xs font-semibold text-[#0E0A1A] disabled:opacity-50"
                    >
                      {savingId === row.id ? "…" : savedId === row.id ? "✓ Guardado" : "Guardar"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
