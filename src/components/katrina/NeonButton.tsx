import type { AnchorHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant;
  children: ReactNode;
};

export function NeonButton({ variant = "primary", className = "", children, ...rest }: Props) {
  const base = variant === "primary" ? "btn-glow-purple" : "btn-ghost-neon";
  return (
    <a className={`${base} ${className}`} {...rest}>
      {children}
    </a>
  );
}
