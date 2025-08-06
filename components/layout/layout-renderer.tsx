'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { Header, Footer } from "@/components/layout";
import { ReactNode } from 'react';
import { ThemeToggle } from "@/components/ui";
import Script from "next/script";

export function LayoutRenderer({ children }: { children: ReactNode }) {
  const selectedLayoutSegment = useSelectedLayoutSegment();
  const isNotFound = selectedLayoutSegment === '/_not-found';
  
  return (
    <div className="flex flex-col min-h-screen">
      {!isNotFound && 
        <>
          <Header />
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
        </>        
      }
      <main className="flex-grow">{children}</main>
      {!isNotFound && 
        <>
          <Script
            type="text/javascript"
            src="//t1.daumcdn.net/kas/static/ba.min.js"
            async
          />
          <div className="w-full flex justify-center items-center py-4">
            <ins
              className="kakao_ad_area"
              style={{ display: "none" }}
              data-ad-unit="DAN-D5PYicqSK3hSZsHW"
              data-ad-width="300"
              data-ad-height="250"
            />
          </div>
          <Footer />
        </>
      }
    </div>
  );
}
