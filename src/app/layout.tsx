import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import ThemeToggle from "@/components/ThemeToggle";
import { Providers } from "./providers";
import Footer from "@/components/Footer";
import { ThemeHandler } from "@/components/ThemeHandler";
import AdBanner from "@/components/AdBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "쿠폰 최적 적용 계산기",
  description: "쿠폰 최적화 웹",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-gray-100 transition-colors duration-300`}
      >
        <Providers>
          <ThemeHandler />
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>
            <main className="flex-grow">{children}</main>
            <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">
              <AdBanner />
            </div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
