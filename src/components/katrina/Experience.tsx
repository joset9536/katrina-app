import { Flame, Moon, Sparkles } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

const PILLARS = [
  {
    icon: Moon,
    title: "Ambiente",
    body: "Luz baja, texturas cálidas y una banda sonora curada para la noche.",
  },
  {
    icon: Flame,
    title: "Mixología",
    body: "Coctelería de autor con destilados seleccionados y técnica clásica.",
  },
  {
    icon: Sparkles,
    title: "Ritual",
    body: "Cada trago es una escena: presentación, aroma y detalle en cada mesa.",
  },
];

export function Experience() {
  const { ref, visible } = useInView<HTMLDivElement>();
  return (
    <section id="experiencia" className="relative py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div
          ref={ref}
          className={`fade-up mb-14 text-center ${visible ? "is-visible" : ""}`}
        >
          <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
            La experiencia
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            Tres pilares, <span className="text-neon-gradient">una noche</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <PillarCard key={p.title} {...p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PillarCard({
  icon: Icon,
  title,
  body,
  index,
}: {
  icon: typeof Moon;
  title: string;
  body: string;
  index: number;
}) {
  const { ref, visible } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`menu-card fade-up p-8 ${visible ? "is-visible" : ""}`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <div
        className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          border: "1px solid color-mix(in oklab, var(--neon-purple) 45%, transparent)",
          boxShadow: "0 0 18px color-mix(in oklab, var(--neon-purple) 35%, transparent)",
        }}
      >
        <Icon size={20} className="text-foreground" />
      </div>
      <h3 className="mb-2 font-display text-2xl">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
