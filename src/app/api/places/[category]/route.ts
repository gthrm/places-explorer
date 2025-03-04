import { NextResponse } from 'next/server';
import { getPlacesByCategory, convertToGeoJson } from '@/utils/dbUtils';
import type { NextRequest } from 'next/server';

// Функция для извлечения параметра category из URL
function extractCategoryFromUrl(url: string): string {
  const segments = url.split('/');
  return segments[segments.length - 1];
}

// Обработчик GET-запросов для получения мест по категории
export async function GET(request: NextRequest) {
  try {
    // Извлекаем параметр category из URL
    const { pathname } = request.nextUrl;
    const category = extractCategoryFromUrl(pathname);
    
    // Если категория "all", возвращаем все места
    if (category === 'all') {
      // Импортируем функцию getAllPlaces только при необходимости
      const { getAllPlaces } = await import('@/utils/dbUtils');
      const places = await getAllPlaces();
      const geoJson = convertToGeoJson(places);
      return NextResponse.json(geoJson);
    }
    
    // Получаем места по категории
    const places = await getPlacesByCategory(category);
    
    // Преобразуем в формат GeoJSON
    const geoJson = convertToGeoJson(places);
    
    return NextResponse.json(geoJson);
  } catch (error) {
    console.error(`Ошибка при получении мест:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 