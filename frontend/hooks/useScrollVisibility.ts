"use client";

import { useEffect, useRef, useState } from "react";

export function useScrollVisibility() {
  const [isHidden, setIsHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollTopRef = useRef(0);
  const upwardScrollRef = useRef(0);

  useEffect(() => {
    lastScrollTopRef.current = window.scrollY;

    const handleScroll = () => {
      const scrollTop = Math.max(window.scrollY, 0);
      const hideAfter = window.innerHeight / 2;
      const showAfterScrollingUp = Math.max(window.innerHeight * 0.15, 100);
      const difference = scrollTop - lastScrollTopRef.current;

      setIsScrolled(scrollTop > 20);

      if (scrollTop <= 20) {
        setIsHidden(false);
        upwardScrollRef.current = 0;
        lastScrollTopRef.current = scrollTop;
        return;
      }

      if (difference > 0) {
        upwardScrollRef.current = 0;

        if (scrollTop > hideAfter) {
          setIsHidden(true);
        }
      } else if (difference < 0) {
        upwardScrollRef.current += Math.abs(difference);

        if (upwardScrollRef.current >= showAfterScrollingUp) {
          setIsHidden(false);
          upwardScrollRef.current = 0;
        }
      }

      lastScrollTopRef.current = scrollTop;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { isHidden, isScrolled };
}
