'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const countdownTime = 5;
  const [countdown, setCountdown] = useState(countdownTime);
  const router = useRouter();
  
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.push('/');
    }, countdownTime * 1000);
  
    const countdownInterval = setInterval(() => {
      setCountdown((prevCountdown) => (prevCountdown > 0 ? prevCountdown - 1 : 0));
    }, 1000);
  
    return () => {
      clearTimeout(redirectTimer);
      clearInterval(countdownInterval);
    };
  }, [router]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-slate-800 dark:text-slate-200">404</h1>
        <p className="mt-4 text-2xl font-semibold text-slate-600 dark:text-slate-400">페이지를 찾을 수 없습니다.</p>
        <p className="mt-2 text-slate-500 dark:text-slate-500">요청하신 URL을 서버에서 찾을 수 없습니다.</p>
        <div className="mt-8">
          <Link href="/" className="px-6 py-3 text-lg font-semibold text-white bg-slate-800 rounded-md hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-800 dark:hover:bg-slate-300 transition-colors">
            홈으로 이동
          </Link>
        </div>
        <p className="mt-4 text-slate-500 dark:text-slate-500">
          {countdown}초 후 자동으로 홈으로 이동합니다.
        </p>
      </div>
    </div>
  );
}

