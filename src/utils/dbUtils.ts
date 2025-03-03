import prisma from './prismaClient';
import { CATEGORIES, CITIES } from '@/types';

/**
 * Инициализация базы данных начальными данными
 */
export async function initializeDatabase() {
  try {
    // Проверяем, есть ли уже категории в базе
    const categoriesCount = await prisma.category.count();
    
    // Если категорий нет, добавляем их
    if (categoriesCount === 0) {
      console.log('Инициализация категорий...');
      
      // Создаем категории
      await Promise.all(
        CATEGORIES.map(async (category) => {
          await prisma.category.create({
            data: {
              id: category.id,
              name: category.name,
              icon: category.icon,
              color: category.color
            }
          });
        })
      );
    }
    
    // Проверяем, есть ли уже города в базе
    const citiesCount = await prisma.city.count();
    
    // Если городов нет, добавляем их
    if (citiesCount === 0) {
      console.log('Инициализация городов...');
      
      // Создаем города
      await Promise.all(
        CITIES.map(async (city) => {
          await prisma.city.create({
            data: {
              id: city.id,
              name: city.name
            }
          });
        })
      );
    }
    
    console.log('База данных инициализирована успешно');
    return true;
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    return false;
  }
}

/**
 * Добавление нового места в базу данных
 */
export async function addPlace(
  name: string,
  description: string | null,
  imageUrl: string | null,
  latitude: number,
  longitude: number,
  categoryId: string,
  cityId: string
) {
  try {
    // Проверяем, существует ли место с такими координатами
    const existingPlace = await prisma.place.findFirst({
      where: {
        latitude: {
          equals: latitude
        },
        longitude: {
          equals: longitude
        }
      }
    });
    
    if (existingPlace) {
      console.log('Место с такими координатами уже существует');
      return null;
    }
    
    // Создаем новое место
    const place = await prisma.place.create({
      data: {
        name,
        description,
        imageUrl,
        latitude,
        longitude,
        categoryId,
        cityId
      }
    });
    
    return place;
  } catch (error) {
    console.error('Ошибка при добавлении места:', error);
    return null;
  }
}

/**
 * Получение всех мест из базы данных
 */
export async function getAllPlaces() {
  try {
    const places = await prisma.place.findMany({
      include: {
        category: true,
        city: true
      }
    });
    
    return places;
  } catch (error) {
    console.error('Ошибка при получении мест:', error);
    return [];
  }
}

/**
 * Получение мест по категории
 */
export async function getPlacesByCategory(categoryId: string) {
  try {
    const places = await prisma.place.findMany({
      where: {
        categoryId
      },
      include: {
        category: true,
        city: true
      }
    });
    
    return places;
  } catch (error) {
    console.error(`Ошибка при получении мест категории ${categoryId}:`, error);
    return [];
  }
}

/**
 * Получение мест по городу
 */
export async function getPlacesByCity(cityId: string) {
  try {
    const places = await prisma.place.findMany({
      where: {
        cityId
      },
      include: {
        category: true,
        city: true
      }
    });
    
    return places;
  } catch (error) {
    console.error(`Ошибка при получении мест города ${cityId}:`, error);
    return [];
  }
}

/**
 * Преобразование данных из базы в формат GeoJSON
 */
export function convertToGeoJson(places: Array<{
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
  altitude?: number;
  city: { id: string; name: string };
  category: { id: string; name: string; icon: string; color: string };
}>) {
  return {
    type: "FeatureCollection",
    name: "Places",
    features: places.map(place => ({
      type: "Feature",
      properties: {
        id: place.id,
        Name: `${place.city.id} ${place.name}`,
        description: place.description,
        imageUrl: place.imageUrl,
        categoryId: place.category.id
      },
      geometry: {
        type: "Point",
        coordinates: [place.longitude, place.latitude, place.altitude || 0.0]
      }
    }))
  };
} 