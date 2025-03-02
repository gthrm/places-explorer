import fs from 'fs';
import path from 'path';
import { VenueCollection, VenueFeature, VenueType, CATEGORIES } from "@/types";

// Серверная функция для загрузки данных из GeoJSON файла
export async function loadVenueData(category: string): Promise<VenueCollection> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', `${category}.geojson`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents) as VenueCollection;
    return data;
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
      result[category.id] = {
        type: "FeatureCollection",
        name: "Всё",
        features: [],
      };
      continue;
    }
    
    result[category.id] = await loadVenueData(category.id);
  }

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
      else if (description.includes("кальян")) {
        type = "Кальянная";
      } else if (
        description.includes("коктел") ||
        description.includes("коктейл")
      ) {
        type = "Коктейль-бар";
      } else if (description.includes("вин")) {
        type = "Винный бар";
      } else if (description.includes("ресторан")) {
        type = "Ресторан";
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