// AosInitializer.tsx
"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AosInitializer() {
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      AOS.init({
        duration: 700,
        easing: "ease-out",
        offset: 80,
        once: true,
      });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return null;
}