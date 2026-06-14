"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
}

export function ScrollReveal({ children, className = "", stagger = false }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
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
      style={mounted ? { opacity: 0, transform: "translateY(20px)" } : undefined}
    >
      {children}
    </div>
  );
}
