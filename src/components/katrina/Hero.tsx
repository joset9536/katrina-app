import { NeonButton } from "./NeonButton";
import { useInView } from "@/hooks/use-in-view";
import { whatsappOrderUrl } from "@/lib/whatsapp";
import { useMesa } from "@/hooks/use-mesa";

export function Hero() {
  const { ref, visible } = useInView<HTMLDivElement>({ threshold: 0.1 });
  const { hasValidMesa, numero } = useMesa();

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
              {hasValidMesa
                ? `Mesa ${numero}. Mirá la carta, agregá lo que quieras y llamá al mozo.`
                : "El punto de encuentro nocturno de Orán. Hamburguesas, pizzas, picadas y tragos. Egüés 517."}
            </p>
          </div>

          <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row">
            <NeonButton href="#carta" variant="primary" className="btn-pulse min-h-12">
              {hasValidMesa ? "Ver carta de mi mesa" : "Ver Carta"}
            </NeonButton>
            <NeonButton
              href={whatsappOrderUrl()}
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost"
              className="btn-pulse min-h-12"
            >
              WhatsApp
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
