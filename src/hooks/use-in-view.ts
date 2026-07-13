import { useEffect, useRef, useState } from "react";

/**
 * Adds the `is-visible` class once the element enters the viewport.
 * Pair with the `.fade-up` utility.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(entry.target);
        }
      }
    }, options);
    io.observe(node);
    return () => io.disconnect();
  }, [options]);

  return { ref, visible } as const;
}
