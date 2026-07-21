import { useEffect, useRef } from "react";
import { useInView } from "@/hooks/use-in-view";

import { MapPin } from "lucide-react";
import { NeonButton } from "./NeonButton";

import patio01Asset from "@/assets/patio/patio-01.png";
import patio02Asset from "@/assets/patio/patio-02.png";
import patio03Asset from "@/assets/patio/patio-03.png";
import patio04Asset from "@/assets/patio/patio-04.png";

const BORDER_COLORS = ["#FF3D8A", "#E8B923", "#8B5CF6", "#74ACDF", "#FF6B00"];

type Photo = { src?: string; label: string };

const PHOTOS: Photo[] = [
  { src: patio01Asset, label: "Patio" },
  { src: patio02Asset, label: "Ambiente" },
  { src: patio03Asset, label: "Segundo piso" },
  { src: patio04Asset, label: "Entrada" },
  { label: "Frente" },
  { label: "Terraza" },
  { label: "Cafetería" },
  { label: "VIP" },
  { label: "Salón" },
  { label: "Ingreso" },
  { label: "Vereda" },
];

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("Egüés 517, Orán, Salta");

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
      const next =
        el.scrollLeft + tileW >= maxScroll ? 0 : el.scrollLeft + tileW;
      el.scrollTo({ left: next, behavior: "smooth" });
    }, 4000);
    return () => {
      window.clearInterval(id);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("touchstart", pause);
    };
  }, []);

  return (
    <section id="identidad" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div
          ref={ref}
          className={`fade-up mb-10 text-center ${visible ? "is-visible" : ""}`}
        >
          <span className="text-xs uppercase tracking-[0.4em] text-white/50">
            Identidad
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            Quiénes <span className="text-neon-gradient">somos</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/70">
            Katrina es el punto de encuentro nocturno de Orán: coctelería,
            cocina y buena música en un ambiente pensado para vivirlo con los
            tuyos.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <MapPin size={16} className="text-white/60" />
              Egüés 517, Orán, Salta
            </div>
            <NeonButton
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost"
            >
              Cómo llegar
            </NeonButton>
          </div>

        </div>


        <div ref={scrollerRef} className="no-scrollbar flex gap-4 overflow-x-auto pb-4">
          {PHOTOS.map((p, i) => {
            const color = BORDER_COLORS[i % BORDER_COLORS.length];
            return (
              <div
                key={p.label}
                className="gallery-tile shrink-0 overflow-hidden rounded-xl"
                style={{
                  width: "min(78vw, 320px)",
                  borderColor: color,
                  boxShadow: `0 0 18px color-mix(in oklab, ${color} 45%, transparent)`,
                }}
              >
                {p.src ? (
                  <img
                    src={p.src}
                    alt={p.label}
                    loading="lazy"
                    className="h-56 w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-56 w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-white/50"
                    style={{
                      background:
                        "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 10px, rgba(255,255,255,0.06) 10px 20px)",
                    }}
                  >
                    Foto pendiente
                  </div>
                )}
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
