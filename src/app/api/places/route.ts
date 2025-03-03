import { NextResponse } from 'next/server';
import { getAllPlaces, convertToGeoJson } from '@/utils/dbUtils';

// Обработчик GET-запросов для получения всех мест
export async function GET() {
  try {
    // Получаем все места из базы данных
    const places = await getAllPlaces();
    
    // Преобразуем в формат GeoJSON
    const geoJson = convertToGeoJson(places);
    
    return NextResponse.json(geoJson);
  } catch (error) {
    console.error('Ошибка при получении мест:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 