# Сербия Гид - Сборник мест от cdROma

Интерактивный путеводитель по интересным местам Сербии, собранный cdROma. Проект помогает найти лучшие бары, рестораны, магазины и другие заведения в Белграде, Нови-Саде и других городах Сербии.

## Особенности

- 🌍 Коллекция проверенных мест в Сербии от русскоязычного сообщества
- 🔍 Удобная фильтрация по категориям, городам и типам заведений
- 🔎 Быстрый поиск по названию и описанию
- 📱 Адаптивный дизайн для использования на любых устройствах
- 🗺️ Интеграция с Google Maps для легкой навигации к выбранным местам
- 🚀 Автоматический деплой на Vercel через GitHub Actions

## Технологии

- Next.js 14
- TypeScript
- Tailwind CSS
- React Context API для управления состоянием
- GitHub Actions для CI/CD
- Vercel для хостинга

## Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/places-explorer.git
cd places-explorer
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите приложение в режиме разработки:
```bash
npm run dev
```

4. Откройте [http://localhost:3000](http://localhost:3000) в вашем браузере.

## Структура данных

Приложение использует GeoJSON файлы из директории `public/data/`. Каждый файл представляет отдельную категорию заведений:

- Бар.geojson - Бары и кафе
- Еда.geojson - Рестораны и заведения общепита
- Красота.geojson - Салоны красоты
- Магазины.geojson - Магазины
- и другие...

## Структура проекта

```
places-explorer/
├── .github/
│   └── workflows/      # GitHub Actions конфигурация
├── public/
│   └── data/           # GeoJSON файлы с данными
├── src/
│   ├── app/            # Страницы приложения
│   ├── components/     # React компоненты
│   ├── context/        # Context API для управления состоянием
│   ├── types/          # TypeScript типы
│   └── utils/          # Вспомогательные функции
└── ...
```

## Деплой

Проект настроен на автоматический деплой на Vercel при пуше в ветку `main`. Для настройки автоматического деплоя:

1. Создайте проект на Vercel и свяжите его с GitHub репозиторием
2. Получите необходимые токены и ID проекта из Vercel
3. Добавьте секреты в GitHub репозиторий (см. `.github/README.md`)

Подробные инструкции по настройке деплоя находятся в файле `.github/README.md`.

## Лицензия

MIT
