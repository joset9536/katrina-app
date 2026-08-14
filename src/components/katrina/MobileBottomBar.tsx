import { Bell, UtensilsCrossed } from "lucide-react";

export function MobileBottomBar() {
  const callMozo = () => {
    window.dispatchEvent(new CustomEvent("katrina:open-chat"));
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="pointer-events-none absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-[#0b0713] to-transparent" />
      <div className="mx-3 mb-3 flex items-stretch gap-2 rounded-2xl border border-white/10 bg-[#0b0713]/95 p-2 shadow-2xl backdrop-blur-md">
        <button
          type="button"
          onClick={callMozo}
          className="flex min-h-12 flex-[2] items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white active:scale-[0.99]"
          style={{
            background:
              "linear-gradient(90deg, color-mix(in oklab, var(--neon-purple) 55%, transparent), color-mix(in oklab, #FF3D8A 50%, transparent))",
            boxShadow: "0 0 24px color-mix(in oklab, var(--neon-purple) 55%, transparent)",
          }}
        >
          <Bell className="h-5 w-5" />
          Llamar mozo
        </button>
        <a
          href="#carta"
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-3 text-sm font-medium text-white/90"
        >
          <UtensilsCrossed className="h-5 w-5" />
          Carta
        </a>
      </div>
    </div>
  );
}
