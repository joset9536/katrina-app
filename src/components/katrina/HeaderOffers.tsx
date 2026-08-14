import { useEffect, useState } from "react";

const OFFERS = [
  { emoji: "🍸", label: "Candy" },
  { emoji: "🥃", label: "2×1" },
  { emoji: "🍓", label: "Frozen" },
  { emoji: "🍺", label: "Barra" },
];

export function HeaderOffers() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % OFFERS.length), 3200);
    return () => window.clearInterval(t);
  }, []);

  const current = OFFERS[i];
  const next = OFFERS[(i + 1) % OFFERS.length];

  return (
    <div className="header-offers" aria-label="Promos de barra">
      <span className="header-offer-thumb is-front" title={current.label}>
        {current.emoji}
      </span>
      <span className="header-offer-thumb is-back" aria-hidden>
        {next.emoji}
      </span>
    </div>
  );
}
