'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ClientImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

export default function ClientImage({ 
  src, 
  alt, 
  fill, 
  sizes, 
  className,
  priority = false 
}: ClientImageProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse ${className}`} 
        style={fill ? { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } : undefined}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
} 