import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

import classicBurger from "@/assets/carta/classic-burger.jpg";
import dobleBurger from "@/assets/carta/doble-burger.png";
import katrinaBurger from "@/assets/carta/katrina-burger.png";
import banoCheddar from "@/assets/carta/bano-cheddar.jpg";
import pizzaComun from "@/assets/carta/pizza-comun.jpg";
import pizzaEspecial from "@/assets/carta/pizza-especial.jpg";
import pizzaDobleQueso from "@/assets/carta/pizza-doble-queso.jpg";
import pizzaPollo from "@/assets/carta/pizza-pollo.jpg";
import pizzaNapolitana from "@/assets/carta/pizza-napolitana.jpg";
import pizzaTernera from "@/assets/carta/pizza-ternera.jpg";
import pizzaMexicana from "@/assets/carta/pizza-mexicana.jpg";
import lomitoClasico from "@/assets/carta/lomito-clasico.jpg";
import lomitoKatrina from "@/assets/carta/lomito-katrina.png";
import sandwichMilanesa from "@/assets/carta/sandwich-milanesa.jpg";
import milanesaKatrina from "@/assets/carta/milanesa-katrina.png";
import especialKatrina from "@/assets/carta/especial-katrina.png";
import charlyGratinado from "@/assets/carta/charly-gratinado.png";
import nachosDesierto from "@/assets/carta/nachos-desierto.jpg";
import picadaFria from "@/assets/carta/picada-fria.png";
import picadaCaliente from "@/assets/carta/picada-caliente.jpg";
import hotdogCallejero from "@/assets/carta/hotdog-callejero.jpg";
import hotdogFrontera from "@/assets/carta/hotdog-frontera.jpg";
import hotdogEncamisado from "@/assets/carta/hotdog-encamisado.jpg";
import papasCheddarBacon from "@/assets/carta/papas-cheddar-bacon.jpg";
import papasClasicas from "@/assets/carta/papas-clasicas.jpg";
import salchipapas from "@/assets/carta/salchipapas.jpg";
import polloFrito from "@/assets/carta/pollo-frito.jpg";
import cheesecakeFrutosRojos from "@/assets/carta/cheesecake-frutos-rojos.jpg";
import cheesecakeMaracuya from "@/assets/carta/cheesecake-maracuya.jpg";
import postreOreo from "@/assets/carta/postre-oreo.jpg";
import tiramisu from "@/assets/carta/tiramisu.jpg";

type Item = {
  name: string;
  description?: string;
  price?: string;
  priceWhole?: string;
  priceHalf?: string;
  photo?: string;
};

type CategoryData = {
  id: string;
  label: string;
  subtitle?: string;
  priceMode?: "single" | "pizza";
  items: Item[];
};

const CATEGORIES: CategoryData[] = [
  {
    id: "hamburguesas",
    label: "Hamburguesas",
    subtitle: "Todas incluyen papas",
    items: [
      { name: "Classic Burger", price: "$9.000", description: "Lechuga, tomate, huevo, jamón, queso y papas.", photo: classicBurger },
      { name: "Doble Burger", price: "$13.000", description: "Doble carne, lechuga, tomate, huevo y papas.", photo: dobleBurger },
      { name: "Katrina Burger", price: "$16.000", description: "Doble carne 150gr, bacon, cheddar, salsa americana, huevo y papas.", photo: katrinaBurger },
      { name: "Baño de Cheddar", price: "$3.000", description: "Adicional para cualquier hamburguesa.", photo: banoCheddar },
    ],
  },
  {
    id: "pizzas",
    label: "Pizzas",
    subtitle: "Precios entera / media",
    priceMode: "pizza",
    items: [
      { name: "Pizza Común", priceWhole: "$9.000", priceHalf: "$5.000", photo: pizzaComun },
      { name: "Pizza Especial", priceWhole: "$11.000", priceHalf: "$6.000", photo: pizzaEspecial },
      { name: "Pizza Doble Queso", priceWhole: "$11.000", priceHalf: "$6.000", photo: pizzaDobleQueso },
      { name: "Pizza de Pollo", priceWhole: "$15.000", priceHalf: "$8.000", photo: pizzaPollo },
      { name: "Pizza Napolitana", priceWhole: "$11.000", priceHalf: "$6.000", photo: pizzaNapolitana },
      { name: "Pizza de Ternera", priceWhole: "$18.000", priceHalf: "$10.000", photo: pizzaTernera },
      { name: "Pizza Mexicana", priceWhole: "$18.000", priceHalf: "$10.000", description: "Picante suave.", photo: pizzaMexicana },
    ],
  },
  {
    id: "sandwiches",
    label: "Sándwiches",
    subtitle: "Todos incluyen papas",
    items: [
      { name: "Lomito Clásico", price: "$10.000", description: "Lechuga, tomate, huevo, jamón, queso y papas.", photo: lomitoClasico },
      { name: "Lomito Katrina", price: "$15.000", description: "Bacon, cheddar, salsa americana, huevo y papas.", photo: lomitoKatrina },
      { name: "Sándwich de Milanesa", price: "$10.000", description: "Lechuga, tomate, huevo, jamón, queso y papas.", photo: sandwichMilanesa },
      { name: "Milanesa Katrina", price: "$15.000", description: "Bacon, cheddar, salsa americana, huevo y papas.", photo: milanesaKatrina },
      { name: "Especial Katrina", price: "$18.000", description: "Bife de chorizo, cebolla caramelizada, muzarella, morrón asado, mayonesa de ajo y papas.", photo: especialKatrina },
    ],
  },
  {
    id: "compartir",
    label: "Para Compartir",
    subtitle: "Noche mexicana y tablas",
    items: [
      { name: "Tacos del Norte", price: "$12.000 / $20.000", description: "Carne, pollo o mixtos. 3 tortillas (1p) · 6 tortillas (2p)." },
      { name: "Charly Gratinado", price: "$18.000 / $30.000", description: "Pan de miga, ternera, verdura, queso y papas. Chico / Grande.", photo: charlyGratinado },
      { name: "Nachos del Desierto", price: "Consultar", description: "Con dip de guacamole y cheddar.", photo: nachosDesierto },
      { name: "Picada Fría", price: "$20.000", description: "Salame, jamón, muzarella, cheddar, aceitunas, papas Lays y maní. 2p.", photo: picadaFria },
      { name: "Picada Caliente", price: "$25.000 / $35.000", description: "Milanesa, aros de cebolla, papas, bastones de muzarella, crock, salchicha envuelta + 3 dips. 2p / 4p.", photo: picadaCaliente },
    ],
  },
  {
    id: "bajon",
    label: "El Bajón",
    subtitle: "Fritos & Hot Dogs",
    items: [
      { name: "Hot Dog Callejero", price: "$5.000", description: "Simple, como en la calle.", photo: hotdogCallejero },
      { name: "Hot Dog Frontera", price: "$6.000", description: "Especial de la casa.", photo: hotdogFrontera },
      { name: "Hot Dog Encamisado", price: "$8.000", description: "Envuelto en huevo con queso gratinado.", photo: hotdogEncamisado },
      { name: "Papas con Cheddar & Bacon", price: "$9.000", photo: papasCheddarBacon },
      { name: "Papas Clásicas", price: "$7.000", photo: papasClasicas },
      { name: "Salchipapas", price: "$7.000", photo: salchipapas },
      { name: "Pollo Frito con Papas", price: "$10.000", photo: polloFrito },
    ],
  },
  {
    id: "postres",
    label: "Dulce Final",
    subtitle: "Postres",
    items: [
      { name: "Mini Cheesecake de Frutos Rojos", price: "Consultar en mesa", photo: cheesecakeFrutosRojos },
      { name: "Mini Cheesecake de Maracuyá", price: "Consultar en mesa", photo: cheesecakeMaracuya },
      { name: "Postre Oreo", price: "Consultar en mesa", photo: postreOreo },
      { name: "Tiramisú", price: "Consultar en mesa", photo: tiramisu },
    ],
  },
];

