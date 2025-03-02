"use client";

import React from "react";
import { VenueFeature } from "@/types";
import { getGoogleMapsUrl } from "@/utils/dataUtils";
import VenueImage from './VenueImage';

interface VenueCardProps {
  venue: VenueFeature;
  isFirst?: boolean;
}

export default function VenueCard({ venue, isFirst = false }: VenueCardProps) {
  const { Name, description } = venue.properties;
  const [cityPrefix, ...nameParts] = Name.split(" ");
  const venueName = nameParts.join(" ");

  // Extract venue type from description
  let venueType = "Заведение";
  if (description) {
    if (description.includes("кальян")) {
      venueType = "Кальянная";
    } else if (
      description.includes("коктел") ||
      description.includes("коктейл")
    ) {
      venueType = "Коктейль-бар";
    } else if (description.includes("вин")) {
      venueType = "Винный бар";
    } else if (description.includes("ресторан")) {
      venueType = "Ресторан";
    } else if (!description.startsWith("http")) {
      venueType = description;
    }
  }

  const handleClick = () => {
    window.open(getGoogleMapsUrl(venue), "_blank");
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative h-48 w-full">
        <VenueImage
          venue={venue}
          alt={venueName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          priority={isFirst}
        />
        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs">
          {cityPrefix}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1 truncate">{venueName}</h3>
        <p className="text-sm text-gray-500 mb-2">{venueType}</p>

        {description && description.startsWith("http") && (
          <a
            href={description}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 text-sm hover:underline inline-block mt-2"
            onClick={(e) => e.stopPropagation()}
          >
            Посетить сайт
          </a>
        )}

        <div className="flex items-center mt-3 text-sm text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Открыть на карте</span>
        </div>
      </div>
    </div>
  );
}
