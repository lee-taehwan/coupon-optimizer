'use client';
import { CouponApplyResult } from "@/hooks/useCouponOptimizer";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';

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
}

function useAnimatedNumber(target: number, duration = 500) {
  const [displayValue, setDisplayValue] = useState(target);
  const motionValue = useMotionValue(target);

  useEffect(() => {
    if (motionValue.get() === target) return;

    const unsubscribe = motionValue.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });

    const controls = animate(motionValue, target, { duration: duration / 1000, ease: "easeOut" });

    return () => {
      unsubscribe();
      controls.stop();
    };
  }, [target, motionValue, duration]);

  return displayValue;
}

interface ProgressSectionProps {
  isLoading: boolean;
  isProgressVisible: boolean;
  progress: number;
}

function ProgressSection({ isLoading, isProgressVisible, progress }: ProgressSectionProps) {
  if (isLoading && progress === 0) {
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

  if (!isProgressVisible || progress >= 1) {
    return null;
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full max-w-xs mb-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${Math.floor(progress * 100)}%` }}
            transition={{ duration: 0.3, ease: "linear" }}
          />
        </div>
      </div>
      <motion.div
        className="text-gray-400 mb-2"
        key={`text-${Math.floor(progress * 100)}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3}}
      >
        계산 중...
      </motion.div>
      <motion.div
        className="text-xs text-gray-500"
        key={`progress-${Math.floor(progress * 100)}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        진행률: {Math.floor(progress * 100)}%
      </motion.div>
    </motion.div>
  );
}


export default function ResultCard({
  results,
  totalDiscount,
  totalPayment,
  unusedProducts,
  unusedCoupons,
  progress,
  isProgressVisible,
  hasResult,
}: ResultCardProps) {

  const animatedTotalPayment = useAnimatedNumber(totalPayment);
  const animatedTotalDiscount = useAnimatedNumber(totalDiscount);
  
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 shadow-sm flex flex-col items-center">
          <div className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">총 결제 금액</div>
          {!hasResult && isProgressVisible ? (
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-600 rounded animate-pulse mb-1" />
          ) : (
            <div className="text-2xl font-extrabold text-slate-700 dark:text-slate-200">
              {animatedTotalPayment.toLocaleString()}원
            </div>
          )}
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 shadow-sm flex flex-col items-center">
          <div className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">총 할인액</div>
          {!hasResult && isProgressVisible ? (
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-600 rounded animate-pulse mb-1" />
          ) : (
            <div className="text-2xl font-extrabold text-green-600 dark:text-green-400">
              {animatedTotalDiscount.toLocaleString()}원
            </div>
          )}
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence>
          {results.map((r) => {
            const subsetSum = r.applied.reduce((a, b) => a + b, 0);
            return (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 shadow-sm flex flex-col gap-2"
              >
                <div className="font-semibold text-slate-600 dark:text-slate-300">
                  쿠폰 적용한도 {r.couponAmount.toLocaleString()}원 / {r.percent}% 할인
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300">적용 상품: {r.applied.map((p) => p.toLocaleString() + "원").join(", ")}</div>
                <div className="text-xs text-gray-400 flex items-center gap-2">
                  <span>합계: {subsetSum.toLocaleString()}원</span>
                  {subsetSum > r.couponAmount && (
                    <span className="text-red-500 font-semibold">
                      (초과: {(subsetSum - r.couponAmount).toLocaleString()}원)
                    </span>
                  )}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 font-bold">할인액: {r.discount.toLocaleString()}원</div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      <ProgressSection
        isLoading={!hasResult && progress === 0}
        isProgressVisible={isProgressVisible}
        progress={progress}
      />

      {(hasResult || !isProgressVisible) && (
        <div className="flex flex-col gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
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
        </div>
      )}
    </div>
  );
}