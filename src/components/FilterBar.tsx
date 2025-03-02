"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useVenues } from "@/context/VenuesContext";
import { extractVenueTypes, extractCities } from "@/utils/dataUtils";
import { CITIES } from "@/types";

// Функция для дебаунса
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function FilterBar() {
  const {
    venues,
    selectedCategory,
    selectedCity,
    setSelectedCity,
    selectedType,
    setSelectedType,
    searchQuery,
    setSearchQuery,
  } = useVenues();

  // Локальное состояние для ввода поиска
  const [inputValue, setInputValue] = useState(searchQuery);
  
  // Применяем дебаунс к вводу поиска
  const debouncedSearchTerm = useDebounce(inputValue, 300);

  // Обновляем глобальное состояние поиска только после дебаунса
  useEffect(() => {
    setSearchQuery(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchQuery]);

  // Extract venue types from the current category
  const venueTypes = useMemo(() => {
    // Если выбрана категория "all", используем все заведения
    if (selectedCategory === "all") {
      // Собираем все заведения из всех категорий
      const allFeatures = Object.values(venues)
        .filter(collection => collection && collection.features)
        .flatMap(collection => collection.features);
      
      return extractVenueTypes(allFeatures);
    }
    
    // Для остальных категорий используем существующую логику
    if (!venues[selectedCategory] || !venues[selectedCategory].features) return [];
    return extractVenueTypes(venues[selectedCategory].features);
  }, [venues, selectedCategory]);

  // Extract cities from the current category
  const cities = useMemo(() => {
    // Если выбрана категория "all", используем все заведения
    if (selectedCategory === "all") {
      // Собираем все заведения из всех категорий
      const allFeatures = Object.values(venues)
        .filter(collection => collection && collection.features)
        .flatMap(collection => collection.features);
      
      return extractCities(allFeatures);
    }
    
    // Для остальных категорий используем существующую логику
    if (!venues[selectedCategory] || !venues[selectedCategory].features) return {};
    return extractCities(venues[selectedCategory].features);
  }, [venues, selectedCategory]);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск заведений..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* City filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Город
          </label>
          <select
            value={selectedCity || ""}
            onChange={(e) =>
              setSelectedCity(e.target.value === "" ? null : e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
          >
            <option value="">Все города</option>
            {Object.keys(cities).map((cityPrefix) => {
              const cityInfo = CITIES.find((c) => c.id === cityPrefix) || {
                id: cityPrefix,
                name: cityPrefix,
              };
              return (
                <option key={cityPrefix} value={cityPrefix}>
                  {cityInfo.name} ({cities[cityPrefix]})
                </option>
              );
            })}
          </select>
        </div>

        {/* Type filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Тип заведения
          </label>
          <select
            value={selectedType || ""}
            onChange={(e) =>
              setSelectedType(e.target.value === "" ? null : e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
          >
            <option value="">Все типы</option>
            {venueTypes.map((type) => (
              <option key={type.type} value={type.type}>
                {type.type} ({type.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filters */}
      {(selectedCity || selectedType || searchQuery) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedCity && (
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
              <span>Город: {selectedCity}</span>
              <button
                onClick={() => setSelectedCity(null)}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                ×
              </button>
            </div>
          )}
          {selectedType && (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
              <span>Тип: {selectedType}</span>
              <button
                onClick={() => setSelectedType(null)}
                className="ml-2 text-green-500 hover:text-green-700"
              >
                ×
              </button>
            </div>
          )}
          {searchQuery && (
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
              <span>Поиск: {searchQuery}</span>
              <button
                onClick={() => {
                  setInputValue("");
                  setSearchQuery("");
                }}
                className="ml-2 text-purple-500 hover:text-purple-700"
              >
                ×
              </button>
            </div>
          )}
          <button
            onClick={() => {
              setSelectedCity(null);
              setSelectedType(null);
              setInputValue("");
              setSearchQuery("");
            }}
            className="text-gray-600 hover:text-gray-800 text-sm underline"
          >
            Сбросить все фильтры
          </button>
        </div>
      )}
    </div>
  );
}
