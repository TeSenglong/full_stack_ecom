"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useState } from "react";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ProgressiveImage({
  src,
  alt,
  className = "",
}: ProgressiveImageProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  const isLoaded = loadedSrc === src;

  const handleImageRef = useCallback(
    (image: HTMLImageElement | null) => {
      // Handle images loaded from cache before onLoad is attached.
      if (image?.complete && image.naturalWidth > 0) {
        setLoadedSrc(src);
      }
    },
    [src],
  );

  return (
    <div
      className={`relative overflow-hidden bg-outline-variant/20 ${className}`}
    >
      {!isLoaded && (
        <div className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-surface-high to-transparent" />
      )}

      <img
        ref={handleImageRef}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoadedSrc(src)}
        className={`h-full w-full object-cover transition-opacity duration-500 ease-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}