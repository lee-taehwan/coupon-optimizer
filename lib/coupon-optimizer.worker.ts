/// <reference lib="webworker" />
import { v4 as uuidv4 } from 'uuid';

export interface Product {
  price: number;
  count: number;
}
export interface Coupon {
  amount: number;
  percent: number;
  count: number;
}
export interface CouponApplyResult {
  id?: string;
  couponAmount: number;
  percent: number;
  applied: number[];
  discount: number;
}

interface DpNode {
  product: Product & { id: string };
  prev: DpNode | null;
}

const findBestSubsetForCouponDP = (
  availableProducts: (Product & { id: string })[],
  coupon: { amount: number; percent: number },
  strategy: 'default' | 'no-exceed',
  progressCb?: (step: number, total: number) => void
) => {
  const { amount, percent } = coupon;
  const totalSum = availableProducts.reduce((sum, p) => sum + p.price, 0);

  const MAX_ARRAY_SIZE = 1000000;
  if (totalSum > MAX_ARRAY_SIZE) {
    // Fallback to greedy for very large sets where DP is not feasible
    return findBestSubsetGreedy(availableProducts, coupon, progressCb);
  }

  const dp: (DpNode | null)[] = new Array(totalSum + 1).fill(null);
  // Sentinel node to indicate a sum of 0 is possible with no products
  dp[0] = { product: { price: 0, count: 0, id: 'start' }, prev: null };

  const minSteps = 10;
  const dpProgressStep = Math.max(1, Math.floor(availableProducts.length / minSteps));

  for (let idx = 0; idx < availableProducts.length; idx++) {
    const product = availableProducts[idx];
    for (let j = totalSum; j >= product.price; j--) {
      // If we can form sum `j-price` and haven't yet formed sum `j`
      if (dp[j - product.price] !== null && dp[j] === null) {
        dp[j] = { product: product, prev: dp[j - product.price] };
      }
    }
    if (progressCb && (idx % dpProgressStep === 0 || idx === availableProducts.length - 1)) {
      progressCb(idx + 1, availableProducts.length);
    }
  }

  let bestSum = 0;
  let bestNode: DpNode | null = null;

  if (strategy === 'no-exceed') {
    for (let j = Math.min(amount, totalSum); j >= 0; j--) {
      if (dp[j] !== null) {
        bestSum = j;
        bestNode = dp[j];
        break;
      }
    }

    const largeItems = availableProducts.filter(p => p.price > amount);
    if (largeItems.length > 0) {
      const smallestLargeItem = largeItems.sort((a, b) => a.price - b.price)[0];
      const discountFromDP = Math.floor(bestSum * percent / 100);
      const discountFromLargeItem = Math.floor(amount * percent / 100);

      if (discountFromLargeItem > discountFromDP) {
        bestSum = smallestLargeItem.price;
        bestNode = { product: smallestLargeItem, prev: { product: { price: 0, count: 0, id: 'start' }, prev: null } };
      }
    }
  } else {
    for (let j = amount; j <= totalSum; j++) {
      if (dp[j] !== null) {
        bestSum = j;
        bestNode = dp[j];
        break;
      }
    }

    if (bestSum === 0) {
      for (let j = Math.min(amount - 1, totalSum); j >= 0; j--) {
        if (dp[j] !== null) {
          bestSum = j;
          bestNode = dp[j];
          break;
        }
      }
    }
  }

  const bestSubset: (Product & { id: string })[] = [];
  let currentNode = bestNode;

  while (currentNode !== null && currentNode.prev !== null) {
    bestSubset.push(currentNode.product);
    currentNode = currentNode.prev;
  }

  const bestDiscount = Math.floor(Math.min(bestSum, amount) * percent / 100);

  return { bestSubset, bestDiscount };
}

