"use client";

import React from "react";
import { useVenues } from "@/context/VenuesContext";
import VenueCard from "./VenueCard";

export default function VenueGrid() {
  const {
    filteredVenues,
    isLoading,
    error,
    selectedCategory,
    getCategoryInfo,
  } = useVenues();

  const categoryInfo = getCategoryInfo(selectedCategory);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Ошибка!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (filteredVenues.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Заведения не найдены. Попробуйте изменить параметры поиска.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <span className="mr-2">{categoryInfo.icon}</span>
          {categoryInfo.name}
          <span className="ml-2 text-gray-500 text-sm font-normal">
            ({filteredVenues.length}{" "}
            {filteredVenues.length === 1
              ? "заведение"
              : filteredVenues.length > 1 && filteredVenues.length < 5
              ? "заведения"
              : "заведений"}
            )
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVenues.map((venue, index) => (
          <VenueCard 
            key={`${venue.properties.Name}-${index}`} 
            venue={venue} 
            isFirst={index === 0}
          />
        ))}
      </div>
    </div>
  );
}
