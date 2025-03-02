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
          Каталог заведений
        </h1>
        <p className="text-gray-600">
          Найдите интересные места и заведения в вашем городе. Используйте
          фильтры для уточнения поиска.
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
