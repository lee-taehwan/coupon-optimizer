'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function NotFoundClient() {
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
    <p className="mt-4 text-slate-500 dark:text-slate-500">
      {countdown}초 후 자동으로 홈으로 이동합니다.
    </p>
  );
}
