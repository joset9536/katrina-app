import { useEffect, useRef, useState, useCallback } from "react";
import { NeonButton } from "./NeonButton";

import argHolanda from "@/assets/videos/arg-holanda.mp4";
import asadoSeleccion from "@/assets/videos/asado-seleccion.mp4";
import julianGol from "@/assets/videos/julian-gol-suecia.mp4";

const WHATSAPP = "https://wa.me/5493878631310";

type Slide = {
  id: string;
  video: string;
  quote: string;
  author: string;
  role: string;
};

const SLIDES: Slide[] = [
  {
    id: "arg-holanda",
    video: argHolanda,
    quote: "La pelota no se mancha.",
    author: "Diego Armando Maradona",
    role: "Campeón del Mundo 1986",
  },
  {
    id: "julian-gol",
    video: julianGol,
    quote: "Los sueños se cumplen, yo soy la prueba de eso.",
    author: "Diego Armando Maradona",
    role: "El Diego",
  },
  {
    id: "asado",
    video: asadoSeleccion,
    quote: "Se sufre más el no intentarlo que el fracaso.",
    author: "Lionel Messi",
    role: "Capitán y Campeón del Mundo 2022",
  },
];

export function WorldCupBanner() {
  const [index, setIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length),
    [],
  );

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i !== index) {
        v.pause();
        v.currentTime = 0;
      }
    });
  }, [index]);

  return (
    <section aria-label="Mundial 2026 en Katrina" className="relative px-4 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 text-center">
          <span className="wc-kicker">Mundial 2026</span>
          <h2 className="wc-title wc-title-sm mt-4">Lo vivimos en Katrina</h2>
          <p className="wc-detail mt-4">
            Miércoles 15 de julio · 16 hs · Egüés 502, Orán, Salta
          </p>
        </div>

        <div className="wc-screen relative overflow-hidden rounded-2xl">
          <div className="wc-scanlines pointer-events-none absolute inset-0" />

          <div className="relative min-h-[520px] sm:min-h-[420px]">
            {SLIDES.map((slide, i) => (
              <div
                key={slide.id}
                className={`wc-slide absolute inset-0 flex flex-col sm:flex-row ${
                  i === index ? "wc-slide-active" : ""
                }`}
                aria-hidden={i !== index}
              >
                <div className="relative flex w-full items-center justify-center bg-black/50 sm:w-1/2">
                  <video
                    ref={(el) => { videoRefs.current[i] = el; }}
                    src={slide.video}
                    controls
                    playsInline
                    preload="none"
                    className="max-h-[280px] w-full object-contain sm:max-h-[420px]"
                  />
                </div>
                <div className="flex w-full flex-col items-center justify-center px-6 py-8 text-center sm:w-1/2 sm:px-10">
                  <p className="wc-title-sm font-display italic leading-snug">
                    "{slide.quote}"
                  </p>
                  <span className="mt-4 text-sm font-semibold tracking-wide text-white">
                    {slide.author}
                  </span>
                  <span className="mt-1 text-xs uppercase tracking-[0.25em] text-white/50">
                    {slide.role}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => go(-1)}
            className="carousel-arrow absolute left-3 top-1/2 z-10 -translate-y-1/2"
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            onClick={() => go(1)}
            className="carousel-arrow absolute right-3 top-1/2 z-10 -translate-y-1/2"
            aria-label="Siguiente"
          >
            ›
          </button>

          <div className="absolute inset-x-0 bottom-4 z-10 flex items-center justify-center gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === index ? "w-6 bg-white/80" : "w-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <NeonButton
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            className="btn-pulse"
          >
            Reservar mesa para el partido
          </NeonButton>
        </div>
      </div>
    </section>
  );
}
