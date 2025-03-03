import { NextResponse } from 'next/server';
import { getPlacesByCategory, convertToGeoJson } from '@/utils/dbUtils';
import type { NextRequest } from 'next/server';

interface RouteParams {
  params: {
    category: string;
  };
}

// Обработчик GET-запросов для получения мест по категории
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { category } = params;
    
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
    console.error(`Ошибка при получении мест категории ${params.category}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 