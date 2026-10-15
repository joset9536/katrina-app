import { useInView } from "@/hooks/use-in-view";
import { Sparkles, CalendarClock, Camera, Clock, Music } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const NEON_COLORS = ["#FF3D8A", "#8B5CF6", "#E8B923", "#74ACDF", "#FF6B00"];

function EventoProximamente({
  index,
  variant = "next",
}: {
  index: number;
  variant?: "next" | "past";
}) {
  const color = NEON_COLORS[index % NEON_COLORS.length];
  const icons: LucideIcon[] =
    variant === "next"
      ? [Sparkles, CalendarClock, Music]
      : [Camera, Clock, Sparkles];
  const Icon = icons[index % icons.length];
  const label = variant === "next" ? "Próximo evento" : "Evento pasado";
  const headline = variant === "next" ? "Muy pronto" : "En el recuerdo";
  const foot =
    variant === "next"
      ? "Estamos armando algo especial"
      : "Volvé a vernos, se viene material";

  return (
    <div
      className="group relative flex h-40 flex-col items-center justify-center overflow-hidden rounded-xl border p-5 text-center"
      style={{
        borderColor: `color-mix(in oklab, ${color} 55%, transparent)`,
        background: `radial-gradient(ellipse at 50% 20%, color-mix(in oklab, ${color} 14%, transparent) 0%, rgba(14,10,26,0.85) 55%, rgba(7,4,13,0.95) 100%)`,
        boxShadow: `0 0 22px color-mix(in oklab, ${color} 28%, transparent), inset 0 0 30px rgba(0,0,0,0.4)`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          background:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.9) 0 1px, transparent 1px 9px)",
        }}
      />
      <Icon
        size={28}
        style={{
          color,
          filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 14px color-mix(in oklab, ${color} 60%, transparent))`,
        }}
      />
      <span
        className="mt-2 text-[10px] uppercase tracking-[0.35em]"
        style={{ color: "color-mix(in oklab, white 70%, transparent)" }}
      >
        {label}
      </span>
      <span
        className="mt-1 font-display text-lg"
        style={{
          color: "#fff",
          textShadow: `0 0 10px color-mix(in oklab, ${color} 55%, transparent)`,
        }}
      >
        {headline}
      </span>
      <span className="mt-1 text-[10px] text-white/40">{foot}</span>
    </div>
  );
}


function FinalMundialRecuerdo() {
  return (
    <article
      className="relative overflow-hidden rounded-xl border p-5"
      style={{
        borderColor: "#74ACDF",
        background:
          "linear-gradient(160deg, rgba(116,172,223,0.10) 0%, rgba(14,10,26,0.9) 45%, rgba(232,185,35,0.08) 100%)",
        boxShadow: "inset 0 0 30px rgba(0,0,0,0.4)",
      }}
    >
      <div className="relative">
        <span
          className="text-[10px] uppercase tracking-[0.4em]"
          style={{ color: "color-mix(in oklab, white 70%, transparent)" }}
        >
          Evento pasado
        </span>
        <h4 className="mt-2 font-display text-xl leading-tight text-white/90">
          Final del Mundial
          <br />
          Argentina vs España
        </h4>
        <p className="mt-2 text-xs text-white/50">
          Pantalla gigante, la barra completa. Gracias por vivirla con nosotros.
        </p>
      </div>
    </article>
  );
}

export function Eventos() {
  const { ref, visible } = useInView<HTMLDivElement>();
  return (
    <section id="eventos" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div
          ref={ref}
          className={`fade-up mb-10 text-center ${visible ? "is-visible" : ""}`}
        >
          <span className="text-xs uppercase tracking-[0.4em] text-white/50">
            Agenda
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            <span className="text-neon-gradient">Eventos</span>
          </h2>
        </div>

        <div className="space-y-10">
          <div>
            <h3 className="mb-4 font-display text-2xl">Próximos eventos</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <EventoProximamente index={0} variant="next" />
              <EventoProximamente index={1} variant="next" />
              <EventoProximamente index={2} variant="next" />
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-display text-2xl">Eventos realizados</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <FinalMundialRecuerdo />
              <EventoProximamente index={1} variant="past" />
              <EventoProximamente index={2} variant="past" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
