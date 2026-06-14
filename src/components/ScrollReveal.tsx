"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
}

export function ScrollReveal({ children, className = "", stagger = false }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const el = ref.current;
    if (el) {
      if (stagger) {
        // Observe each child for staggered animation
        const children = el.querySelectorAll(":scope > *");
        children.forEach((child) => observer.observe(child));
      } else {
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, [stagger]);

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${stagger ? "scroll-reveal-stagger" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
