import { NeonButton } from "./NeonButton";
import { useInView } from "@/hooks/use-in-view";

const WHATSAPP = "https://wa.me/5493878631310";

export function Hero() {
  const { ref, visible } = useInView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section
      id="inicio"
      className="relative flex min-h-[92svh] items-center overflow-hidden pb-14 pt-24 sm:pt-28"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #16101f 0%, #0b0713 70%, #07040d 100%)",
      }}
    >
      <div
        ref={ref}
        className={`fade-up hero-main relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start justify-center gap-6 px-4 text-left sm:px-6 ${
          visible ? "is-visible" : ""
        }`}
      >
        <div className="flex min-w-0 flex-col items-start">
          <h1 className="hero-katrina-wordmark -ml-1 sm:-ml-2" aria-label="Katrina">
            <span className="katrina-title-calm">Katrina</span>
          </h1>

          <div className="hero-tag-box mt-5">
            <p className="hero-tag-line">
              El punto de encuentro nocturno de Orán. Coctelería, cocina de autor y ritual argentino.
            </p>
          </div>

          <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row">
            <NeonButton
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              className="btn-pulse"
            >
              Pedir a mi Mesa
            </NeonButton>
            <NeonButton href="#carta" variant="ghost" className="btn-pulse">
              Ver Carta
            </NeonButton>
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--background))",
        }}
      />
    </section>
  );
}
