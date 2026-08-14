import { useInView } from "@/hooks/use-in-view";
import pantallaFutbol from "@/assets/noches/pantalla-futbol.jpg";
import musicaNoche from "@/assets/noches/musica-noche.jpg";
import barra from "@/assets/noches/barra.jpg";
import cocina from "@/assets/noches/cocina.jpg";

const NOCHES = [
  {
    src: pantallaFutbol,
    title: "Pantalla y fútbol",
    body: "Los partidos se miran en el local. Si hay fecha especial, se avisa en la mesa.",
  },
  {
    src: musicaNoche,
    title: "Música de noche",
    body: "El salón se arma para quedarse: música, barra y mesa larga.",
  },
  {
    src: barra,
    title: "Barra",
    body: "Tragos y vasos fríos. Pedí por el QR o llamá al mozo.",
  },
  {
    src: cocina,
    title: "Cocina",
    body: "Hamburguesas, pizzas y picadas que salen de acá a tu mesa.",
  },
];

export function Eventos() {
  const { ref, visible } = useInView<HTMLDivElement>();
  return (
    <section id="eventos" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div ref={ref} className={`fade-up mb-10 text-center ${visible ? "is-visible" : ""}`}>
          <span className="text-xs uppercase tracking-[0.4em] text-white/50">De noche</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            <span className="text-neon-gradient">En Katrina</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">
            Pantalla, música, barra y cocina. Lo que pasa en el local.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {NOCHES.map((n) => (
            <article
              key={n.title}
              className="overflow-hidden rounded-xl border border-[#C4A35A]/25 bg-black/45 shadow-[0_0_18px_rgba(196,163,90,0.12)]"
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img src={n.src} alt={n.title} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl">{n.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{n.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
