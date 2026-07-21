import { useEffect, useState } from "react";

type Sign = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  color: string; // css color for glow
  href?: string;
};

const SIGNS: Sign[] = [
  {
    id: "candy-coctels",
    emoji: "🍸",
    title: "Candy Coctels",
    subtitle: "Colores intensos, sabores dulces",
    color: "#8B5CF6",
    href: "#promos",
  },
  {
    id: "2x1",
    emoji: "🥃",
    title: "2×1 todos los días",
    subtitle: "Vodka · Gin Tonic · Fernet",
    color: "#FF3D8A",
    href: "#promos",
  },
  {
    id: "burger-day",
    emoji: "🍔",
    title: "Día de la Hamburguesa",
    subtitle: "Arterias de Katrina + papas + bebida",
    color: "#E8B923",
    href: "#promos",
  },
  {
    id: "smirnoff",
    emoji: "🍾",
    title: "Smirnoff + 2 Speed",
    subtitle: "$28.000 · botella + energizantes",
    color: "#74ACDF",
    href: "#promos",
  },
];

const STORAGE_KEY = "katrina.dismissedSigns.v1";

function loadDismissed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function FloatingSigns() {
  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
    setDismissed(loadDismissed());
  }, []);

  // Reveal only after a delay OR after the user scrolls past the hero
  useEffect(() => {
    if (!mounted) return;
    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setRevealed(true);
      window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      if (window.scrollY > 320) reveal();
    };
    const t = window.setTimeout(reveal, 9000);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, [mounted]);

  const visible = SIGNS.filter((s) => !dismissed.includes(s.id));

  // Rotate one at a time every 9s
  useEffect(() => {
    if (!mounted || !revealed || visible.length <= 1) return;
    const t = window.setInterval(
      () => setCurrentIndex((i) => (i + 1) % visible.length),
      9000,
    );
    return () => window.clearInterval(t);
  }, [mounted, revealed, visible.length]);

  if (!mounted || !revealed || visible.length === 0) return null;


  const sign = visible[currentIndex % visible.length];

  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col gap-2 sm:bottom-6 sm:right-6"
      aria-live="polite"
    >
      <a
        key={sign.id}
        href={sign.href ?? "#promos"}
        className="float-sign pointer-events-auto flex items-center gap-3 no-underline"
        style={{
          borderColor: `${sign.color}66`,
          boxShadow: `0 0 22px ${sign.color}55, 0 0 46px ${sign.color}22`,
        }}
      >
        <span className="text-2xl leading-none" aria-hidden>
          {sign.emoji}
        </span>
        <span className="flex flex-col">
          <span className="font-semibold" style={{ color: sign.color, textShadow: `0 0 8px ${sign.color}88` }}>
            {sign.title}
          </span>
          <span className="text-xs text-white/70">{sign.subtitle}</span>
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            dismiss(sign.id);
          }}
          className="float-sign-close"
          aria-label={`Cerrar ${sign.title}`}
        >
          ×
        </button>
      </a>
    </div>
  );
}
