import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { useMesa } from "@/hooks/use-mesa";

type Props = {
  name: string;
  price?: string;
  pizzaMode?: boolean;
  priceWhole?: string;
  priceHalf?: string;
};

export function ItemOrderControls({ name, price, pizzaMode, priceWhole, priceHalf }: Props) {
  const { numero } = useMesa();
  const { add } = useCart(numero);
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState<"entera" | "media">("entera");
  const [justAdded, setJustAdded] = useState(false);

  const resolvedPrice = pizzaMode ? (variant === "entera" ? priceWhole : priceHalf) : price;

  const agregar = () => {
    add({
      name,
      qty,
      price: resolvedPrice,
      variant: pizzaMode ? (variant === "entera" ? "entera" : "media") : undefined,
    });
    setJustAdded(true);
    toast.success(`${qty}× ${name} agregado`);
    window.setTimeout(() => setJustAdded(false), 900);
  };

  return (
    <div className="mt-4 space-y-2">
      {pizzaMode && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setVariant("entera")}
            className={`h-11 rounded-full px-2 text-xs font-semibold active:scale-95 ${
              variant === "entera" ? "bg-[#FF3D8A] text-[#0E0A1A]" : "bg-white/10 text-white/70"
            }`}
          >
            Entera · compartir
          </button>
          <button
            type="button"
            onClick={() => setVariant("media")}
            className={`h-11 rounded-full px-2 text-xs font-semibold active:scale-95 ${
              variant === "media" ? "bg-[#FF3D8A] text-[#0E0A1A]" : "bg-white/10 text-white/70"
            }`}
          >
            Media
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-full bg-white/10">
          <button
            type="button"
            aria-label="Menos"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center active:scale-95"
          >
            <Minus size={16} />
          </button>
          <span className="w-6 text-center text-sm font-semibold">{qty}</span>
          <button
            type="button"
            aria-label="Más"
            onClick={() => setQty((q) => Math.min(20, q + 1))}
            className="flex h-11 w-11 items-center justify-center active:scale-95"
          >
            <Plus size={16} />
          </button>
        </div>
        <button
          type="button"
          onClick={agregar}
          className={`flex h-11 flex-1 items-center justify-center rounded-full text-sm font-semibold active:scale-95 ${
            justAdded ? "bg-emerald-400 text-[#0E0A1A]" : "bg-[#FF3D8A] text-[#0E0A1A]"
          }`}
        >
          {justAdded ? "Agregado" : "Agregar"}
        </button>
      </div>
    </div>
  );
}
