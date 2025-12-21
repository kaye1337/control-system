import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Service Booking System",
  description: "Boss, Customer, Waiter management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <LanguageSwitcher />
          <main className="min-h-screen bg-gray-50 text-gray-900">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
