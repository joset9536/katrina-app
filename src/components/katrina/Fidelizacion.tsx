import { useInView } from "@/hooks/use-in-view";
import { Gift, Ticket, Percent } from "lucide-react";

const PERKS = [
  {
    icon: Gift,
    title: "Regalos",
    body: "Detalles de la casa para quienes vuelven una y otra vez.",
  },
  {
    icon: Ticket,
    title: "Invitaciones",
    body: "Acceso a eventos privados, previas y noches especiales.",
  },
  {
    icon: Percent,
    title: "Descuentos",
    body: "Beneficios acumulables en cocina y barra.",
  },
];

export function Fidelizacion() {
  const { ref, visible } = useInView<HTMLDivElement>();
  return (
    <section id="fidelizacion" className="relative py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div
          ref={ref}
          className={`fade-up mb-10 text-center ${visible ? "is-visible" : ""}`}
        >
          <span className="text-xs uppercase tracking-[0.4em] text-white/50">
            Comunidad Katrina
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            <span className="text-neon-gradient">Fidelización</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/70">
            Premiamos a los clientes fieles con regalos, invitaciones y
            descuentos. En cada mesa vas a encontrar cartoncitos físicos para
            sumar al sistema y empezar a acumular beneficios.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PERKS.map((p) => (
            <div key={p.title} className="menu-card p-6 text-center">
              <div
                className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                  border:
                    "1px solid color-mix(in oklab, var(--neon-purple) 45%, transparent)",
                  boxShadow:
                    "0 0 18px color-mix(in oklab, var(--neon-purple) 35%, transparent)",
                }}
              >
                <p.icon size={20} />
              </div>
              <h3 className="mb-2 font-display text-xl">{p.title}</h3>
              <p className="text-sm text-white/60">{p.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs uppercase tracking-[0.3em] text-white/50">
          Pedí tu cartoncito al mozo · Sumá visitas · Canjeá beneficios
        </p>
      </div>
    </section>
  );
}
