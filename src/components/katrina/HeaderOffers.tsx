import { useEffect, useState } from "react";
import daiquiri from "@/assets/barra/daiquiri-frutilla.png";
import sexOnTheBeach from "@/assets/barra/sex-on-the-beach.png";
import frozen from "@/assets/barra/frozen-daiquiri.png";
import menta from "@/assets/barra/trago-menta.png";
import gancia from "@/assets/barra/jarra-gancia.png";

const OFFERS = [
  { src: daiquiri, label: "Candy" },
  { src: sexOnTheBeach, label: "2×1" },
  { src: frozen, label: "Frozen" },
  { src: menta, label: "Menta" },
  { src: gancia, label: "Gancia" },
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
      <img key={current.src} src={current.src} alt={current.label} className="header-offer-thumb is-front" />
      <img src={next.src} alt="" className="header-offer-thumb is-back" aria-hidden />
    </div>
  );
}
