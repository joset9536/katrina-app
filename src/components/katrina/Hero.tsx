import { NeonButton } from "./NeonButton";
import { KatrinaMark } from "./KatrinaMark";
import { useInView } from "@/hooks/use-in-view";

const WHATSAPP = "https://wa.me/5493878631310";

export function Hero() {
  const { ref, visible } = useInView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section
      id="inicio"
      className="relative flex min-h-[100svh] items-start overflow-hidden pt-24 sm:pt-28"
      style={{ backgroundImage: "var(--gradient-hero)" }}
    >
      {/* Grok-style aurora blobs */}
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />

      {/* Smoke layers */}
      <div
        className="smoke-layer"
        style={{
          background:
            "radial-gradient(circle at 30% 40%, color-mix(in oklab, var(--neon-purple) 30%, transparent), transparent 60%)",
        }}
      />
      <div
        className="smoke-layer"
        style={{
          animationDelay: "-6s",
          background:
            "radial-gradient(circle at 70% 60%, color-mix(in oklab, var(--neon-red) 22%, transparent), transparent 60%)",
        }}
      />

      <div
        ref={ref}
        className={`fade-up relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start px-6 text-left ${
          visible ? "is-visible" : ""
        }`}
      >
        <div className="flex items-center gap-4 sm:gap-6">
          <KatrinaMark
            size={96}
            className="animate-[float_6s_ease-in-out_infinite]"
          />
          <span className="text-[0.7rem] uppercase tracking-[0.45em] text-white/50">
            Neón · Cocktails · Orán
          </span>
        </div>

        <h1 className="katrina-title relative mt-8 font-display text-[clamp(4rem,13vw,10rem)] font-bold leading-[0.9]">
          KATRINA
          <span className="katrina-title-sun" aria-hidden>
            <svg viewBox="0 0 32 32" className="h-full w-full">
              <circle cx="16" cy="16" r="5" fill="#FCBF49" />
              {Array.from({ length: 16 }).map((_, i) => {
                const a = (i * 22.5 * Math.PI) / 180;
                const inner = i % 2 === 0 ? 7 : 6.5;
                const outer = i % 2 === 0 ? 11.5 : 9.5;
                return (
                  <line
                    key={i}
                    x1={16 + Math.cos(a) * inner}
                    y1={16 + Math.sin(a) * inner}
                    x2={16 + Math.cos(a) * outer}
                    y2={16 + Math.sin(a) * outer}
                    stroke="#FCBF49"
                    strokeWidth={i % 2 === 0 ? "1.6" : "1"}
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-base text-white/70 md:text-lg">
          Bar de neón. Coctelería de autor, noches largas y ritual mexicano en el corazón de Orán.
        </p>

        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
          <NeonButton
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            className="btn-pulse"
          >
            Pedir a mi Mesa
          </NeonButton>
          <NeonButton href="#menu" variant="ghost" className="btn-pulse">
            Ver Carta
          </NeonButton>
        </div>
      </div>

      {/* bottom fade */}
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
