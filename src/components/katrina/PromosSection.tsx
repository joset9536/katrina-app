import { useState } from "react";
import { NeonButton } from "./NeonButton";

const WHATSAPP = "https://wa.me/5493878631310";

type Combo = {
  id: string;
  chip: string;
  title: string;
  desc: string;
  price?: string;
  cta?: string;
};

const COMIDAS: Combo[] = [
  {
    id: "arterias-de-katrina",
    chip: "Combo estrella",
    title: "Arterias de Katrina",
    desc: "Doble carne 150gr c/u, bacon, cheddar, salsa americana y huevo. Con papas + Coca 1L o cerveza.",
    price: "$20.000",
  },
  {
    id: "2x-clasicas",
    chip: "2x combo",
    title: "2× Hamburguesas Clásicas",
    desc: "Carne 100%, cheddar y papas crocantes. Ideal para compartir.",
    price: "$15.000",
  },
  {
    id: "pollo-frito",
    chip: "Delivery",
    title: "Pollo Frito",
    desc: "Pollo frito con papas y limón. Pedilo al 3878 631310.",
    cta: "Pedir por WhatsApp",
  },
];

const BEBIDAS: Combo[] = [
  {
    id: "smirnoff",
    chip: "Promo botella",
    title: "Smirnoff + 2 Speed grandes",
    desc: "Botella de Smirnoff + 2 Speed grandes para arrancar la noche.",
    price: "$28.000",
  },
  {
    id: "2x1",
    chip: "Todos los días",
    title: "2×1 en tragos",
    desc: "Vodka, Gin Tonic o Fernet — dos, pagás uno. Todos los días.",
    price: "2×1",
  },
];

function ComboCard({ combo }: { combo: Combo }) {
  return (
    <article className="promo-card flex h-full flex-col justify-between">
      <div>
        <span className="promo-chip">{combo.chip}</span>
        <h3 className="mt-3 font-display text-2xl font-semibold text-white">
          {combo.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-white/70">{combo.desc}</p>
      </div>
      <div className="mt-5 space-y-3">
        <div className="flex items-end justify-between gap-4">
          {combo.price && <div className="promo-price">{combo.price}</div>}
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-[0.25em] text-white/60 transition hover:text-white"
          >
            {combo.cta ?? "Pedir →"}
          </a>
        </div>
        <p className="text-[0.7rem] uppercase tracking-widest text-white/50 border-t border-white/10 pt-3">
          Delivery: 3878 631310 · Retiro en el local
        </p>
      </div>
    </article>
  );
}

/* Candy coctels — placeholders visuales hasta subir las fotos reales */
const CANDY = [
  { id: "azul", label: "Blue Katrina", color: "linear-gradient(160deg,#3b82f6,#8B5CF6)" },
  { id: "verde", label: "Green Cactus", color: "linear-gradient(160deg,#22c55e,#84cc16)" },
  { id: "rosa", label: "Pink Skull", color: "linear-gradient(160deg,#FF3D8A,#C0006A)" },
  { id: "ambar", label: "Amber Sunset", color: "linear-gradient(160deg,#E8B923,#FF6B00)" },
];

function CandyCarousel() {
  const [i, setI] = useState(0);
  const item = CANDY[i];
  return (
    <div className="promo-card overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="promo-chip">Candy Coctels</span>
          <h3 className="mt-3 font-display text-2xl font-semibold text-white">
            Nuestros más pedidos
          </h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">
            ¡Probá nuestros cócteles candy! Colores intensos, sabores dulces.
            Próximamente fotos reales.
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={() => setI((v) => (v - 1 + CANDY.length) % CANDY.length)}
          className="carousel-arrow static translate-y-0"
          aria-label="Anterior"
        >
          ‹
        </button>
        <div
          className="flex h-40 flex-1 items-end justify-center rounded-xl p-3 text-sm font-medium text-white/90"
          style={{ background: item.color, boxShadow: "0 0 30px rgba(139,92,246,0.35)" }}
          aria-label={`Foto placeholder: ${item.label}`}
        >
          {item.label}
        </div>
        <button
          onClick={() => setI((v) => (v + 1) % CANDY.length)}
          className="carousel-arrow static translate-y-0"
          aria-label="Siguiente"
        >
          ›
        </button>
      </div>

      <div className="mt-3 flex justify-center gap-2">
        {CANDY.map((c, idx) => (
          <button
            key={c.id}
            onClick={() => setI(idx)}
            aria-label={c.label}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx === i ? "w-6 bg-white/80" : "w-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function PromosSection() {
  return (
    <section id="promos" aria-label="Combos y promos" className="mt-20">
      <div className="mb-8 text-center">
        <span className="wc-kicker">Katrina · Egüés 517</span>
        <h2 className="wc-title wc-title-sm mt-4">Combos y Promos</h2>
        <p className="wc-detail mt-3">Delivery al 3878 631310 · retiro en el local</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {COMIDAS.map((c) => (
          <ComboCard key={c.id} combo={c} />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        {BEBIDAS.map((c) => (
          <ComboCard key={c.id} combo={c} />
        ))}
      </div>

      <div className="mt-5">
        <CandyCarousel />
      </div>

      <div className="mt-8 flex justify-center">
        <NeonButton
          href={WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          variant="primary"
          className="btn-pulse"
        >
          Pedir promo por WhatsApp
        </NeonButton>
      </div>
    </section>
  );
}
