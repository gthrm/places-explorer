#!/usr/bin/env ts-node

import { spawn } from 'child_process';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

// Функция для запуска команды
function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`Выполняю команду: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, { stdio: 'inherit', shell: true });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Команда завершилась с кодом ${code}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Главная функция
async function main() {
  try {
    // Шаг 1: Генерация Prisma клиента
    console.log('Шаг 1: Генерация Prisma клиента');
    await runCommand('npx', ['prisma', 'generate']);
    
    // Шаг 2: Применение миграций
    console.log('Шаг 2: Применение миграций');
    await runCommand('npx', ['prisma', 'migrate', 'deploy']);
    
    // Шаг 3: Миграция данных из JSON в PostgreSQL
    console.log('Шаг 3: Миграция данных из JSON в PostgreSQL');
    await runCommand('ts-node', ['--project', 'tsconfig.scripts.json', 'scripts/migrations/json-to-postgres.ts']);
    
    console.log('Миграция завершена успешно');
  } catch (error) {
    console.error('Ошибка при миграции:', error);
    process.exit(1);
  }
}

// Запускаем скрипт
main(); 