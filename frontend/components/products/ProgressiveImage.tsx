"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ProgressiveImage({ src, alt, className = "" }: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-outline-variant/20 ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-surface-high to-transparent" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-500 ease-out ${isLoaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
