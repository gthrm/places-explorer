import fs from 'fs';
import path from 'path';
import { VenueCollection, VenueFeature } from '@/types';

/**
 * Функция для добавления нового места в GeoJSON файл
 */
export async function addPlaceToGeoJson(
  category: string,
  name: string,
  description: string | null,
  coordinates: [number, number],
  city: string
): Promise<boolean> {
  try {
    // Путь к файлу категории
    const filePath = path.join(process.cwd(), 'public', 'data', `${category}.geojson`);
    
    // Проверяем существование файла
    if (!fs.existsSync(filePath)) {
      // Если файл не существует, создаем новый с базовой структурой
      const newGeoJson = {
        type: "FeatureCollection",
        name: category,
        features: []
      };
      fs.writeFileSync(filePath, JSON.stringify(newGeoJson, null, 2));
    }
    
    // Читаем существующий файл
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const geoJson = JSON.parse(fileContent) as VenueCollection;
    
    // Создаем новую запись
    const newId = Math.random().toString(36).substring(2, 15); // Генерируем случайный ID
    const newFeature: VenueFeature = {
      id: newId,
      type: "Feature",
      properties: {
        id: newId,
        Name: `${city} ${name}`,
        description,
        imageUrl: null,
        categoryId: category
      },
      geometry: {
        type: "Point",
        coordinates: [...coordinates, 0.0] // Добавляем высоту 0.0 для соответствия формату
      }
    };
    
    // Добавляем новую запись в массив
    geoJson.features.push(newFeature);
    
    // Записываем обновленный файл
    fs.writeFileSync(filePath, JSON.stringify(geoJson, null, 2));
    
    return true;
  } catch (error) {
    console.error('Ошибка при сохранении места:', error);
    return false;
  }
}

/**
 * Функция для извлечения координат из ссылки Google Maps
 */
export function extractCoordinatesFromUrl(url: string): [number, number] | null {
  try {
    // Пытаемся извлечь координаты из разных форматов ссылок Google Maps
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = url.match(regex);
    
    if (match && match.length >= 3) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      return [lng, lat]; // GeoJSON использует формат [lng, lat]
    }
    
    // Если не удалось извлечь из формата @lat,lng, пробуем другие форматы
    const queryRegex = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const queryMatch = url.match(queryRegex);
    
    if (queryMatch && queryMatch.length >= 3) {
      const lat = parseFloat(queryMatch[1]);
      const lng = parseFloat(queryMatch[2]);
      return [lng, lat];
    }
    
    return null;
  } catch (error) {
    console.error('Ошибка при извлечении координат:', error);
    return null;
  }
}

/**
 * Функция для проверки, существует ли место с такими координатами
 */
export async function placeExistsWithCoordinates(
  coordinates: [number, number]
): Promise<boolean> {
  try {
    // Получаем список всех категорий
    const categoriesDir = path.join(process.cwd(), 'public', 'data');
    const files = fs.readdirSync(categoriesDir).filter(file => file.endsWith('.geojson'));
    
    // Проверяем каждую категорию
    for (const file of files) {
      const filePath = path.join(categoriesDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const geoJson = JSON.parse(fileContent) as VenueCollection;
      
      // Проверяем, есть ли место с такими координатами
      const exists = geoJson.features.some(feature => {
        const featureCoords = feature.geometry.coordinates;
        // Сравниваем с небольшой погрешностью
        return Math.abs(featureCoords[0] - coordinates[0]) < 0.0001 && 
               Math.abs(featureCoords[1] - coordinates[1]) < 0.0001;
      });
      
      if (exists) return true;
    }
    
    return false;
  } catch (error) {
    console.error('Ошибка при проверке существования места:', error);
    return false;
  }
} 