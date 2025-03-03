import { PrismaClient } from '@prisma/client';

// Создаем глобальный экземпляр PrismaClient для предотвращения множественных подключений
// в режиме разработки при горячей перезагрузке
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma; 