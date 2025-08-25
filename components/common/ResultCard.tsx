'use client';

import { CouponApplyResult } from "@/hooks/useCouponOptimizer";
import { useEffect, useRef } from "react";
import { useSpring, useTransition, animated } from '@react-spring/web';

export interface UnusedCoupon {
  amount: number;
  percent: number;
}

export interface ResultCardProps {
  results: CouponApplyResult[];
  totalDiscount: number;
  totalPayment: number;
  unusedProducts: number[];
  unusedCoupons: UnusedCoupon[];
  progress: number;
  isProgressVisible: boolean;
  hasResult: boolean;
  resetKey: string;
  isRecalculated: boolean;
  prevTotalPayment: number;
  prevTotalDiscount: number;
}

function usePrevious<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => { ref.current = value; }, [value]);
  return ref.current;
}

function AnimatedNumber({ value }: { value: number }) {
  const prev = usePrevious(value);
  const isFirst = useRef(true);

  const { number } = useSpring({
    from: { number: isFirst.current ? 0 : prev ?? 0 },
    number: value,
    reset: isFirst.current || prev !== value,
    config: { tension: 170, friction: 26 }
  });

  useEffect(() => {
    isFirst.current = false;
  }, []);

  return <animated.span>{number.to((n) => Math.round(n).toLocaleString())}</animated.span>;
}

const ProgressSection = ({ isLoading, isProgressVisible, progress }: { isLoading: boolean; isProgressVisible: boolean; progress: number; }) => {
  const { width } = useSpring({ width: isProgressVisible ? `${progress * 100}%` : '0%', config: { duration: 500 } });
  if (isLoading && isProgressVisible) {
    return (
      <div className="flex flex-col items-center justify-center py-12 w-full">
        <div className="w-full max-w-xs mb-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse" />
        </div>
        <div className="text-gray-400 mb-2">최적의 조합을 찾고 있습니다...</div>
        <div className="text-xs text-gray-500">잠시만 기다려주세요.</div>
      </div>
    );
  }
  if (!isProgressVisible || progress >= 1) return null;
  return (
    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
      <animated.div
        className="h-full bg-slate-600 dark:bg-slate-400"
        style={{ width }}
      />
    </div>
  );
}

export const ResultCard = ({
  results,
  totalDiscount,
  totalPayment,
  unusedProducts,
  unusedCoupons,
  progress,
  isProgressVisible,
  hasResult,
}: ResultCardProps) => {
  const transitions = useTransition(results, {
    from: { opacity: 0, y: 20, scale: 0.95 },
    enter: { opacity: 1, y: 0, scale: 1 },
    keys: results.map(r => r.id ?? String(Math.random())),
    config: { tension: 170, friction: 26 },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 shadow-sm flex flex-col items-center">
          <div className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">총 결제 금액</div>
          {!hasResult && isProgressVisible ? (
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-600 rounded animate-pulse mb-1" />
          ) : (
            <div className="text-2xl font-extrabold text-slate-700 dark:text-slate-200">
              <AnimatedNumber value={totalPayment} />원
            </div>
          )}
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 shadow-sm flex flex-col items-center">
          <div className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">총 할인액</div>
          {!hasResult && isProgressVisible ? (
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-600 rounded animate-pulse mb-1" />
          ) : (
            <div className="text-2xl font-extrabold text-green-600 dark:text-green-400">
              <AnimatedNumber value={totalDiscount} />원
            </div>
          )}
        </div>
      </div>
      <ul className="space-y-1">
        {transitions((style, r) => {
          const subsetSum = r.applied.reduce((a: number, b: number) => a + b, 0);
          return (
            <animated.li
              key={r.id}
              style={style}
              className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 shadow-sm flex flex-col gap-2"
            >
              <div className="font-semibold text-slate-600 dark:text-slate-300">
                쿠폰 적용한도 {r.couponAmount.toLocaleString()}원 / {r.percent}% 할인
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-300">적용 상품: {r.applied.map((p: number) => p.toLocaleString() + "원").join(", ")}</div>
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <span>합계: {subsetSum.toLocaleString()}원</span>
                {subsetSum > r.couponAmount && (
                  <span className="text-red-500 font-semibold">
                    (초과: {(subsetSum - r.couponAmount).toLocaleString()}원)
                  </span>
                )}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 font-bold">할인액: {r.discount.toLocaleString()}원</div>
            </animated.li>
          );
        })}
      </ul>
      <ProgressSection
        isLoading={!hasResult && progress === 0}
        isProgressVisible={isProgressVisible}
        progress={progress}
      />
      <div className="flex flex-col gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
        {isProgressVisible ? (
          <>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300">미적용 상품:</span>
              <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded animate-pulse flex-grow max-w-xs" />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300">미사용 쿠폰:</span>
              <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded animate-pulse flex-grow max-w-sm" />
            </div>
          </>
        ) : (
          <>
            <div className="text-sm text-slate-700 dark:text-slate-300">
              <span className="font-semibold">미적용 상품:</span> {unusedProducts.length === 0 ? "없음" : unusedProducts.map((p) => p.toLocaleString() + "원").join(", ")}
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300">
              <span className="font-semibold">미사용 쿠폰:</span> {unusedCoupons.length === 0 ? "없음" : unusedCoupons.map((c, i) => (
                <span key={`${c.amount}_${c.percent}_${i}`}>
                  적용한도 {c.amount.toLocaleString()}원 / {c.percent}% 할인
                  {i < unusedCoupons.length - 1 && <span className="text-slate-400 dark:text-slate-500">, </span>}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}