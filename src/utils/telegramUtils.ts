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
    console.log('Извлечение координат из URL:', url);
    
    // Формат 1: Координаты в URL после @
    // Пример: https://www.google.com/maps/place/.../@44.8142752,20.4588704,17z/...
    const atRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const atMatch = url.match(atRegex);
    
    if (atMatch && atMatch.length >= 3) {
      const lat = parseFloat(atMatch[1]);
      const lng = parseFloat(atMatch[2]);
      console.log(`Найдены координаты (формат @): [${lng}, ${lat}]`);
      return [lng, lat]; // GeoJSON использует формат [lng, lat]
    }
    
    // Формат 2: Координаты в параметре q=
    // Пример: https://www.google.com/maps?q=44.8142752,20.4588704
    const qRegex = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const qMatch = url.match(qRegex);
    
    if (qMatch && qMatch.length >= 3) {
      const lat = parseFloat(qMatch[1]);
      const lng = parseFloat(qMatch[2]);
      console.log(`Найдены координаты (формат q=): [${lng}, ${lat}]`);
      return [lng, lat];
    }
    
    // Формат 3: Координаты в параметрах !3d и !4d
    // Пример: https://www.google.com/maps/place/...!3d44.8142752!4d20.4588704!...
    const dRegex = /!3d(-?\d+\.\d+).*?!4d(-?\d+\.\d+)/;
    const dMatch = url.match(dRegex);
    
    if (dMatch && dMatch.length >= 3) {
      const lat = parseFloat(dMatch[1]);
      const lng = parseFloat(dMatch[2]);
      console.log(`Найдены координаты (формат !3d!4d): [${lng}, ${lat}]`);
      return [lng, lat];
    }
    
    // Формат 4: Координаты в конце URL после последнего /
    // Пример: https://www.google.com/maps/place/.../44.8142752,20.4588704
    const slashRegex = /\/(-?\d+\.\d+),(-?\d+\.\d+)(?:[,/]|$)/;
    const slashMatch = url.match(slashRegex);
    
    if (slashMatch && slashMatch.length >= 3) {
      const lat = parseFloat(slashMatch[1]);
      const lng = parseFloat(slashMatch[2]);
      console.log(`Найдены координаты (формат /lat,lng): [${lng}, ${lat}]`);
      return [lng, lat];
    }
    
    // Формат 5: Координаты в параметрах 8m2!3d и !4d
    // Пример: https://www.google.com/maps/place/...!8m2!3d44.8142752!4d20.4588704!...
    const m2Regex = /!8m2!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
    const m2Match = url.match(m2Regex);
    
    if (m2Match && m2Match.length >= 3) {
      const lat = parseFloat(m2Match[1]);
      const lng = parseFloat(m2Match[2]);
      console.log(`Найдены координаты (формат !8m2!3d!4d): [${lng}, ${lat}]`);
      return [lng, lat];
    }
    
    console.log('Не удалось извлечь координаты из URL');
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