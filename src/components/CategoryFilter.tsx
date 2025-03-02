"use client";

import React from "react";
import { CATEGORIES } from "@/types";
import { useVenues } from "@/context/VenuesContext";

export default function CategoryFilter() {
  const { selectedCategory, setSelectedCategory, venues } = useVenues();

  // Функция для подсчета общего количества заведений
  const getTotalVenuesCount = () => {
    let total = 0;
    Object.values(venues).forEach((collection) => {
      if (collection && collection.features) {
        total += collection.features.length;
      }
    });
    return total;
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {CATEGORIES.map((category) => {
        // Для категории "Всё" всегда показываем кнопку
        if (category.id === "all") {
          const isSelected = selectedCategory === category.id;
          const count = getTotalVenuesCount();

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? `${category.color} text-white`
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              <span>{category.name}</span>
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  isSelected
                    ? "bg-black bg-opacity-20 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {count}
              </span>
            </button>
          );
        }

        // Для остальных категорий используем существующую логику
        // Skip categories with no venues
        if (!venues[category.id] || venues[category.id].features.length === 0) {
          return null;
        }

        const isSelected = selectedCategory === category.id;
        const count = venues[category.id]?.features.length || 0;

        return (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isSelected
                ? `${category.color} text-white`
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            <span>{category.name}</span>
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                isSelected
                  ? "bg-black bg-opacity-20 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
