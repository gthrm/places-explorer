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

// Определение типа для обработанных данных заведений для поиска
interface SearchableVenue {
  feature: VenueFeature;
  nameLower: string;
  descriptionLower: string | null;
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

  // Функция для проверки соответствия заведения выбранному типу
  const matchesVenueType = (item: SearchableVenue, selectedType: string): boolean => {
    // Проверяем, совпадает ли categoryId с выбранным типом
    return item.feature.properties.categoryId === selectedType;
  };

  // Filter venues based on selected filters
  const filteredVenues = React.useMemo(() => {
    // Если выбрана категория "Всё", используем данные из категории "all"
    if (selectedCategory === "all") {
      // Используем данные из категории "all", которые уже содержат все места
      if (searchableVenues["all"] && searchableVenues["all"].length > 0) {
        let filtered = searchableVenues["all"];
        
        // Filter by city (быстрый фильтр)
        if (selectedCity) {
          filtered = filtered.filter((item) => {
            // Проверяем, начинается ли название с выбранного города
            // или содержит ли оно код города в формате "BG", "NS" и т.д.
            const nameParts = item.feature.properties.Name.split(" ");
            return nameParts[0] === selectedCity || 
                   item.nameLower.includes(` ${selectedCity.toLowerCase()}`) ||
                   item.nameLower.includes(`(${selectedCity.toLowerCase()})`);
          });
        }

        // Filter by type (средний фильтр)
        if (selectedType) {
          filtered = filtered.filter(item => matchesVenueType(item, selectedType));
        }

        // Filter by search query (самый медленный фильтр)
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          
          // Оптимизация: если запрос короткий, используем более строгое соответствие
          if (query.length <= 2) {
            filtered = filtered.filter(
              (item) =>
                item.nameLower.includes(query) || // Изменено: ищем в любом месте названия
                (item.descriptionLower &&
                  item.descriptionLower.includes(query))
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
      
      return [];
    }
    
    // Для остальных категорий используем существующую логику, но с оптимизациями
    if (!searchableVenues[selectedCategory] || searchableVenues[selectedCategory].length === 0) return [];

    let filtered = searchableVenues[selectedCategory];

    // Filter by city (быстрый фильтр)
    if (selectedCity) {
      filtered = filtered.filter((item) => {
        // Проверяем, начинается ли название с выбранного города
        // или содержит ли оно код города в формате "BG", "NS" и т.д.
        const nameParts = item.feature.properties.Name.split(" ");
        return nameParts[0] === selectedCity || 
               item.nameLower.includes(` ${selectedCity.toLowerCase()}`) ||
               item.nameLower.includes(`(${selectedCity.toLowerCase()})`);
      });
    }

    // Filter by type (средний фильтр)
    if (selectedType) {
      filtered = filtered.filter(item => matchesVenueType(item, selectedType));
    }

    // Filter by search query (самый медленный фильтр)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      
      // Оптимизация: если запрос короткий, используем более строгое соответствие
      if (query.length <= 2) {
        filtered = filtered.filter(
          (item) =>
            item.nameLower.includes(query) || // Изменено: ищем в любом месте названия
            (item.descriptionLower &&
              item.descriptionLower.includes(query))
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
