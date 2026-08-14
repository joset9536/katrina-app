import type { ReactNode } from "react";
import tapizCarta from "@/assets/tapiz/tapiz-carta.svg";
import tapizNoches from "@/assets/tapiz/tapiz-noches.svg";
import tapizLugar from "@/assets/tapiz/tapiz-lugar.svg";
import esquina from "@/assets/tapiz/esquina.svg";

const PAPERS = {
  carta: tapizCarta,
  noches: tapizNoches,
  lugar: tapizLugar,
} as const;

export function SectionPaper({
  variant,
  children,
}: {
  variant: keyof typeof PAPERS;
  children: ReactNode;
}) {
  return (
    <div
      className={`tapiz-${variant} katrina-section-paper`}
      style={{ backgroundImage: `linear-gradient(180deg, rgba(18,8,14,0.35), rgba(18,8,14,0.55)), url(${PAPERS[variant]})` }}
    >
      <img src={esquina} alt="" className="katrina-corner katrina-corner-tl" />
      <img src={esquina} alt="" className="katrina-corner katrina-corner-tr" />
      <img src={esquina} alt="" className="katrina-corner katrina-corner-bl" />
      <img src={esquina} alt="" className="katrina-corner katrina-corner-br" />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
