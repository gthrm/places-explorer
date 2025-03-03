export interface VenueProperties {
  id: string;
  Name: string;
  description: string | null;
  imageUrl: string | null;
  categoryId: string;
}

export interface VenueGeometry {
  type: string;
  coordinates: [number, number, number];
}

export interface VenueFeature {
  id: string;
  type: string;
  properties: VenueProperties;
  geometry: VenueGeometry;
}

export interface VenueCollection {
  type: string;
  name: string;
  features: VenueFeature[];
}

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: "all", name: "Всё", icon: "🌐", color: "bg-emerald-500" },
  { id: "Бар", name: "Бары", icon: "🍸", color: "bg-purple-500" },
  { id: "Еда", name: "Еда", icon: "🍽️", color: "bg-red-500" },
  { id: "Магазины", name: "Магазины", icon: "🛒", color: "bg-blue-500" },
  { id: "Красота", name: "Красота", icon: "💇", color: "bg-pink-500" },
  { id: "Одежда", name: "Одежда", icon: "👕", color: "bg-green-500" },
  { id: "Техника", name: "Техника", icon: "📱", color: "bg-gray-500" },
  { id: "Коворкинги", name: "Коворкинги", icon: "🏢", color: "bg-yellow-500" },
  { id: "Курсы", name: "Курсы", icon: "📚", color: "bg-indigo-500" },
  {
    id: "Развлечения",
    name: "Развлечения",
    icon: "🎭",
    color: "bg-orange-500",
  },
  { id: "Разное", name: "Разное", icon: "🔍", color: "bg-teal-500" },
];

export const getCategoryInfo = (categoryId: string): CategoryInfo => {
  return (
    CATEGORIES.find((cat) => cat.id === categoryId) || {
      id: categoryId,
      name: categoryId,
      icon: "🏠",
      color: "bg-gray-500",
    }
  );
};

export interface VenueType {
  type: string;
  count: number;
}

export interface City {
  id: string;
  name: string;
}

export const CITIES: City[] = [
  { id: "BG", name: "Белград" },
  { id: "NS", name: "Нови-Сад" },
  { id: "Mitrovica", name: "Митровица" },
];
