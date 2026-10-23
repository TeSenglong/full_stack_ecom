"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function HeroReveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;

    if (
      !element ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const bounds = element.getBoundingClientRect();
    // Keep already-visible content visible when hydration finishes late.
    let skipInitialAnimation = bounds.top < window.innerHeight - 40 && bounds.bottom > 0;

    if (!skipInitialAnimation) element.dataset.reveal = "pending";

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!skipInitialAnimation) element.dataset.reveal = "visible";
      } else {
        element.dataset.reveal = "pending";
      }

      skipInitialAnimation = false;
    }, {
      rootMargin: "0px 0px -40px 0px",
      threshold: 0.1,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
      delete element.dataset.reveal;
    };
  }, []);

  return (
    <div ref={elementRef} className={`hero-enter ${className}`}>
      {children}
    </div>
  );
}
