import { useInView } from "@/hooks/use-in-view";
import { Music, Tv, GlassWater } from "lucide-react";

const NOCHES = [
  {
    icon: Tv,
    title: "Pantalla y fútbol",
    body: "Los partidos se miran en el local. Si hay fecha especial, se avisa en la mesa.",
  },
  {
    icon: Music,
    title: "Música de noche",
    body: "El salón se arma para quedarse: música, barra y mesa larga.",
  },
  {
    icon: GlassWater,
    title: "Barra y cocina",
    body: "Tragos, hamburguesas, pizzas y picadas. Pedí por el QR o llamá al mozo.",
  },
];

export function Eventos() {
  const { ref, visible } = useInView<HTMLDivElement>();
  return (
    <section id="eventos" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div ref={ref} className={`fade-up mb-10 text-center ${visible ? "is-visible" : ""}`}>
          <span className="text-xs uppercase tracking-[0.4em] text-white/50">De noche</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            <span className="text-neon-gradient">En Katrina</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">
            No hay calendario inventado. Esto es lo que pasa en el local, de verdad.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {NOCHES.map((n) => (
            <article
              key={n.title}
              className="rounded-xl border border-white/10 bg-black/40 p-6"
            >
              <n.icon className="text-[#FF3D8A]" size={26} />
              <h3 className="mt-4 font-display text-xl">{n.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{n.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
