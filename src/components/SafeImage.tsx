"use client";

import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = "",
  fallbackLabel,
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F3F6FA] via-[#E8EEF5] to-[#DCE5F0] text-slate-500 p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <ShieldCheck className="w-8 h-8 text-[#1B5683]/60 mb-2" />
        {fallbackLabel && (
          <span className="text-xs font-medium text-slate-600">{fallbackLabel}</span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
};
