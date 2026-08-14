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
      className="relative flex min-h-[92svh] items-center overflow-hidden pb-14 pt-24 sm:pt-28"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #16101f 0%, #0b0713 70%, #07040d 100%)",
      }}
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

          <div className="hero-tag-box mt-5">
            <p className="hero-tag-line">
              {hasValidMesa
                ? `Mesa ${numero}. Mirá la carta, agregá lo que quieras y llamá al mozo.`
                : "Restobar de Orán. Hamburguesas, pizzas, picadas y tragos. Egüés 502."}
            </p>
          </div>

          {hasValidMesa && (
            <ol className="mt-5 w-full max-w-md space-y-2 text-left text-sm text-white/75">
              <li>1. Entrá a la carta</li>
              <li>2. Tocá Agregar (podés sumar varios)</li>
              <li>3. Llamá al mozo con el pedido</li>
            </ol>
          )}

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
          <KatrinaMark size={220} className="header-skull-mark mx-auto drop-shadow-[0_0_28px_rgba(255,61,138,0.45)]" />
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{ background: "linear-gradient(to bottom, transparent, var(--background))" }}
      />
    </section>
  );
}
