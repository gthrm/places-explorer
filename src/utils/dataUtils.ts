import { VenueCollection, VenueFeature, VenueType, CATEGORIES } from "@/types";
import prisma from './prismaClient';
import { convertToGeoJson as dbConvertToGeoJson } from './dbUtils';

export async function fetchVenues(category: string): Promise<VenueCollection> {
  try {
    // Если категория "all", получаем все места
    if (category === "all") {
      const places = await prisma.place.findMany({
        include: {
          category: true,
          city: true
        }
      });
      return dbConvertToGeoJson(places) as VenueCollection;
    }
    
    // Получаем места по категории
    const places = await prisma.place.findMany({
      where: {
        categoryId: category
      },
      include: {
        category: true,
        city: true
      }
    });
    
    return dbConvertToGeoJson(places) as VenueCollection;
  } catch (error) {
    console.error(`Error fetching ${category} data:`, error);
    return {
      type: "FeatureCollection",
      name: category,
      features: [],
    };
  }
}

export async function fetchAllVenues(): Promise<{
  [key: string]: VenueCollection;
}> {
  const result: { [key: string]: VenueCollection } = {};

  // Сначала загружаем категорию "all"
  const allCategory = CATEGORIES.find(cat => cat.id === "all");
  if (allCategory) {
    result[allCategory.id] = await fetchVenues(allCategory.id);
  }

  // Затем загружаем остальные категории
  await Promise.all(
    CATEGORIES.filter(category => category.id !== "all").map(async (category) => {
      result[category.id] = await fetchVenues(category.id);
    })
  );

  return result;
}

export function extractVenueTypes(venues: VenueFeature[]): VenueType[] {
  const typesMap = new Map<string, number>();

  venues.forEach((venue) => {
    // Используем categoryId как тип заведения
    const categoryId = venue.properties.categoryId;
    
    if (categoryId) {
      const count = typesMap.get(categoryId) || 0;
      typesMap.set(categoryId, count + 1);
    } else {
      // Если нет categoryId, категоризируем как "Без категории"
      const count = typesMap.get("Без категории") || 0;
      typesMap.set("Без категории", count + 1);
    }
  });

  return Array.from(typesMap.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count); // Сортируем по убыванию количества
}

export function extractCities(venues: VenueFeature[]): {
  [key: string]: number;
} {
  const citiesMap: { [key: string]: number } = {};
  const cityPrefixes = ["BG", "NS", "Mitrovica"]; // Известные префиксы городов

  venues.forEach((venue) => {
    const name = venue.properties.Name || "";
    
    // Пытаемся найти префикс города в начале названия
    let cityPrefix = name.split(" ")[0];
    
    // Если префикс не найден в начале, ищем его в скобках или в тексте
    if (!cityPrefixes.includes(cityPrefix)) {
      // Проверяем формат "Name (BG)" или "Name - BG"
      const bracketMatch = name.match(/\(([^)]+)\)/);
      if (bracketMatch && bracketMatch[1]) {
        cityPrefix = bracketMatch[1];
      } else {
        // Ищем известные префиксы в тексте
        for (const prefix of cityPrefixes) {
          if (name.includes(prefix)) {
            cityPrefix = prefix;
            break;
          }
        }
      }
    }

    if (cityPrefix) {
      citiesMap[cityPrefix] = (citiesMap[cityPrefix] || 0) + 1;
    }
  });

  return citiesMap;
}

// Функция для получения URL Google Maps для открытия в браузере
export function getGoogleMapsUrl(venue: VenueFeature): string {
  const { coordinates } = venue.geometry;
  const name = encodeURIComponent(venue.properties.Name);
  return `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}&query_place_id=${name}`;
}

// Функция для получения изображения заведения
export function getVenueImageUrl(venue: VenueFeature): string {
  // Если есть ссылка на изображение в базе данных, используем её
  if (venue.properties.imageUrl) {
    return venue.properties.imageUrl;
  }
  
  // Иначе используем название заведения для поиска изображения
  const { Name } = venue.properties;
  
  // Формируем имя файла на основе названия заведения
  // Заменяем пробелы на дефисы и удаляем специальные символы
  const fileName = Name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
  
  // Проверяем, существует ли изображение для этого заведения
  // Если нет, возвращаем заглушку
  return `/images/venues/${fileName}.svg`;
}

// Используем локальные заглушки
export function getPlaceholderImageUrl(): string {
  // Используем SVG-заглушку
  return `/placeholders/default.svg`;
}
