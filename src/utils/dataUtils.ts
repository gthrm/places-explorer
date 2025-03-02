import { VenueCollection, VenueFeature, VenueType, CATEGORIES } from "@/types";

export async function fetchVenues(category: string): Promise<VenueCollection> {
  try {
    const response = await fetch(`/data/${category}.geojson`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${category} data`);
    }
    return await response.json();
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

  await Promise.all(
    CATEGORIES.map(async (category) => {
      result[category.id] = await fetchVenues(category.id);
    })
  );

  return result;
}

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

// Функция для получения URL Google Maps для открытия в браузере
export function getGoogleMapsUrl(venue: VenueFeature): string {
  const { coordinates } = venue.geometry;
  const name = encodeURIComponent(venue.properties.Name);
  return `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}&query_place_id=${name}`;
}

// Функция для получения изображения заведения
export function getVenueImageUrl(venue: VenueFeature): string {
  // Используем название заведения для поиска изображения
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
