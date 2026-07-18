import faceAsset from "@/assets/katrina-logo-clean.png.asset.json";
const face = faceAsset.url;

type Props = { className?: string; size?: number };

export function KatrinaMark({ className, size = 160 }: Props) {
  return (
    <img
      src={face}
      alt="Logo Katrina"
      width={size}
      className={`block max-w-full ${className ?? ""}`}
      style={{ width: size, height: "auto" }}
      loading="eager"
      decoding="async"
    />
  );
}
