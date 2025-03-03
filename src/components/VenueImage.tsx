"use client";

import React from "react";
import Image from "next/image";
import { VenueFeature } from "@/types";

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
  priority = false,
}: VenueImageProps) {
  return (
    <Image
      src={venue.properties.imageUrl || "/placeholders/default.svg"}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
}