export function MenuGrid() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const { ref, visible } = useInView<HTMLDivElement>();
  const timerRef = useRef<number | null>(null);

  const active = CATEGORIES[index];

  useEffect(() => {
    if (paused) return;
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % CATEGORIES.length);
    }, 7000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [paused]);

  const go = (delta: number) => {
    setIndex((i) => (i + delta + CATEGORIES.length) % CATEGORIES.length);
  };

  return (
    <section id="menu" className="relative py-24">
      <div
        className="mx-auto max-w-6xl px-6"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          ref={ref}
          className={`fade-up mb-10 text-center ${visible ? "is-visible" : ""}`}
        >
          <span className="text-xs uppercase tracking-[0.4em] text-white/50">
            La Carta
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            <span className="text-neon-gradient">Menú</span> de la casa
          </h2>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat, i) => {
            const isActive = i === index;
            return (
              <button
                key={cat.id}
                onClick={() => setIndex(i)}
                className={`rounded-full border px-4 py-2 text-sm transition-all ${
                  isActive
                    ? "border-transparent text-white"
                    : "border-white/10 text-white/60 hover:text-white"
                }`}
                style={
                  isActive
                    ? {
                        background:
                          "linear-gradient(90deg, color-mix(in oklab, var(--neon-purple) 30%, transparent), color-mix(in oklab, #FF3D8A 25%, transparent))",
                        boxShadow:
                          "0 0 20px color-mix(in oklab, var(--neon-purple) 45%, transparent)",
                      }
                    : undefined
                }
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Carousel viewport */}
        <div className="relative">
          <button
            aria-label="Anterior"
            onClick={() => go(-1)}
            className="carousel-arrow left-0"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            aria-label="Siguiente"
            onClick={() => go(1)}
            className="carousel-arrow right-0"
          >
            <ChevronRight size={20} />
          </button>

          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {CATEGORIES.map((cat) => (
                <div key={cat.id} className="w-full shrink-0 px-1">
                  <div className="mb-6 text-center">
                    <p className="text-sm text-white/60">{cat.subtitle}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {cat.items.map((item, i) => (
                      <MenuCard
                        key={`${cat.id}-${item.name}`}
                        item={item}
                        pizzaMode={cat.priceMode === "pizza"}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* dots */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {CATEGORIES.map((c, i) => (
              <button
                key={c.id}
                aria-label={c.label}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === index ? "w-8 bg-white/90" : "w-2 bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MenuCard({
  item,
  pizzaMode,
  index,
}: {
  item: Item;
  pizzaMode: boolean;
  index: number;
}) {
  const { ref, visible } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`menu-card fade-up flex h-full flex-col overflow-hidden ${visible ? "is-visible" : ""}`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      {item.photo ? (
        <div className="aspect-[4/3] w-full overflow-hidden">
          <img
            src={item.photo}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      ) : (
        <div className="menu-photo aspect-[4/3] w-full" aria-hidden />
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl leading-tight">{item.name}</h3>
          {!pizzaMode && item.price && (
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
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            {item.description}
          </p>
        )}

        {pizzaMode && (
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
            <PizzaPrice label="Entera" value={item.priceWhole} />
            <PizzaPrice label="Media" value={item.priceHalf} />
          </div>
        )}
      </div>
    </div>
  );
}

function PizzaPrice({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <span className="block text-[10px] uppercase tracking-[0.3em] text-white/50">
        {label}
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
        {value}
      </span>
    </div>
  );
}
