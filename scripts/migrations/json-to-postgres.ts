import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

// Определяем типы данных
interface VenueProperties {
  Name: string;
  description: string | null;
}

interface VenueGeometry {
  type: string;
  coordinates: [number, number, number];
}

interface VenueFeature {
  type: string;
  properties: VenueProperties;
  geometry: VenueGeometry;
}

interface VenueCollection {
  type: string;
  name: string;
  features: VenueFeature[];
}

// Категории и города
const CATEGORIES = [
  { id: "all", name: "Всё", icon: "🌐", color: "bg-emerald-500" },
  { id: "Бар", name: "Бары", icon: "🍸", color: "bg-purple-500" },
  { id: "Еда", name: "Рестораны", icon: "🍽️", color: "bg-red-500" },
  { id: "Магазины", name: "Магазины", icon: "🛒", color: "bg-blue-500" },
  { id: "Красота", name: "Красота", icon: "💇", color: "bg-pink-500" },
  { id: "Одежда", name: "Одежда", icon: "👕", color: "bg-green-500" },
  { id: "Техника", name: "Техника", icon: "📱", color: "bg-gray-500" },
  { id: "Коворкинги", name: "Коворкинги", icon: "🏢", color: "bg-yellow-500" },
  { id: "Курсы", name: "Курсы", icon: "📚", color: "bg-indigo-500" },
  { id: "Развлечения", name: "Развлечения", icon: "🎭", color: "bg-orange-500" },
  { id: "Разное", name: "Разное", icon: "🔍", color: "bg-teal-500" },
];

const CITIES = [
  { id: "BG", name: "Белград" },
  { id: "NS", name: "Нови-Сад" },
  { id: "Mitrovica", name: "Митровица" },
];

// Инициализация Prisma клиента
const prisma = new PrismaClient();

// Путь к директории с JSON-файлами
const DATA_DIR = path.join(process.cwd(), 'public', 'data');

/**
 * Функция для чтения JSON-файла
 */
async function readJsonFile(filePath: string): Promise<VenueCollection> {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent) as VenueCollection;
  } catch (error) {
    console.error(`Ошибка при чтении файла ${filePath}:`, error);
    return {
      type: "FeatureCollection",
      name: "",
      features: []
    };
  }
}

/**
 * Функция для инициализации базы данных категориями и городами
 */
async function initializeDatabase() {
  try {
    console.log('Инициализация категорий...');
    
    // Создаем категории
    for (const category of CATEGORIES) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: {
          name: category.name,
          icon: category.icon,
          color: category.color
        },
        create: {
          id: category.id,
          name: category.name,
          icon: category.icon,
          color: category.color
        }
      });
    }
    
    console.log('Инициализация городов...');
    
    // Создаем города
    for (const city of CITIES) {
      await prisma.city.upsert({
        where: { id: city.id },
        update: { name: city.name },
        create: {
          id: city.id,
          name: city.name
        }
      });
    }
    
    console.log('База данных инициализирована успешно');
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    throw error;
  }
}

/**
 * Функция для миграции данных из JSON-файла в базу данных
 */
async function migrateJsonToDatabase(categoryId: string) {
  try {
    console.log(`Миграция данных для категории ${categoryId}...`);
    
    // Путь к файлу категории
    const filePath = path.join(DATA_DIR, `${categoryId}.geojson`);
    
    // Проверяем существование файла
    if (!fs.existsSync(filePath)) {
      console.log(`Файл ${filePath} не существует, пропускаем...`);
      return;
    }
    
    // Читаем JSON-файл
    const geoJson = await readJsonFile(filePath);
    
    // Обрабатываем каждое место
    for (const feature of geoJson.features) {
      await processFeature(feature, categoryId);
    }
    
    console.log(`Миграция данных для категории ${categoryId} завершена успешно`);
  } catch (error) {
    console.error(`Ошибка при миграции данных для категории ${categoryId}:`, error);
  }
}

/**
 * Функция для обработки одного места
 */
async function processFeature(feature: VenueFeature, categoryId: string) {
  try {
    const { Name, description } = feature.properties;
    const coordinates = feature.geometry.coordinates;
    
    // Извлекаем город из названия (первое слово)
    const nameParts = Name.split(' ');
    const cityId = nameParts[0];
    const name = nameParts.slice(1).join(' ');
    
    // Проверяем, существует ли город
    const city = await prisma.city.findUnique({
      where: { id: cityId }
    });
    
    // Если город не существует, используем первый город из списка
    const finalCityId = city ? cityId : CITIES[0].id;
    
    // Проверяем, существует ли место с такими координатами
    const existingPlace = await prisma.place.findFirst({
      where: {
        latitude: coordinates[1],
        longitude: coordinates[0]
      }
    });
    
    if (existingPlace) {
      console.log(`Место ${Name} уже существует, пропускаем...`);
      return;
    }
    
    // Генерируем ссылку на изображение на основе названия заведения
    let imageUrl = null;
    
    // Формируем имя файла на основе названия заведения
    // Заменяем пробелы на дефисы и удаляем специальные символы
    const fileName = Name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
    
    // Проверяем, существует ли изображение для этого заведения
    const imagePath = path.join(process.cwd(), 'public', 'images', 'venues', `${fileName}.svg`);
    if (fs.existsSync(imagePath)) {
      imageUrl = `/images/venues/${fileName}.svg`;
    } else {
      // Проверяем наличие JPG
      const jpgPath = path.join(process.cwd(), 'public', 'images', 'venues', `${fileName}.jpg`);
      if (fs.existsSync(jpgPath)) {
        imageUrl = `/images/venues/${fileName}.jpg`;
      }
    }
    
    // Создаем новое место
    await prisma.place.create({
      data: {
        name,
        description,
        imageUrl,
        latitude: coordinates[1],
        longitude: coordinates[0],
        altitude: coordinates[2] || 0,
        categoryId,
        cityId: finalCityId
      }
    });
    
    console.log(`Место ${Name} добавлено успешно`);
  } catch (error) {
    console.error(`Ошибка при обработке места ${feature.properties.Name}:`, error);
  }
}

/**
 * Главная функция миграции
 */
async function migrateAllData() {
  try {
    // Инициализируем базу данных
    await initializeDatabase();
    
    // Получаем список всех JSON-файлов
    const files = fs.readdirSync(DATA_DIR).filter(file => file.endsWith('.geojson'));
    
    // Обрабатываем каждый файл
    for (const file of files) {
      const categoryId = path.basename(file, '.geojson');
      await migrateJsonToDatabase(categoryId);
    }
    
    console.log('Миграция данных завершена успешно');
  } catch (error) {
    console.error('Ошибка при миграции данных:', error);
  } finally {
    // Закрываем соединение с базой данных
    await prisma.$disconnect();
  }
}

// Проверяем, запущен ли скрипт напрямую
if (require.main === module) {
  // Запускаем миграцию
  migrateAllData().catch(error => {
    console.error('Критическая ошибка при миграции данных:', error);
    process.exit(1);
  });
} 