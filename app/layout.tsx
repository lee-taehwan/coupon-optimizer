import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/components/layout/providers";
import { ThemeHandler, ScrollController } from "@/components/ui";
import { LayoutRenderer } from "@/components/layout/layout-renderer";

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
          <ScrollController />
          <ThemeHandler />
          <LayoutRenderer>{children}</LayoutRenderer>
        </Providers>
      </body>
    </html>
  );
}
