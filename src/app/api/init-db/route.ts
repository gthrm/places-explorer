import { NextResponse } from "next/server";
import { initializeDatabase } from "@/utils/dbUtils";

// Обработчик GET-запросов для инициализации базы данных
export async function GET() {
  try {
    // Инициализируем базу данных
    const success = await initializeDatabase();

    if (success) {
      return NextResponse.json({
        message: "База данных инициализирована успешно",
      });
    } else {
      return NextResponse.json(
        { error: "Ошибка при инициализации базы данных" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Ошибка при инициализации базы данных:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
