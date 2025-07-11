import { Product, Coupon } from "@/context/InputContext";

export interface CouponApplyResult {
  id?: string;
  couponAmount: number;
  percent: number;
  applied: number[];
  discount: number;
}

/**
 * 비동기 최적화 함수 (Web Worker 사용)
 */
export function createCouponOptimizerAsync(products: Product[], coupons: Coupon[]) {
  let worker: Worker | null = null;

  async function run(
    onResult: (partial: CouponApplyResult[], done: boolean, progress: number) => void,
    onRecalculationRecommended: () => void,
    strategy: 'default' | 'no-exceed' = 'default'
  ) {
    if (worker) {
      worker.terminate();
    }

    worker = new Worker(new URL('../workers/coupon-optimizer.worker.ts', import.meta.url), {
        type: 'module',
    });

    let currentProgress = 0;

    worker.onmessage = (event: MessageEvent) => {
      const { type, value, result } = event.data;

      if (type === 'progress') {
        currentProgress = value;
        onResult([], false, currentProgress);
      } else if (type === 'result') {
        onResult([result], false, currentProgress);
      } else if (type === 'recalculation-recommended') {
        onRecalculationRecommended();
      } else if (type === 'done') {
        onResult([], true, 1);
      }
    };

    worker.onerror = (error) => {
      console.error("Web worker error:", error);
      onResult([], true, 1);
      if (worker) {
        worker.terminate();
        worker = null;
      }
    };
    
    worker.postMessage({ products, coupons, strategy });
  }

  return { run };
}