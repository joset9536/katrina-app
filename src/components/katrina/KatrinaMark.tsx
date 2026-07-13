import face from "@/assets/katrina-face.png";

type Props = { className?: string; size?: number };

/**
 * Katrina brand mark — neon face logo.
 */
export function KatrinaMark({ className, size = 44 }: Props) {
  return (
    <img
      src={face}
      width={size}
      height={size}
      alt="Katrina"
      className={`object-contain ${className ?? ""}`}
      style={{
        filter:
          "drop-shadow(0 0 12px rgba(255, 61, 138, 0.55)) drop-shadow(0 0 32px rgba(232, 185, 35, 0.35))",
      }}
    />
  );
}
