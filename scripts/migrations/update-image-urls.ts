import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

// Инициализация Prisma клиента
const prisma = new PrismaClient();

/**
 * Функция для обновления ссылок на изображения в базе данных
 */
async function updateImageUrls() {
  try {
    console.log('Обновление ссылок на изображения...');
    
    // Получаем все места из базы данных
    const places = await prisma.place.findMany({
      include: {
        city: true
      }
    });
    
    let updatedCount = 0;
    
    // Обрабатываем каждое место
    for (const place of places) {
      // Формируем полное название места (с префиксом города)
      const fullName = `${place.city.id} ${place.name}`;
      
      // Формируем имя файла на основе названия заведения
      // Заменяем пробелы на дефисы и удаляем специальные символы
      const fileName = fullName.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
      
      // Проверяем, существует ли изображение для этого заведения
      let imageUrl = null;
      
      // Проверяем SVG
      const svgPath = path.join(process.cwd(), 'public', 'images', 'venues', `${fileName}.svg`);
      if (fs.existsSync(svgPath)) {
        imageUrl = `/images/venues/${fileName}.svg`;
      } else {
        // Проверяем JPG
        const jpgPath = path.join(process.cwd(), 'public', 'images', 'venues', `${fileName}.jpg`);
        if (fs.existsSync(jpgPath)) {
          imageUrl = `/images/venues/${fileName}.jpg`;
        }
      }
      
      // Если нашли изображение, обновляем запись в базе данных
      if (imageUrl && place.imageUrl !== imageUrl) {
        await prisma.place.update({
          where: { id: place.id },
          data: { imageUrl }
        });
        
        updatedCount++;
        console.log(`Обновлено место "${fullName}" с изображением ${imageUrl}`);
      }
    }
    
    console.log(`Обновлено ${updatedCount} мест из ${places.length}`);
  } catch (error) {
    console.error('Ошибка при обновлении ссылок на изображения:', error);
  } finally {
    // Закрываем соединение с базой данных
    await prisma.$disconnect();
  }
}

// Запускаем обновление
updateImageUrls().catch(error => {
  console.error('Критическая ошибка при обновлении ссылок на изображения:', error);
  process.exit(1);
}); 