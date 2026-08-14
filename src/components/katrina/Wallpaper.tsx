import tapizSalon from "@/assets/tapiz/tapiz-salon.svg";
import esquina from "@/assets/tapiz/esquina.svg";

/** Papel tapiz fijo del salón: damasco vino/oro y esquinas. Sin haces de payaso. */
export function Wallpaper() {
  return (
    <div
      className="katrina-wallpaper pointer-events-none fixed inset-0 z-0"
      style={{ backgroundImage: `url(${tapizSalon})` }}
      aria-hidden
    >
      <img src={esquina} alt="" className="katrina-corner katrina-corner-tl" />
      <img src={esquina} alt="" className="katrina-corner katrina-corner-tr" />
      <img src={esquina} alt="" className="katrina-corner katrina-corner-bl" />
      <img src={esquina} alt="" className="katrina-corner katrina-corner-br" />
    </div>
  );
}
