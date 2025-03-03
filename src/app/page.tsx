import React from "react";
import CategoryFilter from "@/components/CategoryFilter";
import FilterBar from "@/components/FilterBar";
import VenueGrid from "@/components/VenueGrid";
import { loadAllVenueData } from "@/utils/serverUtils";
import { VenuesProvider } from "@/context/VenuesContext";

// Это серверный компонент
export default async function Home() {
  // Загружаем данные на сервере
  const venuesData = await loadAllVenueData();
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Путеводитель по Сербии
        </h1>
        <p className="text-gray-600">
          Исследуйте лучшие места и заведения в Белграде, Нови-Саде и других городах Сербии.
          Коллекция проверенных локаций от cdROma для комфортного путешествия.
        </p>
      </div>

      {/* Оборачиваем клиентские компоненты в провайдер с предзагруженными данными */}
      <VenuesProvider initialData={venuesData}>
        <CategoryFilter />
        <FilterBar />
        <VenueGrid />
      </VenuesProvider>
    </div>
  );
}
