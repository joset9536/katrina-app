import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { KatrinaMark } from "./KatrinaMark";
import { HeaderOffers } from "./HeaderOffers";
import { whatsappOrderUrl } from "@/lib/whatsapp";

const NAV = [
  { href: "#carta", label: "Carta" },
  { href: "#eventos", label: "Noches" },
  { href: "#identidad", label: "Identidad" },
  { href: "#contacto", label: "Contacto" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const scrollToY = (targetY: number, duration = 1600) => {
      const startY = window.scrollY;
      const diff = targetY - startY;
      if (Math.abs(diff) < 2) return;
      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const t = Math.min(1, (ts - start) / duration);
        window.scrollTo(0, startY + diff * easeInOutCubic(t));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const id = href.slice(1);
      const el = id ? document.getElementById(id) : null;
      if (!el && id !== "inicio") return;
      e.preventDefault();
      setMenuOpen(false);
      const y = el ? el.getBoundingClientRect().top + window.scrollY - 60 : 0;
      scrollToY(y, 1600);
      history.replaceState(null, "", href);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 ${
        scrolled ? "site-header-scrolled" : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-black/40 text-white/90 backdrop-blur-sm transition hover:bg-white/10 md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <a href="#inicio" className="hidden min-w-0 items-center gap-3 sm:flex">
            <span className="header-katrina-mark truncate" aria-label="Katrina">
              <span className="katrina-title-calm">KATRINA</span>
            </span>
          </a>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="nav-link text-sm">
              {item.label}
            </a>
          ))}
          <a href="/salon" className="nav-link text-sm">
            Iniciar sesión
          </a>
        </nav>
        <div className="ml-2 flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href={whatsappOrderUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center rounded-full border border-white/15 bg-black/40 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/85"
          >
            WhatsApp
          </a>
          <HeaderOffers />
          <a href="#inicio" aria-label="Katrina — inicio" className="inline-flex items-center justify-center">
            <KatrinaMark size={44} className="header-skull-look" />
          </a>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 top-[64px] z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <nav
            className="absolute left-3 top-full z-50 mt-2 flex w-[min(78vw,18rem)] flex-col gap-1 rounded-2xl border border-white/15 bg-[#0b0713]/95 p-3 shadow-2xl backdrop-blur-md"
            aria-label="Menú móvil"
          >
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="nav-link rounded-lg px-3 py-3 text-base hover:bg-white/5"
              >
                {item.label}
              </a>
            ))}
            <a href="/salon" className="nav-link rounded-lg px-3 py-3 text-base hover:bg-white/5">
              Iniciar sesión
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
