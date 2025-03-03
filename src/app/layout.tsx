import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Сербия Гид - Сборник мест от cdROma",
  description: "Интерактивный путеводитель по интересным местам Сербии: бары, рестораны, магазины и другие заведения в Белграде, Нови-Саде и других городах",
  openGraph: {
    title: "Сербия Гид - Сборник мест от cdROma",
    description: "Интерактивный путеводитель по интересным местам Сербии",
    type: "website",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Сербия Гид - Сборник мест от cdROma",
    description: "Интерактивный путеводитель по интересным местам Сербии",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow bg-gray-50">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
              {children}
              <Analytics />
            </div>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
