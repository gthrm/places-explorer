import { NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { addPlace } from '@/utils/dbUtils';
import { extractCoordinatesFromUrl } from '@/utils/telegramUtils';

// Инициализация бота
const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  console.error('TELEGRAM_BOT_TOKEN не найден в переменных окружения');
}

const bot = new Telegraf(botToken || '');

// Состояния для диалога с пользователем
interface PlaceData {
  name: string;
  category: string;
  description: string | null;
  imageUrl: string | null;
  coordinates: [number, number];
  city: string;
}

// Хранение состояний пользователей
const userStates: Record<number, {
  state: 'idle' | 'waiting_for_name' | 'waiting_for_category' | 'waiting_for_description' | 'waiting_for_image' | 'waiting_for_city';
  placeData: Partial<PlaceData>;
  messageId?: number;
}> = {};

// Функция для сохранения места в базу данных
async function savePlaceToDatabase(placeData: PlaceData): Promise<boolean> {
  try {
    const { name, category, description, imageUrl, coordinates, city } = placeData;
    const [longitude, latitude] = coordinates;
    
    // Добавляем место в базу данных
    const place = await addPlace(
      name,
      description,
      imageUrl,
      latitude,
      longitude,
      category,
      city
    );
    
    return !!place;
  } catch (error) {
    console.error('Ошибка при сохранении места:', error);
    return false;
  }
}

// Обработчики команд бота
bot.start((ctx) => {
  ctx.reply('Привет! Я бот для добавления новых мест в Places Explorer. Отправь мне ссылку на место в Google Maps, и я помогу тебе добавить его в каталог.');
});

bot.help((ctx) => {
  ctx.reply('Отправь мне ссылку на место в Google Maps, и я помогу тебе добавить его в каталог.');
});

// Обработка ссылок на Google Maps
bot.on(message('text'), async (ctx) => {
  const userId = ctx.from.id;
  const messageText = ctx.message.text;
  
  // Если пользователь находится в процессе добавления места
  if (userStates[userId] && userStates[userId].state !== 'idle') {
    const state = userStates[userId].state;
    
    if (state === 'waiting_for_name') {
      userStates[userId].placeData.name = messageText;
      userStates[userId].state = 'waiting_for_category';
      
      // Отправляем список доступных категорий
      await ctx.reply('Выберите категорию места:', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Бар', callback_data: 'category_Бар' }, { text: 'Еда', callback_data: 'category_Еда' }],
            [{ text: 'Магазины', callback_data: 'category_Магазины' }, { text: 'Красота', callback_data: 'category_Красота' }],
            [{ text: 'Одежда', callback_data: 'category_Одежда' }, { text: 'Техника', callback_data: 'category_Техника' }],
            [{ text: 'Коворкинги', callback_data: 'category_Коворкинги' }, { text: 'Курсы', callback_data: 'category_Курсы' }],
            [{ text: 'Развлечения', callback_data: 'category_Развлечения' }, { text: 'Разное', callback_data: 'category_Разное' }]
          ]
        }
      });
      return;
    }
    
    if (state === 'waiting_for_description') {
      userStates[userId].placeData.description = messageText === 'Нет' ? null : messageText;
      userStates[userId].state = 'waiting_for_image';
      
      await ctx.reply('Введите ссылку на изображение места (или напишите "Нет", если изображение отсутствует):');
      return;
    }
    
    if (state === 'waiting_for_image') {
      userStates[userId].placeData.imageUrl = messageText === 'Нет' ? null : messageText;
      userStates[userId].state = 'waiting_for_city';
      
      // Отправляем список доступных городов
      await ctx.reply('Выберите город:', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Белград (BG)', callback_data: 'city_BG' }],
            [{ text: 'Нови-Сад (NS)', callback_data: 'city_NS' }],
            [{ text: 'Митровица', callback_data: 'city_Mitrovica' }],
            [{ text: 'Другой', callback_data: 'city_other' }]
          ]
        }
      });
      return;
    }
    
    return;
  }
  
  // Проверяем, является ли сообщение ссылкой на Google Maps
  if (messageText.includes('google.com/maps') || messageText.includes('goo.gl/maps')) {
    const coordinates = extractCoordinatesFromUrl(messageText);
    
    if (!coordinates) {
      await ctx.reply('Не удалось извлечь координаты из ссылки. Пожалуйста, отправьте корректную ссылку на Google Maps.');
      return;
    }
    
    // Инициализируем процесс добавления места
    userStates[userId] = {
      state: 'waiting_for_name',
      placeData: {
        coordinates
      }
    };
    
    await ctx.reply('Отлично! Я нашел координаты места. Теперь введите название места:');
  } else {
    await ctx.reply('Пожалуйста, отправьте ссылку на место в Google Maps.');
  }
});

// Обработка выбора категории
bot.action(/category_(.+)/, async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId || !userStates[userId]) return;
  
  const category = ctx.match[1];
  userStates[userId].placeData.category = category;
  userStates[userId].state = 'waiting_for_description';
  
  await ctx.editMessageText('Категория выбрана: ' + category);
  await ctx.reply('Введите описание места (или напишите "Нет", если описание отсутствует):');
});

// Обработка выбора города
bot.action(/city_(.+)/, async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId || !userStates[userId]) return;
  
  const city = ctx.match[1];
  userStates[userId].placeData.city = city === 'other' ? '' : city;
  
  await ctx.editMessageText('Город выбран: ' + (city === 'other' ? 'Другой' : city));
  
  // Сохраняем место
  const placeData = userStates[userId].placeData as PlaceData;
  const success = await savePlaceToDatabase(placeData);
  
  if (success) {
    await ctx.reply(`Место "${placeData.name}" успешно добавлено в категорию "${placeData.category}"!`);
  } else {
    await ctx.reply('Произошла ошибка при сохранении места. Пожалуйста, попробуйте еще раз.');
  }
  
  // Сбрасываем состояние пользователя
  userStates[userId] = {
    state: 'idle',
    placeData: {}
  };
});

// Для локальной разработки используем long polling
if (process.env.NODE_ENV !== 'production') {
  console.log('Запускаем бота в режиме long polling...');
  bot.launch().catch(err => {
    console.error('Ошибка при запуске бота:', err);
  });
} else {
  // В продакшене используем webhook
  bot.telegram.setWebhook(`${process.env.NEXT_PUBLIC_BASE_URL}/api/telegram`).catch(err => {
    console.error('Ошибка при установке вебхука:', err);
  });
}

// Обработчик POST-запросов (вебхуки от Telegram)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Ошибка при обработке вебхука:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

// Обработчик GET-запросов (для проверки работоспособности)
export async function GET() {
  return NextResponse.json({ ok: true, message: 'Telegram webhook is working' });
}
