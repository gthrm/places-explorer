import { VenueCollection, VenueFeature, VenueType, CATEGORIES } from "@/types";
import prisma from './prismaClient';
import { convertToGeoJson } from './dbUtils';

// Серверная функция для загрузки данных из базы данных
export async function loadVenueData(category: string): Promise<VenueCollection> {
  try {
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
    
    return convertToGeoJson(places) as VenueCollection;
  } catch (error) {
    console.error(`Error loading ${category} data:`, error);
    return {
      type: "FeatureCollection",
      name: category,
      features: [],
    };
  }
}

// Загрузка всех данных для всех категорий
export async function loadAllVenueData(): Promise<{
  [key: string]: VenueCollection;
}> {
  const result: { [key: string]: VenueCollection } = {};

  for (const category of CATEGORIES) {
    // Пропускаем категорию "all", так как для неё нет отдельного файла
    if (category.id === "all") {
      // Создаем пустую коллекцию для категории "all"
      const allPlaces = await prisma.place.findMany({
        include: {
          category: true,
          city: true
        }
      });
      
      console.log(`Loaded ${allPlaces.length} places for category "all"`);
      
      result[category.id] = convertToGeoJson(allPlaces) as VenueCollection;
      continue;
    }
    
    const categoryData = await loadVenueData(category.id);
    console.log(`Loaded ${categoryData.features.length} places for category "${category.id}"`);
    result[category.id] = categoryData;
  }

  console.log("Total categories loaded:", Object.keys(result).length);
  return result;
}

// Извлечение типов заведений из данных
export function extractVenueTypes(venues: VenueFeature[]): VenueType[] {
  const typesMap = new Map<string, number>();

  venues.forEach((venue) => {
    const description = venue.properties.description;
    if (description) {
      // Try to extract type from description
      let type = description;

      // If description is a URL, use a generic type
      if (description.startsWith("http")) {
        type = "Веб-сайт";
      }
      // If description contains specific keywords
      else if (description.toLowerCase().includes("кальян")) {
        type = "Кальянная";
      } else if (
        description.toLowerCase().includes("коктел") ||
        description.toLowerCase().includes("коктейл")
      ) {
        type = "Коктейль-бар";
      } else if (description.toLowerCase().includes("вин")) {
        type = "Винный бар";
      } else if (description.toLowerCase().includes("ресторан")) {
        type = "Ресторан";
      } else if (description.toLowerCase().includes("кафе")) {
        type = "Кафе";
      } else if (description.toLowerCase().includes("паб")) {
        type = "Паб";
      } else if (description.toLowerCase().includes("пиво") || description.toLowerCase().includes("пива")) {
        type = "Пивной бар";
      } else if (description.length > 30) {
        // If description is too long, truncate it
        type = description.substring(0, 30) + "...";
      }

      const count = typesMap.get(type) || 0;
      typesMap.set(type, count + 1);
    } else {
      // If no description, categorize as "Без описания"
      const count = typesMap.get("Без описания") || 0;
      typesMap.set("Без описания", count + 1);
    }
  });

  return Array.from(typesMap.entries()).map(([type, count]) => ({
    type,
    count,
  }));
}

// Извлечение городов из данных
export function extractCities(venues: VenueFeature[]): {
  [key: string]: number;
} {
  const citiesMap: { [key: string]: number } = {};

  venues.forEach((venue) => {
    const name = venue.properties.Name || "";
    const cityPrefix = name.split(" ")[0];

    if (cityPrefix) {
      citiesMap[cityPrefix] = (citiesMap[cityPrefix] || 0) + 1;
    }
  });

  return citiesMap;
} 