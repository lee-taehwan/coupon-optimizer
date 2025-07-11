'use client';

import ItemInput from "@/components/ItemInput";
import { useInputContext } from "@/context/InputContext";
import { encodeInputToQuery } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const { products, setProducts, coupons, setCoupons } = useInputContext();
  const hasProduct = products.length > 0;
  const hasCoupon = coupons.length > 0;
  const hasInput = hasProduct && hasCoupon;
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const resetAll = () => {
    setProducts([]);
    setCoupons([]);
  };

  const handleCalc = () => {
    if (!hasInput) {
      setShowModal(true);
      return;
    }

    const query = encodeInputToQuery(products, coupons);
    router.push(`/result?${query}`);
  };

  let modalMsg = "";
  if (!hasProduct && !hasCoupon) modalMsg = "상품과 쿠폰을 모두 추가해 주세요.";
  else if (!hasProduct) modalMsg = "상품을 하나 이상 추가해 주세요.";
  else if (!hasCoupon) modalMsg = "쿠폰을 하나 이상 추가해 주세요.";

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 min-w-[240px] flex flex-col items-center">
            <div className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">{modalMsg}</div>
            <button
              className="mt-2 px-4 py-2 rounded bg-slate-600 text-white font-bold hover:bg-slate-700 transition"
              onClick={() => setShowModal(false)}
            >
              확인
            </button>
          </div>
        </div>
      )}
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 mt-8 flex flex-col gap-8 border border-slate-200 dark:border-slate-700 transition-colors">
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
    </>
  );
}
