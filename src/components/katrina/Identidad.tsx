import { useEffect, useRef } from "react";
import { useInView } from "@/hooks/use-in-view";
import { MapPin } from "lucide-react";
import { NeonButton } from "./NeonButton";

import salonMesas from "@/assets/local/salon-mesas.jpg";
import barraNoche from "@/assets/local/barra-noche.jpg";
import genteBrindis from "@/assets/local/gente-brindis.jpg";
import musicaVivo from "@/assets/local/musica-vivo.jpg";
import picadaMesa from "@/assets/local/picada-mesa.jpg";
import qrMesa from "@/assets/local/qr-mesa.jpg";
import detalleVasos from "@/assets/local/detalle-vasos.jpg";

const BORDER_COLORS = ["#FF3D8A", "#E8B923", "#8B5CF6", "#74ACDF"];

const PHOTOS = [
  { src: salonMesas, label: "Salón" },
  { src: barraNoche, label: "Barra" },
  { src: genteBrindis, label: "La mesa" },
  { src: picadaMesa, label: "Picada" },
  { src: musicaVivo, label: "Música" },
  { src: qrMesa, label: "Pedido por QR" },
  { src: detalleVasos, label: "Tragos" },
];

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("Egüés 502, Orán, Salta");

export function Identidad() {
  const { ref, visible } = useInView<HTMLDivElement>();
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let pausedUntil = 0;
    const pause = () => {
      pausedUntil = Date.now() + 6000;
    };
    el.addEventListener("mouseenter", pause);
    el.addEventListener("touchstart", pause, { passive: true });
    const id = window.setInterval(() => {
      if (!el || Date.now() < pausedUntil) return;
      const tileW = el.firstElementChild
        ? (el.firstElementChild as HTMLElement).offsetWidth + 16
        : 320;
      const maxScroll = el.scrollWidth - el.clientWidth - 4;
      const next = el.scrollLeft + tileW >= maxScroll ? 0 : el.scrollLeft + tileW;
      el.scrollTo({ left: next, behavior: "smooth" });
    }, 4000);
    return () => {
      window.clearInterval(id);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("touchstart", pause);
    };
  }, []);

  return (
    <section id="identidad" className="relative py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div ref={ref} className={`fade-up mb-8 text-center ${visible ? "is-visible" : ""}`}>
          <span className="text-xs uppercase tracking-[0.4em] text-white/50">El lugar</span>
          <h2 className="mt-3 font-display text-3xl md:text-4xl">
            Egüés 502 · <span className="text-neon-gradient">Orán</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/65">
            Restobar de noche: hamburguesas, pizzas, picadas y tragos. Pedí desde la mesa con el QR.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <MapPin size={16} className="text-white/60" />
              Egüés 502, Orán, Salta
            </div>
            <NeonButton href={MAPS_URL} target="_blank" rel="noopener noreferrer" variant="ghost">
              Cómo llegar
            </NeonButton>
          </div>
        </div>

        <div ref={scrollerRef} className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
          {PHOTOS.map((p, i) => {
            const color = BORDER_COLORS[i % BORDER_COLORS.length];
            return (
              <div
                key={`${p.label}-${i}`}
                className="gallery-tile shrink-0 overflow-hidden rounded-xl"
                style={{
                  width: "min(72vw, 280px)",
                  borderColor: color,
                  boxShadow: `0 0 18px color-mix(in oklab, ${color} 45%, transparent)`,
                }}
              >
                <img src={p.src} alt={p.label} loading="lazy" className="h-48 w-full object-cover" />
                <div className="px-3 py-2 text-center text-xs uppercase tracking-[0.2em] text-white/70">
                  {p.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
