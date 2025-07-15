'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

const lightColor = '#f1f5f9';
const darkColor = '#020617';

export function ThemeHandler() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    
    metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? darkColor : lightColor);
  }, [resolvedTheme]);

  return null;
} 