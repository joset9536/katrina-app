import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "@/hooks/use-in-view";
import { MenuSwiper, type FlatMenuItem } from "./MenuSwiper";
import { ItemOrderControls } from "./ItemOrderControls";


import classicBurgerAsset from "@/assets/carta/classic-burger.jpg";
const classicBurger = classicBurgerAsset;
import dobleBurgerAsset from "@/assets/carta/doble-burger.png";
const dobleBurger = dobleBurgerAsset;
import katrinaBurgerAsset from "@/assets/carta/katrina-burger.png";
const katrinaBurger = katrinaBurgerAsset;

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
import charlyGratinadoAsset from "@/assets/carta/charly-gratinado-v2.jpg";
const charlyGratinado = charlyGratinadoAsset;
import nachosDesiertoAsset from "@/assets/carta/nachos-desierto.jpg";
const nachosDesierto = nachosDesiertoAsset;

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
import lomoChampinonAsset from "@/assets/carta/lomo-champinon.jpg";
const lomoChampinon = lomoChampinonAsset;
import lomoKatrinaAsset from "@/assets/carta/lomo-katrina.jpg";
const lomoKatrina = lomoKatrinaAsset;
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
import { MENU_CATEGORIES, fetchLiveMenuByCategory, type MenuCategory, type MenuItem } from "@/data/menu";

type Item = MenuItem & { photo?: string };

type CategoryData = Omit<MenuCategory, "items"> & { items: Item[] };

// Fotos por nombre exacto del item (el texto/precio vive en src/data/menu.ts,
// unica fuente de verdad compartida con el asistente de IA).
const PHOTO_BY_NAME: Record<string, string> = {
  "Classic Burger": classicBurger,
  "Doble Burger": dobleBurger,
  "Katrina Burger": katrinaBurger,
  "Baño de Cheddar": banoCheddarV2,
  "Bandeja de Hamburguesas": bandejaHamburguesas,
  "Pizza Común": pizzaComun,
  "Pizza Especial": pizzaEspecial,
  "Pizza Doble Queso": pizzaDobleQueso,
  "Pizza de Pollo": pizzaPollo,
  "Pizza Napolitana": pizzaNapolitana,
  "Pizza de Ternera": pizzaTernera,
  "Pizza Mexicana": pizzaMexicana,
  "Lomito Clásico": lomitoClasico,
  "Lomito Katrina": lomitoKatrina,
  "Sándwich de Milanesa": sandwichMilanesa,
  "Milanesa Katrina": milanesaKatrina,
  "Especial Katrina": especialKatrina,
  "Lomo Katrina": lomoKatrina,
  "Lomo al Champiñón": lomoChampinon,
  "Milanesa Napolitana para 2 personas": milanesaNapolitanaDos,
  "Tacos del Norte": tacosCarne,
  "Charly Gratinado": charlyGratinado,
  "Nachos del Desierto": nachosDesierto,
  "Picada Fría": picadaFriaV2,
  "Picada Caliente": picadaCaliente,
  "Hot Dog Callejero": hotdogCallejero,
  "Hot Dog Frontera": hotdogFrontera,
  "Hot Dog Encamisado": hotdogEncamisado,
  "Papas con Cheddar & Bacon": papasCheddarBacon,
  "Papas Clásicas": papasClasicas,
  Salchipapas: salchipapas,
  "Pollo Frito con Papas": polloFrito,
  "Mini Cheesecake de Frutos Rojos": cheesecakeFrutosRojos,
  "Mini Cheesecake de Maracuyá": cheesecakeMaracuya,
  "Postre Oreo": postreOreo,
  Tiramisú: tiramisu,
  "Daiquiri de Frutilla": daiquiriFrutilla,
  "Daiquiri en Rocas": daiquiriRocas,
  "Frozen / Daiquiri": frozenDaiquiri,
  "Sex on the Beach": sexOnTheBeach,
  "Jarra de Gancia": jarraGancia,
  "Trago con Menta": tragoMenta,
  "Trago de Naranja": tragoNaranja,
  "Trago Doble Colado": tragoDobleColado,
  "Licor de Pepino": licorPepino,
  "Limonada de Frutos Rojos": limonadaFrutosRojos,
};

function withPhotos(categories: MenuCategory[]): CategoryData[] {
  return categories.map((cat) => ({
    ...cat,
    items: cat.items.map((item) => ({
      ...item,
      photo: PHOTO_BY_NAME[item.photoKey ?? item.name],
    })),
  }));
}

const BASE_CATEGORIES: CategoryData[] = withPhotos(MENU_CATEGORIES);

export function MenuGrid() {
  const [index, setIndex] = useState(0);
  const [categories, setCategories] = useState<CategoryData[]>(BASE_CATEGORIES);
  const [swipePos, setSwipePos] = useState(0);
  const { ref, visible } = useInView<HTMLDivElement>();
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HTMLDivElement | null>(null);

  // Todos los platos en una sola lista, en orden, para el modo swipe mobile.
  const flat = useMemo<FlatMenuItem[]>(
    () =>
      categories.flatMap((cat, ci) =>
        cat.items.map((item) => ({
          ...item,
          categoryIndex: ci,
          categoryLabel: cat.label,
          pizzaMode: cat.priceMode === "pizza",
        })),
      ),
    [categories],
  );

  // La dueña puede editar precios/nombres desde /owner (tabla menu_items en
  // Supabase). Si no hay nada cargado ahi todavia, se queda con el texto fijo.
  useEffect(() => {
    let mounted = true;
    fetchLiveMenuByCategory().then((live) => {
      if (!mounted || !live) return;
      const merged = MENU_CATEGORIES.map((cat) => ({
        ...cat,
        items: live[cat.id]?.length ? live[cat.id] : cat.items,
      }));
      setCategories(withPhotos(merged));
    });
    return () => {
      mounted = false;
    };
  }, []);

  const active = categories[index];

  const selectCategory = (i: number) => {
    setIndex(i);
    // Al tocar una pestaña, el modo swipe mobile salta al primer plato de esa categoria.
    const firstInCat = flat.findIndex((it) => it.categoryIndex === i);
    if (firstInCat >= 0) setSwipePos(firstInCat);

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const offset = isMobile ? 120 : 88;
    window.setTimeout(() => {
      const el = activeRef.current;
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }, 60);
  };

  // El swipe mobile puede cruzar de una categoria a otra deslizando — cuando
  // eso pasa, sincronizamos la pestaña activa arriba sin volver a saltar el
  // swipe (por eso esto no llama a selectCategory).
  const handleSwipePos = (next: number) => {
    setSwipePos(next);
    const newCat = flat[next]?.categoryIndex;
    if (newCat !== undefined && newCat !== index) setIndex(newCat);
  };


  return (
    <section id="carta" className="relative py-12 md:py-20">
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
          {categories.map((cat, i) => {
            const isActive = i === index;
            return (
              <button
                key={cat.id}
                onClick={() => selectCategory(i)}
                className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] transition-all md:px-3 md:py-1.5 md:text-xs ${

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

          <MenuSwiper flat={flat} pos={swipePos} onPosChange={handleSwipePos} />

          <div className="hidden gap-3 sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
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
      <div className="flex h-full flex-col">
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
          <div className="menu-photo flex aspect-[4/3] w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-white/40">
            Foto pendiente
          </div>
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
          <ItemOrderControls
            name={item.name}
            price={item.price}
            pizzaMode={pizzaMode}
            priceWhole={item.priceWhole}
            priceHalf={item.priceHalf}
          />
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
