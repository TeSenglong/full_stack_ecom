// AosInitializer.tsx
"use client";

import { useEffect } from "react";
import AOS from "aos";

export default function AosInitializer() {
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      AOS.init({
        duration: 700,
        easing: "ease-out",
        offset: 80,
        once: false,
        startEvent: "aos-ready",
      });
      document.dispatchEvent(new Event("aos-ready"));
    });

    return () => cancelAnimationFrame(id);
  }, []);

  return null;
}
