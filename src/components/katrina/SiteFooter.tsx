import { Instagram, MapPin, Clock, Phone } from "lucide-react";
import { KatrinaMark } from "./KatrinaMark";
import { useInView } from "@/hooks/use-in-view";
import { whatsappOrderUrl } from "@/lib/whatsapp";

export function SiteFooter() {
  const { ref, visible } = useInView<HTMLDivElement>();
  return (
    <footer id="contacto" className="relative border-t border-white/10 py-20">
      <div
        ref={ref}
        className={`fade-up mx-auto max-w-6xl px-6 ${visible ? "is-visible" : ""}`}
      >
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <span className="text-xs uppercase tracking-[0.4em] text-white/50">
              Dirección
            </span>
            <div className="mt-3 flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 text-white/70" />
              <div>
                <p className="text-sm">Egüés 517</p>
                <p className="text-sm text-white/60">Orán, Salta</p>
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs uppercase tracking-[0.4em] text-white/50">
              Horarios
            </span>
            <div className="mt-3 flex items-start gap-3">
              <Clock size={18} className="mt-0.5 text-white/70" />
              <div>
                <p className="text-sm">Todos los días</p>
                <p className="text-sm text-white/60">19:00 · 02:00 hs</p>
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs uppercase tracking-[0.4em] text-white/50">
              Contacto
            </span>
            <div className="mt-3 flex flex-col gap-3">
              <a
                href={whatsappOrderUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link inline-flex items-center gap-2 text-sm"
              >
                <Phone size={16} /> WhatsApp
              </a>
              <a
                href="#"
                className="nav-link inline-flex items-center gap-2 text-sm"
              >
                <Instagram size={16} /> Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-3 border-t border-white/10 pt-8">
          <KatrinaMark size={48} />
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">
            Katrina · Orán, Salta
          </p>
        </div>
      </div>
    </footer>
  );
}
