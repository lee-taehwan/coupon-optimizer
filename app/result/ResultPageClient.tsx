'use client';

import { ResultCard, UnusedCoupon } from "@/_components/common";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { decodeQueryToInput } from "@/lib/utils";
import React from "react";
import { createCouponOptimizerAsync, CouponApplyResult } from "@/hooks/useCouponOptimizer";

export default function ResultPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const toastTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const [canRecalculate, setCanRecalculate] = useState(false);

  const [results, setResults] = useState<CouponApplyResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  
  const strategy = searchParams.get('strategy') === 'no-exceed' ? 'no-exceed' : 'default';

  const queryString = searchParams.toString();
  const { products: queryProducts, coupons: queryCoupons } = useMemo(() =>
    decodeQueryToInput(queryString),
    [queryString]
  );
  const hasInput = queryProducts.length > 0 && queryCoupons.length > 0;

  // 페이지 로드 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const optimizer = useMemo(() => createCouponOptimizerAsync(queryProducts, queryCoupons), [queryProducts, queryCoupons]);

  useEffect(() => {
    let cancelled = false;
    
    setResults([]);
    setProgress(0);
    setDone(false);
    setCanRecalculate(false);

    optimizer.run((partial, isDone, prog) => {
      if (cancelled) return;
      
      if (partial.length > 0) {
        setResults(prev => [...prev, ...partial]);
      }
      
      setProgress(prog);
      if (isDone) setDone(true);
    }, 
    () => {
      setCanRecalculate(true);
    },
    strategy);
    
    return () => { cancelled = true; };
  }, [optimizer, strategy]);

  const totalDiscount = useMemo(() => results.reduce((sum, r) => sum + r.discount, 0), [results]);
  const totalOriginalPrice = useMemo(() => queryProducts.reduce((acc, p) => acc + p.price * p.count, 0), [queryProducts]);
  const totalPayment = totalOriginalPrice - totalDiscount;
  const isProgressVisible = !done && progress < 1;
  const hasResult = results.length > 0;

  const { unusedProducts, unusedCoupons } = useMemo(() => {
    if (!done) return { unusedProducts: [], unusedCoupons: [] };
    
    const usedProductPrices = results.flatMap(r => r.applied);
    const originalProducts = queryProducts.flatMap(p => Array(p.count).fill(p.price));
    const usedProductCounts = new Map<number, number>();
    usedProductPrices.forEach(price => usedProductCounts.set(price, (usedProductCounts.get(price) || 0) + 1));
    const unusedProductsResult: number[] = [];
    originalProducts.forEach(price => {
      const used = usedProductCounts.get(price) || 0;
      if (used > 0) usedProductCounts.set(price, used - 1);
      else unusedProductsResult.push(price);
    });

    const usedCoupons = results.map(r => ({ amount: r.couponAmount, percent: r.percent }));
    const originalCoupons = queryCoupons.flatMap(c => Array(c.count).fill({ amount: c.amount, percent: c.percent }));
    const usedCouponCounts = new Map<string, number>();
    usedCoupons.forEach(c => {
      const key = `${c.amount}-${c.percent}`;
      usedCouponCounts.set(key, (usedCouponCounts.get(key) || 0) + 1);
    });
    const unusedCouponsResult: UnusedCoupon[] = [];
    originalCoupons.forEach(c => {
      const key = `${c.amount}-${c.percent}`;
      const used = usedCouponCounts.get(key) || 0;
      if (used > 0) usedCouponCounts.set(key, used - 1);
      else unusedCouponsResult.push(c);
    });

    return { unusedProducts: unusedProductsResult, unusedCoupons: unusedCouponsResult };
  }, [done, results, queryProducts, queryCoupons]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  
  const handleRecalculate = () => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set('strategy', 'no-exceed');
    router.replace(`${pathname}?${currentParams.toString()}`);
  };

  const showRecalculateButton = done && canRecalculate && strategy === 'default';

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 mt-8 flex flex-col gap-8 border border-slate-200 dark:border-slate-700 transition-colors">
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold text-lg text-slate-800 dark:text-slate-200">최적 쿠폰 적용 결과</div>
        <button
          onClick={handleCopy}
          className="px-3 py-1 rounded bg-slate-600 text-white text-sm font-semibold shadow hover:bg-slate-700 transition"
        >
          링크 공유
        </button>
      </div>
      {copied && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-4 py-2 rounded shadow text-sm animate-fade-in-out">
          링크가 복사되었습니다!
        </div>
      )}
      {!hasInput ? (
        <div className="text-center text-gray-400 text-lg py-12">상품과 쿠폰을 모두 입력해 주세요.</div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            <ResultCard
              results={results}
              totalDiscount={totalDiscount}
              totalPayment={totalPayment}
              unusedProducts={unusedProducts}
              unusedCoupons={unusedCoupons}
              progress={progress}
              isProgressVisible={isProgressVisible}
              hasResult={hasResult}
            />
            {done && (
              <div className="text-center text-green-600 dark:text-green-300 font-bold mt-4">
                {strategy === 'no-exceed' ? '재계산 완료!' : '계산 완료!'}
              </div>
            )}
          </div>
        </>
      )}
      <div className="flex justify-between items-center">
        <div>
          {showRecalculateButton && (
            <button 
              onClick={handleRecalculate}
              className="px-4 py-2 rounded bg-slate-600 text-white hover:bg-slate-700 transition font-semibold"
            >
              최대할인적용
            </button>
          )}
        </div>
        <Link href="/">
          <button className="px-4 py-2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition font-semibold">
            입력으로 돌아가기
          </button>
        </Link>
      </div>
    </div>
  );
} 