const findBestSubsetGreedy = (
  availableProducts: (Product & { id: string })[],
  coupon: { amount: number; percent: number },
  progressCb?: (step: number, total: number) => void
) => {
  const { amount, percent } = coupon;

  const sortedProducts = [...availableProducts].sort((a, b) => b.price - a.price);

  const bestSubset: (Product & { id: string })[] = [];
  let currentSum = 0;

  for (let i = 0; i < sortedProducts.length; i++) {
    const product = sortedProducts[i];
    bestSubset.push(product);
    currentSum += product.price;

    if (progressCb && (i % 5 === 0 || i === sortedProducts.length - 1)) {
      progressCb(i + 1, sortedProducts.length);
    }

    if (currentSum >= amount) {
      break;
    }
  }

  const bestDiscount = Math.floor(Math.min(currentSum, amount) * percent / 100);

  return { bestSubset, bestDiscount };
}

const runOptimization = (
  productPool: (Product & { id: string })[],
  couponList: Coupon[],
  strategy: 'default' | 'no-exceed',
  progressCb?: (type: string, payload: { value?: number; result?: CouponApplyResult; }) => void
): { results: CouponApplyResult[], totalDiscount: number } => {
  let totalDiscount = 0;
  const results: CouponApplyResult[] = [];
  const usedProductIds = new Set<string>();

  const totalWork = productPool.length * couponList.length;
  let currentWork = 0;

  for (let i = 0; i < couponList.length; i++) {
    const coupon = couponList[i];
    const availableProducts = productPool.filter(p => !usedProductIds.has(p.id));

    if (availableProducts.length === 0) break;

    const { bestSubset, bestDiscount } = findBestSubsetForCouponDP(
      availableProducts,
      coupon,
      strategy,
      (step, total) => {
        if (progressCb) {
          const couponProgress = step / total;
          const overallProgress = (currentWork + (couponProgress * availableProducts.length)) / (totalWork || 1);
          progressCb('progress', { value: Math.min(overallProgress, 0.99) });
        }
      }
    );
    currentWork += availableProducts.length;

    if (bestDiscount > 0) {
      totalDiscount += bestDiscount;
      bestSubset.forEach(p => usedProductIds.add(p.id));
      const newResult: CouponApplyResult = {
        id: uuidv4(),
        couponAmount: coupon.amount,
        percent: coupon.percent,
        applied: bestSubset.map(p => p.price),
        discount: bestDiscount,
      };
      results.push(newResult);
      if (progressCb) {
        progressCb('result', { result: newResult });
      }
    } else {
      if (progressCb) {
        progressCb('progress', { value: Math.min(currentWork / (totalWork || 1), 0.99) });
      }
    }
  }
  return { results, totalDiscount };
}

self.onmessage = async (event: MessageEvent<{ products: Product[], coupons: Coupon[], strategy?: 'default' | 'no-exceed' }>) => {
  const { products, coupons, strategy = 'default' } = event.data;

  const productPool = products.flatMap((p: Product) =>
    Array(p.count).fill(p.price).map((price, i) => ({ price, count: 1, id: `${p.price}-${i}` }))
  );

  const initialCouponList = coupons.flatMap((c: Coupon) =>
    Array(c.count).fill({ amount: c.amount, percent: c.percent })
  );

  if (initialCouponList.length === 0 || productPool.length === 0) {
    self.postMessage({ type: 'done' });
    return;
  }

  const sortedCoupons = [...initialCouponList].sort((a, b) => {
    if (strategy === 'no-exceed') return a.amount - b.amount || b.percent - a.percent;
    return b.percent - a.percent || b.amount - a.amount;
  });

  const primaryRun = runOptimization(productPool, sortedCoupons, strategy, (type, payload) => {
    self.postMessage({ type, ...payload });
  });
  self.postMessage({ type: 'done' });

  if (strategy === 'default') {
    const noExceedSortedCoupons = [...initialCouponList].sort((a, b) => a.amount - b.amount || b.percent - a.percent);
    const secondaryRun = runOptimization(productPool, noExceedSortedCoupons, 'no-exceed');

    if (secondaryRun.totalDiscount > primaryRun.totalDiscount) {
      self.postMessage({ type: 'recalculation-recommended' });
    }
  }
};

export { }; 