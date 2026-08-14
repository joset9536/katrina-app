import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MenuItem } from "@/data/menu";
import { ItemOrderControls } from "./ItemOrderControls";

export type FlatMenuItem = MenuItem & {
  photo?: string;
  categoryIndex: number;
  categoryLabel: string;
  pizzaMode: boolean;
};

// Carta en una sola tira horizontal: deslizas con el dedo (o tocas las
// flechas) y vas pasando TODOS los platos en orden, sin tener que scrollear
// la pagina arriba/abajo. Tocar una pestaña de categoria salta directo al
// primer plato de esa categoria (lo maneja el padre via `pos`/`onPosChange`).
export function MenuSwiper({
  flat,
  pos,
  onPosChange,
}: {
  flat: FlatMenuItem[];
  pos: number;
  onPosChange: (next: number) => void;
}) {
  const touchStartX = useRef<number | null>(null);
  const item = flat[pos];

  const goTo = (next: number) => {
    if (next < 0 || next >= flat.length) return;
    onPosChange(next);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    goTo(pos + (dx < 0 ? 1 : -1));
  };

  if (!item) return null;

  const indexInCategory =
    pos - flat.findIndex((it) => it.categoryIndex === item.categoryIndex) + 1;
  const categoryTotal = flat.filter((it) => it.categoryIndex === item.categoryIndex).length;


  return (
    <div className="sm:hidden">
      <div className="mb-3 flex items-center justify-between px-1 text-[11px] uppercase tracking-[0.25em] text-white/50">
        <span>{item.categoryLabel}</span>
        <span>
          {indexInCategory} / {categoryTotal}
        </span>
      </div>

      <div
        className="relative"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: "pan-y" }}
      >
        <div key={pos} className="menu-card is-visible overflow-hidden">
          {item.photo ? (
            <div className="aspect-[4/3] w-full overflow-hidden">
              <img
                src={item.photo}
                alt={item.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="menu-photo flex aspect-[4/3] w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-white/40">
              Foto pendiente
            </div>
          )}
          <div className="flex flex-col p-5">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-xl leading-tight">{item.name}</h3>
              {!item.pizzaMode && item.price && (
                <span
                  className="whitespace-nowrap text-sm font-semibold"
                  style={{
                    background: "var(--gradient-neon)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {item.price}
                </span>
              )}
            </div>
            {item.description && (
              <p className="mt-2 text-sm leading-relaxed text-white/60">{item.description}</p>
            )}
            {item.pizzaMode && (
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
                <div>
                  <span className="block text-[10px] uppercase tracking-[0.3em] text-white/50">
                    Entera
                  </span>
                  <span
                    className="mt-1 block text-base font-semibold"
                    style={{
                      background: "var(--gradient-neon)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {item.priceWhole}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-[0.3em] text-white/50">
                    Media
                  </span>
                  <span
                    className="mt-1 block text-base font-semibold"
                    style={{
                      background: "var(--gradient-neon)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {item.priceHalf}
                  </span>
                </div>
              </div>
            )}
            <ItemOrderControls
              name={item.name}
              price={item.price}
              pizzaMode={item.pizzaMode}
              priceWhole={item.priceWhole}
              priceHalf={item.priceHalf}
            />
          </div>
        </div>

        <button
          type="button"
          aria-label="Plato anterior"
          onClick={() => goTo(pos - 1)}
          disabled={pos === 0}
          className="absolute left-1 top-[35%] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm disabled:opacity-0"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          aria-label="Siguiente plato"
          onClick={() => goTo(pos + 1)}
          disabled={pos === flat.length - 1}
          className="absolute right-1 top-[35%] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm disabled:opacity-0"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="mt-3 flex justify-center gap-1.5">
        {Array.from({ length: categoryTotal }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === indexInCategory - 1 ? "w-5 bg-[#FF3D8A]" : "w-1.5 bg-white/20"
            }`}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-[10px] text-white/30">
        Deslizá o usá las flechas para ver el resto de la carta
      </p>
    </div>
  );
}
