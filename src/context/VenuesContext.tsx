"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  VenueCollection,
  VenueFeature,
  CATEGORIES,
  CategoryInfo,
} from "@/types";
import { fetchAllVenues } from "@/utils/dataUtils";

interface VenuesContextType {
  venues: { [key: string]: VenueCollection };
  filteredVenues: VenueFeature[];
  isLoading: boolean;
  error: string | null;
  selectedCategory: string;
  selectedCity: string | null;
  selectedType: string | null;
  searchQuery: string;
  setSelectedCategory: (category: string) => void;
  setSelectedCity: (city: string | null) => void;
  setSelectedType: (type: string | null) => void;
  setSearchQuery: (query: string) => void;
  getCategoryInfo: (categoryId: string) => CategoryInfo;
}

interface VenuesProviderProps {
  children: ReactNode;
  initialData?: { [key: string]: VenueCollection };
}

const VenuesContext = createContext<VenuesContextType | undefined>(undefined);

export function VenuesProvider({ children, initialData }: VenuesProviderProps) {
  const [venues, setVenues] = useState<{ [key: string]: VenueCollection }>(initialData || {});
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Кэш для предварительно обработанных данных поиска
  const [searchableVenues, setSearchableVenues] = useState<{
    [key: string]: {
      feature: VenueFeature;
      nameLower: string;
      descriptionLower: string | null;
    }[];
  }>({});

  useEffect(() => {
    // Если данные уже загружены с сервера, не нужно их загружать снова
    if (initialData) {
      return;
    }
    
    const loadVenues = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAllVenues();
        setVenues(data);
      } catch (err) {
        setError("Failed to load venues data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadVenues();
  }, [initialData]);
  
  // Предварительная обработка данных для поиска
  useEffect(() => {
    const processed: {
      [key: string]: {
        feature: VenueFeature;
        nameLower: string;
        descriptionLower: string | null;
      }[];
    } = {};
    
    // Обрабатываем данные для каждой категории
    Object.entries(venues).forEach(([categoryId, collection]) => {
      if (!collection || !collection.features) return;
      
      processed[categoryId] = collection.features.map(feature => ({
        feature,
        nameLower: feature.properties.Name.toLowerCase(),
        descriptionLower: feature.properties.description ? 
          feature.properties.description.toLowerCase() : null
      }));
    });
    
    setSearchableVenues(processed);
  }, [venues]);

  // Filter venues based on selected filters
  const filteredVenues = React.useMemo(() => {
    // Если выбрана категория "Всё", объединяем все заведения из всех категорий
    if (selectedCategory === "all") {
      // Сначала объединяем все заведения
      let allSearchableVenues: {
        feature: VenueFeature;
        nameLower: string;
        descriptionLower: string | null;
      }[] = [];
      
      // Объединяем заведения из всех категорий
      Object.values(searchableVenues).forEach((venueArray) => {
        if (venueArray && venueArray.length > 0) {
          allSearchableVenues = [...allSearchableVenues, ...venueArray];
        }
      });
      
      // Применяем фильтры последовательно, начиная с самых быстрых
      let filtered = allSearchableVenues;
      
      // Filter by city (быстрый фильтр)
      if (selectedCity) {
        filtered = filtered.filter((item) =>
          item.feature.properties.Name.startsWith(selectedCity)
        );
      }

      // Filter by type (средний фильтр)
      if (selectedType) {
        filtered = filtered.filter((item) => {
          const description = item.feature.properties.description;
          if (!description) return selectedType === "Без описания";

          if (selectedType === "Веб-сайт") {
            return description.startsWith("http");
          }

          return item.descriptionLower ? 
            item.descriptionLower.includes(selectedType.toLowerCase()) : false;
        });
      }

      // Filter by search query (самый медленный фильтр)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        
        // Оптимизация: если запрос короткий, используем более строгое соответствие
        if (query.length <= 2) {
          filtered = filtered.filter(
            (item) =>
              item.nameLower.includes(` ${query}`) ||
              item.nameLower.startsWith(query) ||
              (item.descriptionLower &&
                item.descriptionLower.includes(` ${query}`))
          );
        } else {
          filtered = filtered.filter(
            (item) =>
              item.nameLower.includes(query) ||
              (item.descriptionLower &&
                item.descriptionLower.includes(query))
          );
        }
      }
      
      // Возвращаем только оригинальные объекты VenueFeature
      return filtered.map(item => item.feature);
    }
    
    // Для остальных категорий используем существующую логику, но с оптимизациями
    if (!searchableVenues[selectedCategory] || searchableVenues[selectedCategory].length === 0) return [];

    let filtered = searchableVenues[selectedCategory];

    // Filter by city (быстрый фильтр)
    if (selectedCity) {
      filtered = filtered.filter((item) =>
        item.feature.properties.Name.startsWith(selectedCity)
      );
    }

    // Filter by type (средний фильтр)
    if (selectedType) {
      filtered = filtered.filter((item) => {
        const description = item.feature.properties.description;
        if (!description) return selectedType === "Без описания";

        if (selectedType === "Веб-сайт") {
          return description.startsWith("http");
        }

        return item.descriptionLower ? 
          item.descriptionLower.includes(selectedType.toLowerCase()) : false;
      });
    }

    // Filter by search query (самый медленный фильтр)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      
      // Оптимизация: если запрос короткий, используем более строгое соответствие
      if (query.length <= 2) {
        filtered = filtered.filter(
          (item) =>
            item.nameLower.includes(` ${query}`) ||
            item.nameLower.startsWith(query) ||
            (item.descriptionLower &&
              item.descriptionLower.includes(` ${query}`))
        );
      } else {
        filtered = filtered.filter(
          (item) =>
            item.nameLower.includes(query) ||
            (item.descriptionLower &&
              item.descriptionLower.includes(query))
        );
      }
    }

    // Возвращаем только оригинальные объекты VenueFeature
    return filtered.map(item => item.feature);
  }, [searchableVenues, selectedCategory, selectedCity, selectedType, searchQuery]);

  const getCategoryInfo = (categoryId: string): CategoryInfo => {
    return (
      CATEGORIES.find((cat) => cat.id === categoryId) || {
        id: categoryId,
        name: categoryId,
        icon: "🏠",
        color: "bg-gray-500",
      }
    );
  };

  const value = {
    venues,
    filteredVenues,
    isLoading,
    error,
    selectedCategory,
    selectedCity,
    selectedType,
    searchQuery,
    setSelectedCategory,
    setSelectedCity,
    setSelectedType,
    setSearchQuery,
    getCategoryInfo,
  };

  return (
    <VenuesContext.Provider value={value}>{children}</VenuesContext.Provider>
  );
}

export function useVenues() {
  const context = useContext(VenuesContext);
  if (context === undefined) {
    throw new Error("useVenues must be used within a VenuesProvider");
  }
  return context;
}
