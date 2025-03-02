'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { VenueFeature } from '@/types';
import { getVenueImageUrl, getPlaceholderImageUrl } from '@/utils/dataUtils';

interface VenueImageProps {
  venue: VenueFeature;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

export default function VenueImage({ 
  venue, 
  alt, 
  fill, 
  sizes, 
  className,
  priority = false 
}: VenueImageProps) {
  // Пытаемся использовать локальное изображение
  const [imgSrc, setImgSrc] = useState<string>(getVenueImageUrl(venue));
  const [imgError, setImgError] = useState<boolean>(false);

  const handleError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(getPlaceholderImageUrl());
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      priority={priority}
      onError={handleError}
    />
  );
} 