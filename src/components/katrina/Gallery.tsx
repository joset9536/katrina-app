import { useInView } from "@/hooks/use-in-view";

import patio01 from "@/assets/patio/patio-01.png";
import patio02 from "@/assets/patio/patio-02.png";
import patio03 from "@/assets/patio/patio-03.png";
import patio04 from "@/assets/patio/patio-04.png";
import patio05 from "@/assets/patio/patio-05.png";

const BORDER_COLORS = ["#FF3D8A", "#E8B923", "#8B5CF6", "#74ACDF", "#FF6B00"];

const PHOTOS = [
  { src: patio01, label: "El salón" },
  { src: patio02, label: "Ambiente" },
  { src: patio03, label: "Segundo piso" },
  { src: patio04, label: "Entrada" },
  { src: patio05, label: "Frente del local" },
];

export function Gallery() {
  const { ref, visible } = useInView<HTMLDivElement>();

  return (
    <section id="galeria" className="relative py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div
          ref={ref}
          className={`fade-up mb-10 text-center ${visible ? "is-visible" : ""}`}
        >
          <span className="text-xs uppercase tracking-[0.4em] text-white/50">
            Conocé el lugar
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            La <span className="text-neon-gradient">experiencia</span> Katrina
          </h2>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {PHOTOS.map((p, i) => (
            <div
              key={p.label}
              className="gallery-tile shrink-0 overflow-hidden rounded-xl"
              style={{
                width: "min(78vw, 320px)",
                borderColor: BORDER_COLORS[i % BORDER_COLORS.length],
                boxShadow: `0 0 18px color-mix(in oklab, ${BORDER_COLORS[i % BORDER_COLORS.length]} 45%, transparent)`,
              }}
            >
              <img
                src={p.src}
                alt={p.label}
                loading="lazy"
                className="h-56 w-full object-cover"
              />
              <div className="px-3 py-2 text-center text-xs uppercase tracking-[0.2em] text-white/70">
                {p.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
