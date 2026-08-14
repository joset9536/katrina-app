import { NeonButton } from "./NeonButton";
import { KatrinaMark } from "./KatrinaMark";
import { useInView } from "@/hooks/use-in-view";
import { whatsappOrderUrl } from "@/lib/whatsapp";
import { useMesa } from "@/hooks/use-mesa";

export function Hero() {
  const { ref, visible } = useInView<HTMLDivElement>({ threshold: 0.1 });
  const { hasValidMesa, numero } = useMesa();

  return (
    <section
      id="inicio"
      className="relative flex items-center overflow-hidden pb-8 pt-20 md:min-h-[70svh] md:pb-14 md:pt-28"
      style={{ background: "#0b0713" }}
    >
      <div
        ref={ref}
        className={`fade-up hero-main relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-4 text-center sm:px-6 md:flex-row md:items-center md:text-left ${
          visible ? "is-visible" : ""
        }`}
      >
        <div className="flex min-w-0 flex-1 flex-col items-center md:items-start">
          <h1 className="hero-katrina-wordmark -ml-1 sm:-ml-2" aria-label="Katrina">
            <span className="katrina-title-calm">Katrina</span>
          </h1>

          <div className="hero-tag-box mt-4">
            <p className="hero-tag-line">
              {hasValidMesa ? `Mesa ${numero}. Carta → agregar → llamar mozo.` : "Egüés 502, Orán."}
            </p>
          </div>

          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row md:items-start">
            <NeonButton href="#carta" variant="primary" className="btn-pulse min-h-12">
              {hasValidMesa ? "Ver carta de mi mesa" : "Ver Carta"}
            </NeonButton>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("katrina:open-chat"))}
              className="btn-pulse inline-flex min-h-12 items-center justify-center rounded-full border border-[#FF3D8A]/50 px-6 text-sm font-semibold text-[#FF3D8A]"
            >
              Llamar mozo
            </button>
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
        <div className="shrink-0">
          <KatrinaMark
            size={200}
            className="header-skull-mark mx-auto w-24 md:w-52 drop-shadow-[0_0_28px_rgba(255,61,138,0.45)]"
          />
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{ background: "linear-gradient(to bottom, transparent, var(--background))" }}
      />
    </section>
  );
}
