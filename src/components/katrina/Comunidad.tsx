import { useInView } from "@/hooks/use-in-view";
import { Instagram, Facebook } from "lucide-react";

const SOCIALS = [
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://instagram.com/katrina.restobar",
    color: "#FF3D8A",
  },
  {
    icon: Facebook,
    label: "Facebook",
    href: "https://facebook.com/katrina.restobar",
    color: "#74ACDF",
  },
  {
    // TikTok icon isn't in lucide by default; reuse a musical mark
    icon: Instagram,
    label: "TikTok",
    href: "https://tiktok.com/@katrina.restobar",
    color: "#E8B923",
    isTikTok: true,
  },
];

function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden
    >
      <path d="M16.5 3a5.5 5.5 0 0 0 5 3.2v3.1a8.6 8.6 0 0 1-5-1.6v6.9a6.4 6.4 0 1 1-6.4-6.4c.3 0 .6 0 .9.1v3.2a3.2 3.2 0 1 0 2.3 3.1V3h3.2z" />
    </svg>
  );
}

export function Comunidad() {
  const { ref, visible } = useInView<HTMLDivElement>();
  return (
    <section id="comunidad" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div
          ref={ref}
          className={`fade-up mb-10 text-center ${visible ? "is-visible" : ""}`}
        >
          <span className="text-xs uppercase tracking-[0.4em] text-white/50">
            Comunidad
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            La <span className="text-neon-gradient">tribu</span> Katrina
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/70">
            Seguinos y compartí tus noches. Etiquetanos para aparecer en el
            muro.
          </p>
        </div>

        <div className="mb-12 flex flex-wrap justify-center gap-4">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border px-5 py-3 text-sm transition-all hover:scale-[1.03]"
              style={{
                borderColor: s.color,
                boxShadow: `0 0 18px color-mix(in oklab, ${s.color} 40%, transparent)`,
              }}
            >
              {s.isTikTok ? <TikTokIcon /> : <s.icon size={18} />}
              {s.label}
            </a>
          ))}
        </div>

        <h3 className="mb-4 text-center font-display text-2xl">
          Momentos de la tribu
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex aspect-square items-center justify-center rounded-xl border border-white/10 text-[10px] uppercase tracking-[0.3em] text-white/50"
              style={{
                background:
                  "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 10px, rgba(255,255,255,0.06) 10px 20px)",
              }}
            >
              Foto pendiente
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
