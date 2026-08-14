const COLORS = ["#FF3D8A", "#E8B923", "#8B5CF6", "#74ACDF", "#FF6B00"];

function seeded(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const r2 = (n: number) => Math.round(n * 100) / 100;

const DOTS = Array.from({ length: 56 }).map((_, i) => ({
  left: `${r2(seeded(i, 1) * 100)}%`,
  top: `${r2(seeded(i, 2) * 100)}%`,
  size: r2(2 + seeded(i, 3) * 4),
  color: COLORS[i % COLORS.length],
  duration: r2(3 + seeded(i, 4) * 5),
  delay: r2(-(seeded(i, 5) * 8)),
}));

export function StarField() {
  return (
    <div className="starfield pointer-events-none fixed inset-0 z-0" style={{ opacity: 0.55 }} aria-hidden>
      {DOTS.map((d, i) => (
        <span
          key={i}
          className="starfield-dot absolute rounded-full"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            background: d.color,
            boxShadow: `0 0 ${d.size * 2.2}px ${d.color}, 0 0 ${d.size * 5}px ${d.color}`,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}
