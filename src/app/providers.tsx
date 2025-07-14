'use client';

import { ThemeProvider } from 'next-themes';
import { InputProvider } from '@/context/InputContext';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
    >
      <InputProvider>{children}</InputProvider>
    </ThemeProvider>
  );
} 