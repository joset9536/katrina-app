import faceAsset from "@/assets/katrina-logo-clean.png";
const face = faceAsset;

type Props = { className?: string; size?: number };

export function KatrinaMark({ className, size = 160 }: Props) {
  return (
    <img
      src={face}
      alt="Logo Katrina"
      width={size}
      className={`katrina-mark-float block h-auto max-w-full ${className ?? ""}`}
      style={className ? { height: "auto" } : { width: size, height: "auto" }}
      loading="eager"
      decoding="async"
    />
  );
}
