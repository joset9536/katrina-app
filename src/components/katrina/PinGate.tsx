import { useEffect, useState } from "react";

export function PinGate({
  title,
  pin,
  storageKey,
  children,
}: {
  title: string;
  pin: string;
  storageKey: string;
  children: React.ReactNode;
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setUnlocked(localStorage.getItem(storageKey) === "ok");
    setChecked(true);
  }, [storageKey]);

  if (!checked) return null;

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#0E0A1A] text-white flex items-center justify-center p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim() === pin) {
              localStorage.setItem(storageKey, "ok");
              setUnlocked(true);
              setError(false);
            } else {
              setError(true);
            }
          }}
          className="w-full max-w-sm space-y-3 rounded-2xl border border-[#FF3D8A]/40 bg-black/50 p-6"
        >
          <h1 className="text-xl font-semibold text-[#FF3D8A]">{title}</h1>
          <p className="text-xs text-white/60">Ingresá la clave para entrar.</p>
          <input
            type="password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            placeholder="Clave"
            autoFocus
            className="h-12 w-full rounded-md border border-white/15 bg-black/40 px-3 text-sm focus:border-[#FF3D8A] focus:outline-none"
          />
          {error && <p className="text-xs text-red-400">Clave incorrecta.</p>}
          <button
            type="submit"
            className="h-12 w-full rounded-md bg-[#FF3D8A] text-sm font-semibold text-[#0E0A1A] active:scale-[0.99]"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
