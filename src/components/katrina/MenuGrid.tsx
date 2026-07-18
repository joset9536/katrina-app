import { useRef, useState } from "react";
import { useInView } from "@/hooks/use-in-view";


import classicBurgerAsset from "@/assets/carta/classic-burger.jpg";
const classicBurger = classicBurgerAsset;
import dobleBurgerAsset from "@/assets/carta/doble-burger.png";
const dobleBurger = dobleBurgerAsset;
import katrinaBurgerAsset from "@/assets/carta/katrina-burger.png";
const katrinaBurger = katrinaBurgerAsset;
import banoCheddarAsset from "@/assets/carta/bano-cheddar.jpg";
const banoCheddar = banoCheddarAsset;
import pizzaComunAsset from "@/assets/carta/pizza-comun.jpg";
const pizzaComun = pizzaComunAsset;
import pizzaEspecialAsset from "@/assets/carta/pizza-especial.jpg";
const pizzaEspecial = pizzaEspecialAsset;
import pizzaDobleQuesoAsset from "@/assets/carta/pizza-doble-queso.jpg";
const pizzaDobleQueso = pizzaDobleQuesoAsset;
import pizzaPolloAsset from "@/assets/carta/pizza-pollo.jpg";
const pizzaPollo = pizzaPolloAsset;
import pizzaNapolitanaAsset from "@/assets/carta/pizza-napolitana.jpg";
const pizzaNapolitana = pizzaNapolitanaAsset;
import pizzaTerneraAsset from "@/assets/carta/pizza-ternera.jpg";
const pizzaTernera = pizzaTerneraAsset;
import pizzaMexicanaAsset from "@/assets/carta/pizza-mexicana.jpg";
const pizzaMexicana = pizzaMexicanaAsset;
import lomitoClasicoAsset from "@/assets/carta/lomito-clasico.jpg";
const lomitoClasico = lomitoClasicoAsset;
import lomitoKatrinaAsset from "@/assets/carta/lomito-katrina-v2.jpg";
const lomitoKatrina = lomitoKatrinaAsset;
import sandwichMilanesaAsset from "@/assets/carta/sandwich-milanesa.jpg";
const sandwichMilanesa = sandwichMilanesaAsset;
import milanesaKatrinaAsset from "@/assets/carta/milanesa-katrina.png";
const milanesaKatrina = milanesaKatrinaAsset;
import especialKatrinaAsset from "@/assets/carta/especial-katrina-v2.jpg";
const especialKatrina = especialKatrinaAsset;
import charlyGratinadoAsset from "@/assets/carta/charly-gratinado.png";
const charlyGratinado = charlyGratinadoAsset;
import nachosDesiertoAsset from "@/assets/carta/nachos-desierto.jpg";
const nachosDesierto = nachosDesiertoAsset;
import picadaFriaAsset from "@/assets/carta/picada-fria.png";
const picadaFria = picadaFriaAsset;
import picadaCalienteAsset from "@/assets/carta/picada-caliente.jpg";
const picadaCaliente = picadaCalienteAsset;
import hotdogCallejeroAsset from "@/assets/carta/hotdog-callejero.jpg";
const hotdogCallejero = hotdogCallejeroAsset;
import hotdogFronteraAsset from "@/assets/carta/hotdog-frontera.jpg";
const hotdogFrontera = hotdogFronteraAsset;
import hotdogEncamisadoAsset from "@/assets/carta/hotdog-encamisado.jpg";
const hotdogEncamisado = hotdogEncamisadoAsset;
import papasCheddarBaconAsset from "@/assets/carta/papas-cheddar-bacon.jpg";
const papasCheddarBacon = papasCheddarBaconAsset;
import papasClasicasAsset from "@/assets/carta/papas-clasicas.jpg";
const papasClasicas = papasClasicasAsset;
import salchipapasAsset from "@/assets/carta/salchipapas.jpg";
const salchipapas = salchipapasAsset;
import polloFritoAsset from "@/assets/carta/pollo-frito.jpg";
const polloFrito = polloFritoAsset;
import cheesecakeFrutosRojosAsset from "@/assets/carta/cheesecake-frutos-rojos.jpg";
const cheesecakeFrutosRojos = cheesecakeFrutosRojosAsset;
import cheesecakeMaracuyaAsset from "@/assets/carta/cheesecake-maracuya.jpg";
const cheesecakeMaracuya = cheesecakeMaracuyaAsset;
import postreOreoAsset from "@/assets/carta/postre-oreo.jpg";
const postreOreo = postreOreoAsset;
import tiramisuAsset from "@/assets/carta/tiramisu.jpg";
const tiramisu = tiramisuAsset;
import bandejaHamburguesasAsset from "@/assets/carta/bandeja-hamburguesas.jpg";
const bandejaHamburguesas = bandejaHamburguesasAsset;
import hamburguesasPanesColoresAsset from "@/assets/carta/hamburguesas-panes-colores.jpg";
const hamburguesasPanesColores = hamburguesasPanesColoresAsset;
import lomoChampinonAsset from "@/assets/carta/lomo-champinon.jpg";
const lomoChampinon = lomoChampinonAsset;
import licorPepinoAsset from "@/assets/barra/licor-pepino.jpg";
const licorPepino = licorPepinoAsset;
import limonadaFrutosRojosAsset from "@/assets/barra/limonada-frutos-rojos.jpg";
const limonadaFrutosRojos = limonadaFrutosRojosAsset;
import tragoDobleColadoAsset from "@/assets/barra/trago-doble-colado.jpg";
const tragoDobleColado = tragoDobleColadoAsset;
import tragoNaranjaAsset from "@/assets/barra/trago-naranja.png";
const tragoNaranja = tragoNaranjaAsset;
import tragoMentaAsset from "@/assets/barra/trago-menta.png";
const tragoMenta = tragoMentaAsset;
import daiquiriFrutillaAsset from "@/assets/barra/daiquiri-frutilla.png";
const daiquiriFrutilla = daiquiriFrutillaAsset;
import daiquiriRocasAsset from "@/assets/barra/daiquiri-rocas.png";
const daiquiriRocas = daiquiriRocasAsset;
import frozenDaiquiriAsset from "@/assets/barra/frozen-daiquiri.png";
const frozenDaiquiri = frozenDaiquiriAsset;
import sexOnTheBeachAsset from "@/assets/barra/sex-on-the-beach.png";
const sexOnTheBeach = sexOnTheBeachAsset;
import jarraGanciaAsset from "@/assets/barra/jarra-gancia.png";
const jarraGancia = jarraGanciaAsset;
import picadaFriaV2Asset from "@/assets/carta/picada-fria-v2.png";
const picadaFriaV2 = picadaFriaV2Asset;
import banoCheddarV2Asset from "@/assets/carta/bano-cheddar-v2.png";
const banoCheddarV2 = banoCheddarV2Asset;
import tacosCarneAsset from "@/assets/carta/tacos-carne.png";
const tacosCarne = tacosCarneAsset;
import milanesaNapolitanaDosAsset from "@/assets/carta/milanesa-napolitana-dos.png";
const milanesaNapolitanaDos = milanesaNapolitanaDosAsset;
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
  kind?: "cocina" | "barra";
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
      { name: "Baño de Cheddar", price: "$3.000", description: "Adicional para cualquier hamburguesa.", photo: banoCheddarV2 },
      { name: "Bandeja de Hamburguesas", price: "Consultar", description: "Para compartir: varias hamburguesas con papas al centro.", photo: bandejaHamburguesas },
      { name: "Hamburguesas con Panes de Colores", price: "Consultar", description: "Panes artesanales de colores realizados por Carmelo.", photo: hamburguesasPanesColores },
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
      { name: "Lomo Katrina", price: "Consultar", description: "Nuestro lomo con la impronta Katrina." },
      { name: "Lomo al Champiñón", price: "Consultar", description: "Con papas españolas y salsa de champiñones.", photo: lomoChampinon },
      { name: "Milanesa Napolitana para 2 personas", price: "Consultar", description: "Milanesa napolitana para compartir entre dos.", photo: milanesaNapolitanaDos },
    ],
  },
  {
    id: "compartir",
    label: "Para Compartir",
    subtitle: "Noche mexicana y tablas",
    items: [
      { name: "Tacos del Norte", price: "$12.000 / $20.000", description: "Carne, pollo o mixtos. 3 tortillas (1p) · 6 tortillas (2p).", photo: tacosCarne },
      { name: "Charly Gratinado", price: "$18.000 / $30.000", description: "Pan de miga, ternera, verdura, queso y papas. Chico / Grande.", photo: charlyGratinado },
      { name: "Nachos del Desierto", price: "Consultar", description: "Con dip de guacamole y cheddar.", photo: nachosDesierto },
      { name: "Picada Fría", price: "$20.000", description: "Salame, jamón, muzarella, cheddar, aceitunas, papas Lays y maní. 2p.", photo: picadaFriaV2 },
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
  {
    id: "barra",
    label: "Barra",
    subtitle: "Tragos y cervezas — precios a consultar",
    kind: "barra",
    items: [
      { name: "Daiquiri de Frutilla", price: "Consultar", description: "O combinado con durazno. Sin alcohol.", photo: daiquiriFrutilla },
      { name: "Daiquiri en Rocas", price: "Consultar", photo: daiquiriRocas },
      { name: "Frozen / Daiquiri", price: "Consultar", photo: frozenDaiquiri },
      { name: "Sex on the Beach", price: "Consultar", photo: sexOnTheBeach },
      { name: "Jarra de Gancia", price: "Consultar", photo: jarraGancia },
      { name: "Trago con Menta", price: "Consultar", photo: tragoMenta },
      { name: "Trago de Naranja", price: "Consultar", photo: tragoNaranja },
      { name: "Trago Doble Colado", price: "Consultar", photo: tragoDobleColado },
      { name: "Licor de Pepino", price: "Consultar", photo: licorPepino },
      { name: "Limonada de Frutos Rojos", price: "Consultar", photo: limonadaFrutosRojos },
    ],
  },
];

export function MenuGrid() {
  const [index, setIndex] = useState(0);
  const { ref, visible } = useInView<HTMLDivElement>();
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HTMLDivElement | null>(null);

  const active = CATEGORIES[index];

  const selectCategory = (i: number) => {
    setIndex(i);
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const offset = isMobile ? 120 : 88;
    window.setTimeout(() => {
      const el = activeRef.current;
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }, 60);
  };


  return (
    <section id="carta" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">

        <div
          ref={ref}
          className={`fade-up mb-10 text-center ${visible ? "is-visible" : ""}`}
        >
          <span className="text-xs uppercase tracking-[0.4em] text-white/50">
            La Carta
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            <span className="text-neon-gradient">Cocina</span> &amp; Barra
          </h2>
        </div>

        <div className="mb-4 text-center text-[11px] uppercase tracking-[0.35em] text-white/60">
          {active.kind === "barra" ? "· Barra ·" : "· Cocina ·"}
        </div>

        {/* Tabs (sticky on mobile) */}
        <div
          ref={tabsRef}
          style={{ touchAction: "pan-x", overscrollBehaviorX: "contain" }}
          className="sticky top-14 z-30 mb-8 -mx-6 flex flex-nowrap justify-start gap-2 overflow-x-auto border-b border-white/5 bg-[#0b0713]/85 px-6 py-3 backdrop-blur-md md:static md:mx-0 md:flex-wrap md:justify-center md:overflow-visible md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none"
        >
          {CATEGORIES.map((cat, i) => {
            const isActive = i === index;
            return (
              <button
                key={cat.id}
                onClick={() => selectCategory(i)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-all ${

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

        {/* Active category only */}
        <div ref={activeRef} className="relative scroll-mt-32">
          <div className="mb-6 text-center">
            <p className="text-sm text-white/60">{active.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {active.items.map((item, i) => (
              <MenuCard
                key={`${active.id}-${item.name}`}
                item={item}
                pizzaMode={active.priceMode === "pizza"}
                index={i}
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
  const [expanded, setExpanded] = useState(false);
  const priceNode = !pizzaMode && item.price ? (
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
  ) : null;

  return (
    <div
      ref={ref}
      className={`menu-card fade-up overflow-hidden ${visible ? "is-visible" : ""}`}
      style={{ transitionDelay: `${index * 40}ms` }}
    >
      {/* Mobile compact row (tap to expand) */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 p-3 text-left md:hidden"
      >
        {item.photo ? (
          <img
            src={item.photo}
            alt={item.name}
            loading="lazy"
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="menu-photo h-16 w-16 shrink-0 rounded-lg" aria-hidden />
        )}
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <h3 className="min-w-0 truncate font-display text-base leading-tight">{item.name}</h3>
          {priceNode}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-white/5 px-4 pb-4 pt-3 md:hidden">
          {item.photo && (
            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg mb-3">
              <img src={item.photo} alt={item.name} className="h-full w-full object-cover" />
            </div>
          )}
          {item.description && (
            <p className="text-sm leading-relaxed text-white/70">{item.description}</p>
          )}
          {pizzaMode && (
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
              <PizzaPrice label="Entera" value={item.priceWhole} />
              <PizzaPrice label="Media" value={item.priceHalf} />
            </div>
          )}
        </div>
      )}

      {/* Desktop / tablet full card */}
      <div className="hidden h-full flex-col md:flex">
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
            {priceNode}
          </div>
          {item.description && (
            <p className="mt-2 text-sm leading-relaxed text-white/60">{item.description}</p>
          )}
          {pizzaMode && (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
              <PizzaPrice label="Entera" value={item.priceWhole} />
              <PizzaPrice label="Media" value={item.priceHalf} />
            </div>
          )}
        </div>
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
