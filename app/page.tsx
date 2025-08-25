'use client';

import { ItemInput } from "@/components/forms";
import { useInputContext } from "@/store/InputContext";
import { encodeInputToQuery } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { InputModal } from "@/components/ui";

export default function Home() {
  const { products, setProducts, coupons, setCoupons } = useInputContext();
  const hasProduct = products.length > 0;
  const hasCoupon = coupons.length > 0;
  const hasInput = hasProduct && hasCoupon;
  const [modalMsg, setModalMsg] = useState('');
  const router = useRouter();

  const resetAll = () => {
    setProducts([]);
    setCoupons([]);
    // 페이지 최상단으로 스크롤 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCalc = () => {
    let errorMsg = "";
    if (!hasProduct && !hasCoupon) errorMsg = "상품과 쿠폰을 모두 추가해 주세요.";
    else if (!hasProduct) errorMsg = "상품을 하나 이상 추가해 주세요.";
    else if (!hasCoupon) errorMsg = "쿠폰을 하나 이상 추가해 주세요.";

    if(errorMsg) {
      setModalMsg(errorMsg);
      return;
    }

    const query = encodeInputToQuery(products, coupons);
    router.push(`/result?${query}`, { scroll: true });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <InputModal open={!!modalMsg} message={modalMsg} onClose={() => setModalMsg('')} />
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 flex flex-col gap-8 border border-slate-200 dark:border-slate-700 transition-colors">
        <ItemInput
          type="product"
          items={products}
          setItems={setProducts}
        />
        <ItemInput
          type="coupon"
          items={coupons}
          setItems={setCoupons}
        />
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch mt-2">
          <button
            type="button"
            onClick={resetAll}
            className="flex-1 px-4 py-3 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition font-semibold min-w-[120px]"
          >
            전체 초기화
          </button>
          <button
            type="button"
            onClick={handleCalc}
            className={`flex-1 px-4 py-3 rounded font-bold shadow transition min-w-[120px] ${
              hasInput
                ? 'bg-slate-600 text-white hover:bg-slate-700'
                : 'bg-slate-400 text-white cursor-not-allowed'
            }`}
          >
            계산하기
          </button>
        </div>
      </div>
    </div>
  );
}
